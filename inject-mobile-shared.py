#!/usr/bin/env python3
"""
inject-mobile-shared.py

Bulk-injects shared elements into mobile (/m/) pages:
  - Client Portal + Submit a Ticket links in the nav drawer  -> ALL /m/ pages
  - Physical footer address (607 Shelby St, Detroit, MI 48226) -> ALL /m/ pages
  - Newsletter signup block -> SERVICE/INFO pages only (not blog posts)
  - CEO snippet -> home only (handled manually already; skipped here)

Safety:
  - Skips m/index.html (already updated by hand)
  - Idempotent: if an element is already present, it is not added again
  - If it cannot find the nav drawer or footer on a page, it SKIPS that page
    and logs it. It never force-edits unknown markup.
  - Run with --dry-run to preview without writing.

Path handling:
  - Service/info pages live in /m/ and reference sibling pages directly
    (portal.html).
  - Blog pages live in /m/blog/ and reference /m/ pages via ../../m/ prefix
    (../../m/portal.html), matching their existing nav links.
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
M_DIR = os.path.join(ROOT, "m")
BLOG_DIR = os.path.join(M_DIR, "blog")

DRY_RUN = "--dry-run" in sys.argv

ADDRESS_TEXT = "607 Shelby St, Detroit, MI 48226"

# The nav drawer's final link is always the "Get Free Quote" anchor.
# We insert the two new links immediately BEFORE that anchor.
GET_QUOTE_ANCHOR_RE = re.compile(
    r'(<a href="[^"]*get-quote\.html"[^>]*>\s*<i class="bi bi-file-text"></i>\s*Get Free Quote</a>)',
    re.I,
)


def nav_links(prefix):
    """Return the two nav links with the correct relative prefix."""
    return (
        f'<a href="{prefix}portal.html"><i class="bi bi-box-arrow-in-right"></i> Client Portal</a>'
        f'<a href="{prefix}submit-ticket.html"><i class="bi bi-life-preserver"></i> Submit a Ticket</a>'
    )


def address_block():
    return (
        '<p style="margin-top:.5rem;font-style:normal;">'
        '<i class="bi bi-geo-alt-fill"></i> ' + ADDRESS_TEXT + "</p>"
    )


def newsletter_block():
    return (
        '\n  <!-- Newsletter -->\n'
        '  <section class="section" style="background:var(--gray-900);color:white;text-align:center;">\n'
        '    <h2 class="section-title" style="color:white;">Stay in the Loop</h2>\n'
        '    <p class="section-sub" style="color:rgba(255,255,255,0.8);">Get IT tips, security alerts, and Metro Detroit business insights in your inbox.</p>\n'
        '    <form onsubmit="return false;" aria-label="Newsletter signup" style="display:flex;flex-direction:column;gap:0.75rem;max-width:360px;margin:0 auto;">\n'
        '      <input type="email" name="email" placeholder="Your email address" required aria-label="Email address" style="padding:0.875rem 1rem;border-radius:var(--radius);border:none;font-size:1rem;min-height:48px;width:100%;">\n'
        '      <button type="submit" class="btn" style="background:white;color:var(--primary);font-weight:700;width:100%;"><i class="bi bi-envelope-paper"></i> Subscribe</button>\n'
        '    </form>\n'
        '    <p style="font-size:0.75rem;opacity:0.6;margin-top:0.75rem;">We respect your privacy. Unsubscribe anytime.</p>\n'
        '  </section>\n'
    )


def find_mobile_html():
    pages = []
    for dirpath, _dirs, files in os.walk(M_DIR):
        for fn in files:
            if fn.lower().endswith(".html"):
                pages.append(os.path.join(dirpath, fn))
    return sorted(pages)


def inject_nav(text, prefix):
    """Insert Client Portal + Submit a Ticket before the Get Free Quote nav link."""
    if "portal.html" in text and "submit-ticket.html" in text:
        return text, False, None  # already present
    m = GET_QUOTE_ANCHOR_RE.search(text)
    if not m:
        return text, False, "no Get-Free-Quote nav anchor found"
    insertion = nav_links(prefix) + m.group(1)
    new_text = text[: m.start()] + insertion + text[m.end():]
    return new_text, True, None


def inject_address(text):
    """Insert the address into the footer, after the first © 2026 paragraph."""
    if "607 Shelby" in text:
        return text, False, None  # already present
    # match the copyright paragraph inside footer; insert address right after it
    copyright_re = re.compile(r'(<p>©\s*2026[^<]*</p>)', re.I)
    m = copyright_re.search(text)
    if not m:
        return text, False, "no '© 2026' footer paragraph found"
    new_text = text[: m.end()] + address_block() + text[m.end():]
    return new_text, True, None


def inject_newsletter(text):
    """Insert newsletter section right before the closing </footer> ... actually
    before the <footer to keep it above the footer block."""
    if re.search(r"newsletter", text, re.I):
        return text, False, None  # already present
    footer_re = re.compile(r"(<footer\b)", re.I)
    m = footer_re.search(text)
    if not m:
        return text, False, "no <footer> found"
    new_text = text[: m.start()] + newsletter_block() + text[m.start():]
    return new_text, True, None


def main():
    pages = find_mobile_html()
    summary = {"nav": 0, "address": 0, "newsletter": 0, "skipped": [], "unchanged": 0}

    for path in pages:
        rel = os.path.relpath(path, M_DIR)
        if rel == "index.html":
            continue  # handled manually

        is_blog = (os.sep + "blog" + os.sep) in path or os.path.basename(
            os.path.dirname(path)
        ) == "blog"
        prefix = "../../m/" if is_blog else ""

        with open(path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
        original = text
        notes = []

        text, did_nav, err = inject_nav(text, prefix)
        if err:
            notes.append(f"nav: {err}")
        elif did_nav:
            summary["nav"] += 1

        text, did_addr, err = inject_address(text)
        if err:
            notes.append(f"address: {err}")
        elif did_addr:
            summary["address"] += 1

        # newsletter: service/info pages only (skip blog)
        if not is_blog:
            text, did_news, err = inject_newsletter(text)
            if err:
                notes.append(f"newsletter: {err}")
            elif did_news:
                summary["newsletter"] += 1

        if notes:
            summary["skipped"].append((rel, "; ".join(notes)))

        if text != original:
            if not DRY_RUN:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(text)
        else:
            summary["unchanged"] += 1

    mode = "DRY RUN (no files written)" if DRY_RUN else "APPLIED"
    print(f"=== inject-mobile-shared.py — {mode} ===")
    print(f"Pages processed: {len(pages) - 1} (excluding index.html)")
    print(f"Nav links added:   {summary['nav']}")
    print(f"Address added:     {summary['address']}")
    print(f"Newsletter added:  {summary['newsletter']}")
    print(f"Unchanged:         {summary['unchanged']}")
    if summary["skipped"]:
        print(f"\nPages with issues ({len(summary['skipped'])}):")
        for rel, why in summary["skipped"]:
            print(f"  - {rel}: {why}")


if __name__ == "__main__":
    main()
