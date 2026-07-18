#!/usr/bin/env python3
"""
analyze-mobile.py

Mechanically compares each mobile page under /m/ (and /m/blog/) against its
desktop counterpart and writes a Markdown report: mobile-analysis-report.md

What it reports per page:
  - mobile vs desktop file size
  - last-modified dates (flags when desktop is NEWER than mobile -> needs mirroring)
  - <title> and meta description differences
  - presence of shared elements (Client Portal link, Submit a Ticket link,
    607 Shelby address, newsletter block, CEO snippet)
  - broken/placeholder internal links (links whose target file does not exist)
  - rough content-drift signal (visible word count difference)

This is a MECHANICAL comparison only. It does not judge copy quality.
"""

import os
import re
import html
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
M_DIR = os.path.join(ROOT, "m")
REPORT = os.path.join(ROOT, "mobile-analysis-report.md")

# Markers for the shared "adaptation" elements we added to the home page.
SHARED_MARKERS = {
    "Client Portal link": re.compile(r"portal\.html", re.I),
    "Submit a Ticket link": re.compile(r"submit-ticket\.html", re.I),
    "Footer address (607 Shelby)": re.compile(r"607\s+Shelby", re.I),
    "Newsletter block": re.compile(r"newsletter|subscribe", re.I),
    "CEO snippet": re.compile(r"\bCEO\b", re.I),
}

TAG_RE = re.compile(r"<[^>]+>")
SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b.*?</\1>", re.S | re.I)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S | re.I)
META_DESC_RE = re.compile(
    r'<meta[^>]+name=["\']description["\'][^>]*content=["\'](.*?)["\']', re.I
)
# internal href/src targets (skip external, anchors, tel, mailto, data)
LINK_RE = re.compile(r'(?:href|src)=["\']([^"\']+)["\']', re.I)


def read(path):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except OSError:
        return None


def mtime(path):
    try:
        return datetime.fromtimestamp(os.path.getmtime(path))
    except OSError:
        return None


def visible_word_count(text):
    if not text:
        return 0
    t = SCRIPT_STYLE_RE.sub(" ", text)
    t = TAG_RE.sub(" ", t)
    t = html.unescape(t)
    return len(t.split())


def get_title(text):
    m = TITLE_RE.search(text or "")
    return html.unescape(m.group(1).strip()) if m else ""


def get_desc(text):
    m = META_DESC_RE.search(text or "")
    return html.unescape(m.group(1).strip()) if m else ""


def check_links(text, page_path):
    """Return list of internal link targets whose resolved file does not exist."""
    broken = []
    if not text:
        return broken
    base = os.path.dirname(page_path)
    seen = set()
    for raw in LINK_RE.findall(text):
        target = raw.strip()
        low = target.lower()
        if (
            not target
            or target.startswith("#")
            or low.startswith(("http://", "https://", "tel:", "mailto:", "data:", "javascript:", "//"))
        ):
            continue
        # strip query/anchor
        clean = target.split("#")[0].split("?")[0]
        if not clean or clean in seen:
            continue
        seen.add(clean)
        resolved = os.path.normpath(os.path.join(base, clean))
        # only check things that look like local html/css/js/asset paths
        if not os.path.exists(resolved):
            broken.append(target)
    return sorted(broken)


def find_mobile_pages():
    """Return list of (mobile_path, desktop_path) tuples."""
    pairs = []
    for dirpath, _dirs, files in os.walk(M_DIR):
        for fn in files:
            if not fn.lower().endswith(".html"):
                continue
            mpath = os.path.join(dirpath, fn)
            rel = os.path.relpath(mpath, M_DIR)  # e.g. about.html or blog/foo.html
            dpath = os.path.join(ROOT, rel)       # desktop counterpart
            pairs.append((mpath, dpath))
    return sorted(pairs, key=lambda p: os.path.relpath(p[0], M_DIR))


def analyze_pair(mpath, dpath):
    rel = os.path.relpath(mpath, M_DIR)
    mtext = read(mpath)
    dtext = read(dpath) if os.path.exists(dpath) else None

    lines = []
    lines.append(f"### `m/{rel}`")

    # counterpart
    if dtext is None:
        lines.append("- **Desktop counterpart:** MISSING (no matching desktop page)")
    else:
        lines.append(f"- **Desktop counterpart:** `{os.path.relpath(dpath, ROOT)}`")

    # sizes
    msize = len(mtext or "")
    if dtext is not None:
        dsize = len(dtext)
        lines.append(f"- **Size:** mobile {msize:,} bytes vs desktop {dsize:,} bytes")

    # dates
    mt = mtime(mpath)
    dt = mtime(dpath) if dtext is not None else None
    if mt and dt:
        newer = "desktop NEWER \u2192 likely needs mirroring" if dt > mt else "mobile up to date or newer"
        lines.append(
            f"- **Modified:** mobile {mt:%Y-%m-%d} vs desktop {dt:%Y-%m-%d} \u2014 {newer}"
        )

    # title / desc
    if dtext is not None:
        mt_title, dt_title = get_title(mtext), get_title(dtext)
        if mt_title != dt_title:
            lines.append(f"- **Title differs:**")
            lines.append(f"    - mobile: {mt_title or '(none)'}")
            lines.append(f"    - desktop: {dt_title or '(none)'}")
        mt_desc, dt_desc = get_desc(mtext), get_desc(dtext)
        if mt_desc != dt_desc:
            lines.append(f"- **Meta description differs** (mobile {len(mt_desc)} chars vs desktop {len(dt_desc)} chars)")

    # content drift
    if dtext is not None:
        mw, dw = visible_word_count(mtext), visible_word_count(dtext)
        diff = dw - mw
        if dw:
            pct = (diff / dw) * 100
        else:
            pct = 0
        lines.append(
            f"- **Visible words:** mobile {mw} vs desktop {dw} "
            f"(desktop has {diff:+d}, {pct:+.0f}%)"
        )

    # shared markers
    missing = [name for name, rx in SHARED_MARKERS.items() if not rx.search(mtext or "")]
    if missing:
        lines.append(f"- **Missing shared elements:** {', '.join(missing)}")
    else:
        lines.append("- **Shared elements:** all present")

    # broken links
    broken = check_links(mtext, mpath)
    if broken:
        lines.append(f"- **Broken/placeholder links ({len(broken)}):** {', '.join(broken)}")

    lines.append("")
    return rel, "\n".join(lines)


def main():
    pairs = find_mobile_pages()
    service_pages = [(m, d) for m, d in pairs if os.sep + "blog" + os.sep not in m]
    blog_pages = [(m, d) for m, d in pairs if os.sep + "blog" + os.sep in m]

    out = []
    out.append("# Mobile Site Analysis Report")
    out.append(f"_Generated {datetime.now():%Y-%m-%d %H:%M}_")
    out.append("")
    out.append(f"- Mobile pages scanned: **{len(pairs)}** "
               f"({len(service_pages)} service/info, {len(blog_pages)} blog)")
    out.append("- Comparison is mechanical (size, dates, title/desc, word count, "
               "shared elements, broken links). Copy-quality judgment is not included.")
    out.append("")

    # quick summary table of pages where desktop is newer
    out.append("## Quick Summary")
    newer_list = []
    for mpath, dpath in pairs:
        if not os.path.exists(dpath):
            continue
        mt, dt = mtime(mpath), mtime(dpath)
        if mt and dt and dt > mt:
            newer_list.append(os.path.relpath(mpath, M_DIR))
    out.append(f"- Pages where **desktop is newer** than mobile (candidates for mirroring): "
               f"**{len(newer_list)}**")
    if newer_list:
        out.append("    - " + ", ".join(f"`{p}`" for p in newer_list))
    out.append("")

    out.append("## Service / Info Pages")
    out.append("")
    for mpath, dpath in service_pages:
        _, block = analyze_pair(mpath, dpath)
        out.append(block)

    out.append("## Blog Pages")
    out.append("")
    for mpath, dpath in blog_pages:
        _, block = analyze_pair(mpath, dpath)
        out.append(block)

    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(out))

    print(f"Done. Analyzed {len(pairs)} mobile pages.")
    print(f"Report written to: {REPORT}")


if __name__ == "__main__":
    main()
