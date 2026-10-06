/* Shared renderer for all worksheet / question-bank / answer-key viewers.
   Expects in the page: #status, #content, marked.js and highlight.js already
   loaded, and a body class of "worksheet", "questions", or "answers".
   The markdown file is derived from the page's own name: <name>.html → <name>.md */

(function () {
  const statusEl = document.getElementById('status');
  const contentEl = document.getElementById('content');

  const page = decodeURIComponent(location.pathname.split('/').pop() || '');
  const MD_FILE = page.replace(/\.html$/i, '.md');

  const kind =
    document.body.classList.contains('questions') ? 'questions' :
    document.body.classList.contains('answers')   ? 'answers'   :
    'worksheet';
  const kindTitle = kind.charAt(0).toUpperCase() + kind.slice(1);

  // e.g. "task7/pipes_and_redirections_worksheet.html" — for the localhost hint
  const parts = location.pathname.split('/').filter(Boolean);
  const servedPath = parts.slice(-2).join('/');

  function showError(title, lines) {
    statusEl.outerHTML =
      '<div class="errbox" role="alert"><h2>' + title + '</h2>' + lines.join('') + '</div>';
  }

  async function render() {
    if (!window.marked) {
      showError('Markdown renderer didn’t load',
        ['<p>The marked.js library couldn’t be reached from the CDN. Check your internet connection and reload.</p>']);
      return;
    }
    marked.setOptions({ gfm: true, breaks: false });

    try {
      const res = await fetch(MD_FILE, { cache: 'no-cache' });
      if (!res.ok) throw new Error('http-' + res.status);
      const md = await res.text();

      contentEl.innerHTML = marked.parse(md);

      // Highlight only blocks whose language is known; leave ASCII diagrams plain.
      contentEl.querySelectorAll('pre code').forEach(block => {
        const m = (block.className || '').match(/language-([\w-]+)/);
        const lang = m && m[1];
        if (lang && window.hljs && hljs.getLanguage(lang)) {
          hljs.highlightElement(block);
        }
      });

      document.title = (contentEl.querySelector('h1')?.textContent || document.title).trim();
      statusEl.remove();
      contentEl.hidden = false;
      document.body.classList.add('ready');
    } catch (err) {
      const isFile = location.protocol === 'file:';
      if (isFile) {
        showError('Open this over a local server, not as a file',
          ['<p>Browsers block a page opened with <code>file://</code> from reading other local files, so the ' + kind + ' can’t be fetched yet. Serve the <code>docs</code> folder (the one containing the task folders and <code>assets/</code>) over HTTP and reload:</p>',
           '<pre>cd path/to/docs\npython3 -m http.server 8000</pre>',
           '<p>Then open <code>http://localhost:8000/' + servedPath + '</code></p>']);
      } else {
        showError(kindTitle + ' file not found',
          ['<p>Couldn’t load <code>' + MD_FILE + '</code> next to this page. Keep both files in the same folder, then reload.</p>']);
      }
    }
  }

  render();
})();
