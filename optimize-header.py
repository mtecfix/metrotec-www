#!/usr/bin/env python3
"""Optimize Header - Better spacing, visual balance, no new links"""

import re
from pathlib import Path

BLOG_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC/blog")
SITE_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC")

# Optimized header with better spacing and visual balance
OPTIMIZED_HEADER = '''<header style="background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:1000;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
  <div style="max-width:1400px;margin:0 auto;padding:0.75rem 1.5rem;display:flex;align-items:center;justify-content:space-between;">
    <a href="../index.html" style="display:flex;align-items:center;text-decoration:none;">
      <img src="../metrotec-logo.png" alt="MetroTec" style="height:36px;">
    </a>
    <nav style="display:flex;gap:1.5rem;align-items:center;" class="main-nav">
      <a href="../index.html" style="color:#374151;text-decoration:none;font-weight:500;font-size:0.95rem;">Home</a>
      <a href="../services.html" style="color:#374151;text-decoration:none;font-weight:500;font-size:0.95rem;">Services</a>
      <a href="../industries.html" style="color:#374151;text-decoration:none;font-weight:500;font-size:0.95rem;">Industries</a>
      <a href="index.html" style="color:#0284c7;text-decoration:none;font-weight:600;font-size:0.95rem;">Blog</a>
      <a href="../about.html" style="color:#374151;text-decoration:none;font-weight:500;font-size:0.95rem;">About</a>
      <a href="../contact.html" style="color:#374151;text-decoration:none;font-weight:500;font-size:0.95rem;">Contact</a>
      <a href="../get-quote.html" style="background:#0284c7;color:white;padding:0.5rem 1.25rem;border-radius:5px;text-decoration:none;font-weight:600;font-size:0.9rem;">Get Quote</a>
    </nav>
    <button onclick="toggleMobileMenu()" style="display:none;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#374151;" class="mobile-menu-btn">☰</button>
  </div>
  <style>
    @media(max-width:768px){.main-nav{display:none;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:white;padding:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);gap:0.75rem;}.main-nav.active{display:flex;}.mobile-menu-btn{display:block!important;}}
    header a:hover{opacity:0.8;}
  </style>
  <script>function toggleMobileMenu(){document.querySelector('.main-nav').classList.toggle('active');}</script>
</header>

'''

BLOG_POSTS = [
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

def replace_header(filepath, is_blog=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    header = OPTIMIZED_HEADER
    if not is_blog:
        header = header.replace('../', '')
        header = header.replace('index.html" style="color:#0284c7', 'blog/index.html" style="color:#374151')
    
    # Replace header section
    content = re.sub(
        r'<header style=.*?</script>\s*</header>',
        header,
        content,
        flags=re.DOTALL,
        count=1
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("Optimizing Headers - Better spacing & visual balance")
    print("=" * 60)
    print()
    
    print("Updating blog posts...")
    for filename in BLOG_POSTS:
        filepath = BLOG_DIR / filename
        if filepath.exists():
            replace_header(filepath, is_blog=True)
            print(f"  ✅ {filename}")
    
    print()
    print("=" * 60)
    print("Complete! Optimized headers")
    print()
    print("Improvements:")
    print("  ✅ Reduced padding (1rem → 0.75rem)")
    print("  ✅ Tighter nav spacing (2rem → 1.5rem)")
    print("  ✅ Smaller logo (40px → 36px)")
    print("  ✅ Lighter border (2px → 1px)")
    print("  ✅ Softer shadow")
    print("  ✅ Consistent font sizes (0.95rem)")
    print("  ✅ Better visual balance")

if __name__ == "__main__":
    main()
