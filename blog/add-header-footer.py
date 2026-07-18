#!/usr/bin/env python3
"""Add Header Navigation and Enhance Footer for Blog Posts"""

import re
from pathlib import Path

BLOG_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC/blog")

POSTS = [
    "active-directory-security.html", "aws-vs-azure.html", "backup-strategy-guide.html",
    "cloud-backup-solutions.html", "cloud-cost-optimization.html", "cloud-migration-guide.html",
    "cnc-machine-monitoring.html", "cost-of-downtime.html", "cybersecurity-insurance.html",
    "cybersecurity-threats-2026.html", "data-backup-vs-archive.html", "disaster-recovery-testing.html",
    "email-security-best-practices.html", "endpoint-security-guide.html", "erp-systems-manufacturing.html",
    "hipaa-compliance-guide.html", "incident-response-plan.html", "iot-manufacturing-sensors.html",
    "it-budget-planning-2026.html", "it-compliance-checklist.html", "it-documentation-guide.html",
    "kubernetes-basics.html", "managed-it-troy-businesses.html", "manufacturing-downtime-prevention.html",
    "mes-manufacturing-execution.html", "mfa-security-guide.html", "microsoft-365-security.html",
    "network-monitoring-tools.html", "network-security-layers.html", "network-segmentation.html",
    "office-365-migration.html", "password-management-guide.html", "patch-management-strategy.html",
    "quality-management-software.html", "ransomware-recovery-plan.html", "remote-work-security.html",
    "scada-systems-guide.html", "server-virtualization-benefits.html", "soc2-compliance-guide.html",
    "vdi-virtual-desktop.html", "voip-troubleshooting.html", "voip-vs-traditional-phone.html",
    "wireless-network-security.html", "zero-trust-security.html"
]

HEADER_HTML = '''<header style="background: #fff; border-bottom: 2px solid #e5e7eb; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <div style="max-width: 1400px; margin: 0 auto; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between;">
    <a href="../index.html" style="display: flex; align-items: center; text-decoration: none;">
      <img src="../metrotec-logo.png" alt="MetroTec" style="height: 40px;">
    </a>
    <nav style="display: flex; gap: 2rem; align-items: center;" class="main-nav">
      <a href="../index.html" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Home</a>
      <a href="../services.html" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Services</a>
      <a href="../industries.html" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Industries</a>
      <a href="index.html" style="color: #7c3aed; text-decoration: none; font-weight: 600;">Blog</a>
      <a href="../about.html" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">About</a>
      <a href="../contact.html" style="color: #374151; text-decoration: none; font-weight: 500; transition: color 0.2s;">Contact</a>
      <a href="../get-quote.html" style="background: #0284c7; color: white; padding: 0.5rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; transition: background 0.2s;">Get Quote</a>
    </nav>
    <button onclick="toggleMobileMenu()" style="display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer;" class="mobile-menu-btn">☰</button>
  </div>
  <style>
    @media (max-width: 768px) {
      .main-nav { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: white; padding: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .main-nav.active { display: flex; }
      .mobile-menu-btn { display: block !important; }
    }
    header a:hover { color: #7c3aed !important; }
  </style>
  <script>
    function toggleMobileMenu() {
      document.querySelector('.main-nav').classList.toggle('active');
    }
  </script>
</header>

'''

FOOTER_ENHANCEMENT = '''  <div class="ft-columns">
    <div class="ft-brand">
      <div class="ft-accent-bar"></div>
      <img src="../metrotec-logo.png" alt="MetroTec Logo">
      <p class="ft-tagline">Your IT Partner in Metro Detroit</p>
      <form style="margin: 1rem 0;" onsubmit="return false;">
        <input type="email" placeholder="Subscribe to our newsletter" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 4px; margin-bottom: 0.5rem;">
        <button type="submit" style="width: 100%; padding: 0.5rem; background: white; color: #0284c7; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Subscribe</button>
      </form>
      <div class="ft-social-icons">
        <a href="https://www.linkedin.com/company/metrotec-it" target="_blank" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
        <a href="https://www.facebook.com/metrotecit" target="_blank" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
        <a href="https://twitter.com/metrotecit" target="_blank" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
      </div>
    </div>
    <div class="ft-services"><h5>Services</h5><ul>
      <li><a href="../managed-it.html">Managed IT</a></li>
      <li><a href="../cybersecurity.html">Cybersecurity</a></li>
      <li><a href="../cloud-services.html">Cloud Services</a></li>
      <li><a href="../voip-phone.html">VoIP Phone</a></li>
      <li><a href="../network-support.html">Network Support</a></li>
      <li><a href="../help-desk.html">Help Desk</a></li>
    </ul></div>
    <div class="ft-company"><h5>Company</h5><ul>
      <li><a href="../index.html">Home</a></li>
      <li><a href="../about.html">About</a></li>
      <li><a href="../industries.html">Industries</a></li>
      <li><a href="index.html">Blog</a></li>
      <li><a href="../contact.html">Contact</a></li>
      <li><a href="../get-quote.html">Get Quote</a></li>
      <li><a href="../privacy-policy.html">Privacy Policy</a></li>
      <li><a href="../terms-of-service.html">Terms of Service</a></li>
    </ul></div>
    <div class="ft-resources"><h5>Blog Topics</h5><ul>
      <li><a href="index.html#cybersecurity">Cybersecurity</a></li>
      <li><a href="index.html#manufacturing">Manufacturing IT</a></li>
      <li><a href="index.html#cloud">Cloud Services</a></li>
      <li><a href="index.html#managed-it">Managed IT</a></li>
      <li><a href="allposts.html">All Posts</a></li>
    </ul></div>
  </div>'''

def update_post(filename):
    filepath = BLOG_DIR / filename
    if not filepath.exists():
        return False
    
    print(f"Processing: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add header after breadcrumb
    if '<header style="background: #fff' not in content:
        content = re.sub(
            r'(</nav>\s*\n)',
            f'\\1{HEADER_HTML}',
            content,
            count=1
        )
    
    # 2. Enhance footer - replace ft-columns section
    if 'ft-resources' not in content:
        content = re.sub(
            r'<div class="ft-columns">.*?</div>\s*<div class="ft-bottom-bar">',
            FOOTER_ENHANCEMENT + '\n  <div class="ft-bottom-bar">',
            content,
            flags=re.DOTALL,
            count=1
        )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("  ✅ Updated\n")
    return True

def main():
    print("Adding Header Navigation & Enhancing Footer")
    print("=" * 50)
    print()
    
    updated = 0
    for filename in POSTS:
        if update_post(filename):
            updated += 1
    
    print("=" * 50)
    print(f"Complete! Updated {updated}/{len(POSTS)} posts")
    print("\nAdded:")
    print("  ✅ Header navigation with logo and menu")
    print("  ✅ Newsletter signup in footer")
    print("  ✅ Blog topics section in footer")
    print("  ✅ Contact link in footer")

if __name__ == "__main__":
    main()
