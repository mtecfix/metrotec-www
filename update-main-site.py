#!/usr/bin/env python3
"""Update Main Site Header & Footer to Match Blog Quality"""

import re
from pathlib import Path

SITE_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC")

# Main pages to update
PAGES = [
    "index.html", "about.html", "services.html", "industries.html", 
    "contact.html", "get-quote.html", "managed-it.html", "cybersecurity.html",
    "cloud-services.html", "voip-phone.html", "network-support.html", 
    "help-desk.html", "healthcare.html", "manufacturing.html",
    "professional-services.html", "retail.html", "privacy-policy.html", 
    "terms-of-service.html"
]

NEWSLETTER_FORM = '''      <form style="margin: 1rem 0;" onsubmit="return false;">
        <input type="email" placeholder="Subscribe to our newsletter" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 4px; margin-bottom: 0.5rem;">
        <button type="submit" style="width: 100%; padding: 0.5rem; background: white; color: #0284c7; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Subscribe</button>
      </form>'''

RESOURCES_COLUMN = '''    <div class="ft-resources"><h5>Resources</h5><ul>
      <li><a href="blog/index.html">Blog</a></li>
      <li><a href="contact.html">Contact Us</a></li>
      <li><a href="get-quote.html">Free Quote</a></li>
      <li><a href="about.html">About Us</a></li>
    </ul></div>'''

def update_page(filename):
    filepath = SITE_DIR / filename
    if not filepath.exists():
        return False
    
    print(f"Processing: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add Blog link to header nav (before Contact)
    if '<li><a href="blog/index.html"' not in content and '<a href="blog/index.html"' not in content:
        # Try to add before Contact link
        content = re.sub(
            r'(<li><a href="contact\.html")',
            r'<li><a href="blog/index.html" class="nav-link">Blog</a></li>\n          \1',
            content,
            count=1
        )
    
    # 2. Make header sticky
    if 'position: sticky' not in content and '.header {' in content:
        content = re.sub(
            r'(\.header\s*{[^}]*)',
            r'\1\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
            content,
            count=1
        )
    
    # 3. Add newsletter form to footer (after tagline)
    if 'Subscribe to our newsletter' not in content and 'ft-tagline' in content:
        content = re.sub(
            r'(<p class="ft-tagline">.*?</p>)',
            f'\\1\n{NEWSLETTER_FORM}',
            content,
            flags=re.DOTALL,
            count=1
        )
    
    # 4. Add Contact link to Company section (after Blog)
    if 'ft-company' in content and '<li><a href="contact.html">Contact' not in content:
        content = re.sub(
            r'(<li><a href="blog/index\.html">Blog</a></li>)',
            r'\1\n        <li><a href="contact.html">Contact</a></li>',
            content,
            count=1
        )
    
    # 5. Add Resources column (before closing ft-columns div)
    if 'ft-resources' not in content and 'ft-contact' in content:
        content = re.sub(
            r'(</ul></div>\s*</div>\s*<div class="ft-bottom-bar">)',
            f'</ul></div>\n{RESOURCES_COLUMN}\n  </div>\n  <div class="ft-bottom-bar">',
            content,
            count=1
        )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("  ✅ Updated\n")
    return True

def main():
    print("Updating Main Site Header & Footer")
    print("=" * 50)
    print()
    
    updated = 0
    for filename in PAGES:
        if update_page(filename):
            updated += 1
    
    print("=" * 50)
    print(f"Complete! Updated {updated}/{len(PAGES)} pages")
    print("\nAdded:")
    print("  ✅ Blog link to header navigation")
    print("  ✅ Sticky header positioning")
    print("  ✅ Newsletter signup to footer")
    print("  ✅ Contact link to footer")
    print("  ✅ Resources column to footer")

if __name__ == "__main__":
    main()
