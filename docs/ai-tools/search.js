/* Search for the "AI Tools and Applications" book.
 *
 * search-index.js (written by books/ai-tools/tools/build_book.py) holds one entry per
 * section of every chapter: {p: page, c: chapter number, t: chapter title, h: section
 * heading, a: section id, x: plain text}. It is loaded the first time the reader types.
 * Clicking a result opens the section; the words searched for are then highlighted there.
 */
(function () {
  "use strict";

  var MAX_RESULTS = 20;
  var SNIPPET = 150;
  var STORE_KEY = "ai-tools-book-search";

  var form = document.querySelector(".book-search");
  if (!form) return;
  var input = form.querySelector("input");
  var clearBtn = form.querySelector(".book-search-clear");
  var panel = form.querySelector(".book-search-results");

  var index = null;      // array of entries once search-index.js has loaded
  var loading = null;    // promise while loading
  var active = -1;       // keyboard-selected result
  var lastWords = [];

  // ── loading the index ──────────────────────────────────────────────────────
  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "search-index.js";
      s.onload = function () { index = window.BOOK_INDEX || []; resolve(index); };
      s.onerror = function () { loading = null; reject(new Error("could not load search-index.js")); };
      document.head.appendChild(s);
    });
    return loading;
  }

  // ── matching ───────────────────────────────────────────────────────────────
  function words(q) {
    return q.toLowerCase().split(/[^a-z0-9+#.]+/).filter(function (w) { return w.length >= 2; });
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function search(q) {
    var ws = words(q);
    if (!ws.length) return [];
    var phrase = q.trim().toLowerCase();
    var hits = [];
    for (var i = 0; i < index.length; i++) {
      var e = index[i];
      var head = (e.t + " " + e.h).toLowerCase();
      var body = e.x.toLowerCase();
      var score = 0, ok = true;
      for (var j = 0; j < ws.length; j++) {
        var w = ws[j];
        var inHead = head.indexOf(w) !== -1;
        var inBody = body.indexOf(w) !== -1;
        if (!inHead && !inBody) { ok = false; break; }
        if (inHead) score += 10;
        if (inBody) score += 1 + Math.min(5, count(body, w));
      }
      if (!ok) continue;
      if (ws.length > 1 && (head.indexOf(phrase) !== -1 || body.indexOf(phrase) !== -1)) score += 8;
      if (e.h.toLowerCase().indexOf(phrase) === 0) score += 5;
      hits.push({ e: e, s: score });
    }
    hits.sort(function (a, b) { return b.s - a.s || a.e.c - b.e.c; });
    return hits.slice(0, MAX_RESULTS).map(function (h) { return h.e; });
  }

  function count(text, w) {
    var n = 0, p = 0;
    while ((p = text.indexOf(w, p)) !== -1) { n++; p += w.length; }
    return n;
  }

  // ── rendering ──────────────────────────────────────────────────────────────
  function markText(text, re, parent) {
    // Append `text` to `parent`, wrapping every match of `re` in <mark>.
    var last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var mk = document.createElement("mark");
      mk.textContent = m[0];
      parent.appendChild(mk);
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function snippet(text, re) {
    re.lastIndex = 0;
    var m = re.exec(text);
    if (!m) return text.slice(0, SNIPPET) + (text.length > SNIPPET ? "…" : "");
    var start = Math.max(0, m.index - Math.floor(SNIPPET / 3));
    if (start > 0) { var sp = text.lastIndexOf(" ", start); if (sp > start - 20 && sp > 0) start = sp + 1; }
    var end = Math.min(text.length, start + SNIPPET);
    if (end < text.length) { var sp2 = text.indexOf(" ", end); if (sp2 !== -1 && sp2 < end + 20) end = sp2; }
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  function wordRegex(ws) {
    return new RegExp(ws.map(escapeRe).join("|"), "gi");
  }

  function show(results, q) {
    panel.innerHTML = "";
    active = -1;
    var ws = words(q);
    lastWords = ws;
    if (!ws.length) { hide(); return; }
    if (!results.length) {
      var none = document.createElement("p");
      none.className = "book-search-empty";
      none.textContent = "Nothing found for “" + q.trim() + "”.";
      panel.appendChild(none);
    } else {
      var re = wordRegex(ws);
      results.forEach(function (e, i) {
        var a = document.createElement("a");
        a.className = "book-search-hit";
        a.setAttribute("role", "option");
        a.id = "book-search-hit-" + i;
        a.href = e.p + (e.a ? "#" + e.a : "");
        a.addEventListener("click", function () { remember(q); });

        var where = document.createElement("span");
        where.className = "book-search-where";
        where.textContent = e.c ? e.c + ". " + e.t : e.t;
        a.appendChild(where);

        var title = document.createElement("span");
        title.className = "book-search-title";
        markText(e.h || e.t, re, title);
        a.appendChild(title);

        var text = document.createElement("span");
        text.className = "book-search-text";
        markText(snippet(e.x, re), re, text);
        a.appendChild(text);

        panel.appendChild(a);
      });
      var foot = document.createElement("p");
      foot.className = "book-search-count";
      foot.textContent = results.length === 1 ? "1 section" :
        (results.length === MAX_RESULTS ? "Top " + MAX_RESULTS + " sections" : results.length + " sections");
      panel.appendChild(foot);
    }
    panel.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function hide() {
    panel.hidden = true;
    panel.innerHTML = "";
    active = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function setActive(n) {
    var items = panel.querySelectorAll(".book-search-hit");
    if (!items.length) return;
    if (active >= 0) items[active].classList.remove("is-active");
    active = (n + items.length) % items.length;
    items[active].classList.add("is-active");
    items[active].scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", items[active].id);
  }

  function remember(q) {
    try { sessionStorage.setItem(STORE_KEY, q.trim()); } catch (e) { /* private mode */ }
  }

  // ── events ─────────────────────────────────────────────────────────────────
  var timer = null;
  function onInput() {
    var q = input.value;
    clearBtn.hidden = !q;
    clearTimeout(timer);
    if (!words(q).length) { hide(); return; }
    timer = setTimeout(function () {
      if (!index) {
        panel.innerHTML = '<p class="book-search-empty">Loading…</p>';
        panel.hidden = false;
      }
      loadIndex().then(function () {
        if (input.value !== q) return; // a newer query took over
        show(search(q), q);
      }, function () {
        panel.innerHTML = '<p class="book-search-empty">Search is not available right now.</p>';
        panel.hidden = false;
      });
    }, index ? 60 : 0);
  }

  input.addEventListener("input", onInput);
  input.addEventListener("focus", function () { loadIndex().catch(function () {}); if (input.value) onInput(); });

  input.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowDown") { ev.preventDefault(); setActive(active + 1); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); setActive(active - 1); }
    else if (ev.key === "Enter") {
      var items = panel.querySelectorAll(".book-search-hit");
      if (!items.length) return;
      ev.preventDefault();
      remember(input.value);
      items[active >= 0 ? active : 0].click();
    }
    else if (ev.key === "Escape") {
      if (!panel.hidden) { hide(); } else { input.value = ""; clearBtn.hidden = true; input.blur(); }
    }
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    clearBtn.hidden = true;
    hide();
    input.focus();
  });

  document.addEventListener("click", function (ev) {
    if (!form.contains(ev.target)) hide();
  });

  // "/" anywhere on the page jumps to the search box.
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "/" || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var t = ev.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    ev.preventDefault();
    input.focus();
    input.select();
  });

  // ── highlight the searched words on the page that was opened ───────────────
  function highlightOnPage() {
    var q;
    try { q = sessionStorage.getItem(STORE_KEY); sessionStorage.removeItem(STORE_KEY); } catch (e) { return; }
    if (!q) return;
    var ws = words(q);
    if (!ws.length) return;
    var root = null;
    if (location.hash) root = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!root) root = document.querySelector("article.chapter");
    if (!root) return;

    var re = wordRegex(ws);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|MARK)$/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        re.lastIndex = 0;
        return re.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment();
      markText(n.nodeValue, re, frag);
      frag.querySelectorAll("mark").forEach(function (m) { m.className = "search-hit"; });
      n.parentNode.replaceChild(frag, n);
    });

    var first = root.querySelector("mark.search-hit");
    if (first && !location.hash) first.scrollIntoView({ block: "center" });
    input.value = q;
    clearBtn.hidden = false;
  }

  highlightOnPage();
})();
