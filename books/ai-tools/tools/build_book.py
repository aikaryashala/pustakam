#!/usr/bin/env python3
"""Build the "AI Tools and Applications" book in docs/ai-tools from the Markdown chapters in books/ai-tools/src/.

Each chapter in books/ai-tools/src/ becomes one HTML page. books/ai-tools/src/index.md becomes the contents page.
Only a small part of Markdown is supported: headings, paragraphs, lists, fenced code,
tables, bold, italic, inline code and links. A fenced block marked ```prompt is shown as a
prompt box.

Usage: python3 books/ai-tools/tools/build_book.py
"""

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]  # books/ai-tools/tools -> repo root
SRC = ROOT / "books" / "ai-tools" / "src"
OUT = ROOT / "docs" / "ai-tools"
TEMPLATE = Path(__file__).resolve().parent / "book_template.html"

# (unit title, [(file stem, chapter title), ...])
UNITS = [
    ("Unit I · Introduction to AI Tools", [
        ("01-what-is-ai", "What is AI?"),
        ("02-how-ai-learns", "How AI learns"),
        ("03-generative-ai-and-llms", "Generative AI and LLMs"),
        ("04-applications", "Where Generative AI is used"),
        ("05-the-tools", "The tools: ChatGPT, Gemini, NotebookLM, AI Studio"),
        ("06-responsible-ai", "Responsible AI"),
    ]),
    ("Unit II · Prompt Engineering", [
        ("07-prompt-engineering", "Writing good prompts"),
        ("08-prompt-types", "Types of prompts"),
        ("09-writing-and-summarizing", "Writing and summarizing with AI"),
        ("10-documents", "Documents for a given context"),
        ("11-greeting-cards", "Greeting cards with images and animation"),
    ]),
    ("Unit III · AI Tools for Coding", [
        ("12-generating-code", "Generating code with AI"),
        ("13-debugging", "Debugging with a second AI tool"),
        ("14-converting-code", "Changing code from one language to another"),
        ("15-test-cases", "Test case generation"),
    ]),
    ("Unit IV · Presentations with AI", [
        ("16-gamma", "Slides with Gamma AI"),
        ("17-gemini-slides", "Slides with Gemini AI"),
        ("18-multimedia", "Adding audio, video, animation and music"),
    ]),
    ("Unit V · Applications and the Future", [
        ("19-ai-apps", "Building an AI-enabled application"),
        ("20-workflow-automation", "AI workflow automation"),
        ("21-future-trends", "Future trends in Generative AI"),
    ]),
    ("Appendix", [
        ("22-lab-guide", "Lab experiments guide"),
    ]),
]

CHAPTERS = [(stem, title, unit) for unit, chs in UNITS for stem, title in chs]


def esc(text):
    return html.escape(text, quote=False)


# ── inline markdown ──────────────────────────────────────────────────────────

INLINE_CODE = re.compile(r"`([^`]+)`")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*(.+?)\*\*")
ITALIC = re.compile(r"(?<![\w*])\*([^*]+?)\*(?![\w*])")


def inline(text):
    # Protect code spans first so nothing inside them is changed.
    codes = []

    def keep(m):
        codes.append(f"<code>{esc(m.group(1))}</code>")
        return f"\x00{len(codes) - 1}\x00"

    text = INLINE_CODE.sub(keep, text)
    text = esc(text)

    def link(m):
        label, url = m.group(1), m.group(2)
        extra = ' target="_blank" rel="noopener noreferrer"' if url.startswith("http") else ""
        return f'<a href="{url}"{extra}>{label}</a>'

    text = LINK.sub(link, text)
    text = BOLD.sub(r"<strong>\1</strong>", text)
    text = ITALIC.sub(r"<em>\1</em>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], text)


# ── block markdown ───────────────────────────────────────────────────────────

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def table(lines):
    rows = [[c.strip() for c in ln.strip().strip("|").split("|")] for ln in lines]
    head, body = rows[0], rows[2:]
    out = ["<table>", "<thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead>", "<tbody>"]
    for r in body:
        out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
    out += ["</tbody>", "</table>"]
    return "\n".join(out)


def convert(md):
    """Return (html, title) for one Markdown file. Sections are wrapped so that
    'New words' and 'Try it' get their own styling."""
    lines = md.splitlines()
    out = []
    title = ""
    section_open = False
    i = 0

    def close_section():
        nonlocal section_open
        if section_open:
            out.append("</section>")
            section_open = False

    while i < len(lines):
        ln = lines[i]

        if ln.startswith("```"):
            lang = ln[3:].strip()
            j = i + 1
            buf = []
            while j < len(lines) and not lines[j].startswith("```"):
                buf.append(lines[j])
                j += 1
            code = esc("\n".join(buf))
            if lang == "prompt":
                out.append(f'<div class="prompt"><span class="prompt-label">prompt</span><pre>{code}</pre></div>')
            else:
                out.append(f'<pre class="code"><code>{code}</code></pre>')
            i = j + 1
            continue

        if ln.startswith("# "):
            title = ln[2:].strip()
            i += 1
            continue

        if ln.startswith("## "):
            close_section()
            heading = ln[3:].strip()
            kind = {"new words": "words", "try it": "try"}.get(heading.lower(), "")
            cls = f' class="{kind}"' if kind else ""
            out.append(f'<section{cls} id="{slug(heading)}">')
            section_open = True
            out.append(f"<h2>{inline(heading)}</h2>")
            i += 1
            continue

        if ln.startswith("### "):
            out.append(f"<h3>{inline(ln[4:].strip())}</h3>")
            i += 1
            continue

        if ln.startswith("|"):
            j = i
            while j < len(lines) and lines[j].startswith("|"):
                j += 1
            out.append(table(lines[i:j]))
            i = j
            continue

        m = re.match(r"^(-|\d+\.) ", ln)
        if m:
            tag = "ul" if m.group(1) == "-" else "ol"
            items = []
            while i < len(lines) and re.match(r"^(-|\d+\.) ", lines[i]):
                items.append(re.sub(r"^(-|\d+\.) ", "", lines[i]))
                i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{inline(it)}</li>" for it in items) + f"</{tag}>")
            continue

        if ln.startswith("> "):
            buf = []
            while i < len(lines) and lines[i].startswith("> "):
                buf.append(lines[i][2:])
                i += 1
            out.append(f'<div class="note">{inline(" ".join(buf))}</div>')
            continue

        if ln.strip() == "":
            i += 1
            continue

        buf = [ln]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#|```|\||- |\d+\. |> )", lines[i]):
            buf.append(lines[i])
            i += 1
        out.append(f"<p>{inline(' '.join(buf))}</p>")

    close_section()
    return "\n".join(out), title


# ── page assembly ────────────────────────────────────────────────────────────

def contents_nav(current):
    parts = ['<nav class="toc" aria-label="Chapters">']
    parts.append(f'<a class="toc-home{" current" if current == "index" else ""}" href="index.html">Contents</a>')
    n = 0
    for unit, chs in UNITS:
        parts.append(f'<p class="toc-unit">{esc(unit)}</p>')
        for stem, ctitle in chs:
            n += 1
            cls = ' class="current"' if stem == current else ""
            parts.append(f'<a{cls} href="{stem}.html"><span class="toc-num">{n}</span>{esc(ctitle)}</a>')
    parts.append("</nav>")
    return "\n".join(parts)


def prev_next(idx):
    links = []
    if idx > 0:
        stem, t, _ = CHAPTERS[idx - 1]
        links.append(f'<a class="pn-prev" href="{stem}.html"><span>← previous</span>{esc(t)}</a>')
    else:
        links.append('<a class="pn-prev" href="index.html"><span>← back</span>Contents</a>')
    if idx + 1 < len(CHAPTERS):
        stem, t, _ = CHAPTERS[idx + 1]
        links.append(f'<a class="pn-next" href="{stem}.html"><span>next →</span>{esc(t)}</a>')
    else:
        links.append('<a class="pn-next" href="index.html"><span>back to →</span>Contents</a>')
    return '<div class="prev-next">' + "".join(links) + "</div>"


def render(template, *, title, eyebrow, body, nav, footer_nav, description):
    page = template
    for k, v in {
        "TITLE": esc(title),
        "EYEBROW": esc(eyebrow),
        "BODY": body,
        "NAV": nav,
        "PREV_NEXT": footer_nav,
        "DESCRIPTION": esc(description),
    }.items():
        page = page.replace("{{" + k + "}}", v)
    return page


def main():
    template = TEMPLATE.read_text(encoding="utf-8")
    OUT.mkdir(parents=True, exist_ok=True)

    body, title = convert((SRC / "index.md").read_text(encoding="utf-8"))
    (OUT / "index.html").write_text(render(
        template, title=title, eyebrow="a simple book for first year students", body=body,
        nav=contents_nav("index"), footer_nav="",
        description="AI Tools and Applications, in simple English, for first year B.Tech students of GVPIHLR, Visakhapatnam.",
    ), encoding="utf-8")

    for idx, (stem, ctitle, unit) in enumerate(CHAPTERS):
        src = SRC / f"{stem}.md"
        body, title = convert(src.read_text(encoding="utf-8"))
        if title != ctitle:
            raise SystemExit(f"{src.name}: heading '{title}' does not match the list in build_book.py ('{ctitle}')")
        (OUT / f"{stem}.html").write_text(render(
            template, title=f"{idx + 1}. {title}", eyebrow=unit, body=body,
            nav=contents_nav(stem), footer_nav=prev_next(idx),
            description=f"{title} – AI Tools and Applications, a simple book for first year students.",
        ), encoding="utf-8")

    print(f"Wrote {len(CHAPTERS) + 1} pages to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
