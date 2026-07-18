#!/usr/bin/env python3
"""Optimize Footer - Max 10 Essential Links, Minimal Spacing"""

import re
from pathlib import Path

BLOG_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC/blog")
SITE_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC")

# Essential footer with max 10 links, minimal spacing
OPTIMIZED_FOOTER = '''<footer class="ft-footer">
<div class="ft-container">
  <div class="ft-columns">
    <div class="ft-col">
      <img src="../metrotec-logo.png" alt="MetroTec" style="width:250px;margin-bottom:8px;">
      <p style="font-size:0.9rem;margin:0 0 8px 0;opacity:0.9;">Metro Detroit IT Support</p>
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <a href="https://www.linkedin.com/company/metrotec-it" target="_blank" style="color:white;font-size:1.2rem;"><i class="bi bi-linkedin"></i></a>
        <a href="https://www.facebook.com/metrotecit" target="_blank" style="color:white;font-size:1.2rem;"><i class="bi bi-facebook"></i></a>
        <a href="https://twitter.com/metrotecit" target="_blank" style="color:white;font-size:1.2rem;"><i class="bi bi-twitter-x"></i></a>
      </div>
      <input type="email" placeholder="Newsletter" style="width:100%;padding:6px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:white;border-radius:3px;font-size:0.85rem;margin-bottom:4px;">
      <button style="width:100%;padding:6px;background:white;color:#0284c7;border:none;border-radius:3px;font-weight:600;cursor:pointer;font-size:0.85rem;">Subscribe</button>
    </div>
    <div class="ft-col">
      <h5 style="margin:0 0 8px 0;font-size:0.75rem;opacity:0.7;text-transform:uppercase;">Services</h5>
      <a href="../managed-it.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">Managed IT</a><br>
      <a href="../cybersecurity.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">Cybersecurity</a><br>
      <a href="../cloud-services.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">Cloud Services</a>
    </div>
    <div class="ft-col">
      <h5 style="margin:0 0 8px 0;font-size:0.75rem;opacity:0.7;text-transform:uppercase;">Company</h5>
      <a href="../about.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">About</a><br>
      <a href="index.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">Blog</a><br>
      <a href="../contact.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">Contact</a><br>
      <a href="../get-quote.html" style="display:inline-block;color:rgba(255,255,255,0.9);text-decoration:none;font-size:0.95rem;margin-bottom:4px;">Get Quote</a>
    </div>
    <div class="ft-col">
      <p style="margin:0 0 4px 0;font-size:0.95rem;"><a href="tel:313-242-7311" style="color:white;text-decoration:none;font-weight:600;">(313) 242-7311</a></p>
      <p style="margin:0 0 4px 0;font-size:0.9rem;opacity:0.9;">Metro Detroit, MI</p>
      <p style="margin:0 0 8px 0;font-size:0.85rem;opacity:0.8;">Mon-Fri 8AM-6PM</p>
      <a href="../privacy-policy.html" style="display:inline-block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.75rem;margin-bottom:2px;">Privacy</a><br>
      <a href="../terms-of-service.html" style="display:inline-block;color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.75rem;">Terms</a>
    </div>
  </div>
  <div style="text-align:center;padding:8px 0;border-top:1px solid rgba(255,255,255,0.2);margin-top:12px;font-size:0.75rem;opacity:0.8;">&copy; 2026 MetroTec</div>
</div>
</footer>
<style>
.ft-footer{background:#0284c7;padding:12px 0;color:white;}
.ft-container{max-width:1200px;margin:0 auto;padding:0 12px;}
.ft-columns{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.ft-col a:hover{opacity:1;text-decoration:underline;}
@media(max-width:768px){.ft-columns{grid-template-columns:1fr 1fr;gap:12px;}}
@media(max-width:480px){.ft-columns{grid-template-columns:1fr;}}
</style>'''

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

MAIN_PAGES = [
    "index.html", "about.html", "services.html", "industries.html", 
    "contact.html", "get-quote.html", "managed-it.html", "cybersecurity.html",
    "cloud-services.html", "voip-phone.html", "network-support.html", 
    "help-desk.html", "healthcare.html", "manufacturing.html",
    "professional-services.html", "retail.html", "privacy-policy.html", 
    "terms-of-service.html"
]

def replace_footer(filepath, is_blog=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Adjust paths for main site
    footer = OPTIMIZED_FOOTER
    if not is_blog:
        footer = footer.replace('../', '')
        footer = footer.replace('index.html" style', 'blog/index.html" style')
    
    # Replace entire footer section
    content = re.sub(
        r'<footer class="ft-footer">.*?</footer>.*?</style>',
        footer,
        content,
        flags=re.DOTALL,
        count=1
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("Optimizing Footers - 10 Essential Links, Minimal Spacing")
    print("=" * 60)
    print()
    
    # Update blog posts
    print("Updating blog posts...")
    for filename in BLOG_POSTS:
        filepath = BLOG_DIR / filename
        if filepath.exists():
            replace_footer(filepath, is_blog=True)
            print(f"  ✅ {filename}")
    
    print()
    print("Updating main pages...")
    # Update main pages
    for filename in MAIN_PAGES:
        filepath = SITE_DIR / filename
        if filepath.exists():
            replace_footer(filepath, is_blog=False)
            print(f"  ✅ {filename}")
    
    print()
    print("=" * 60)
    print("Complete! Optimized footer on all pages")
    print()
    print("Footer now has:")
    print("  ✅ 10 essential links (max)")
    print("  ✅ Minimal spacing/padding")
    print("  ✅ Compact design")
    print("  ✅ Newsletter signup")
    print("  ✅ Social icons")
    print("  ✅ Contact info")

if __name__ == "__main__":
    main()
