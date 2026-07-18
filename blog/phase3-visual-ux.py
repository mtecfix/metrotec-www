#!/usr/bin/env python3
"""Phase 3: Visual & UX Improvements"""

import re
from pathlib import Path

BLOG_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC/blog")

# All blog posts
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

def update_post(filename):
    filepath = BLOG_DIR / filename
    if not filepath.exists():
        return False
    
    print(f"Processing: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add breadcrumb navigation
    breadcrumb = '''  <nav style="padding: 1rem 3rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb;" aria-label="Breadcrumb">
    <ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 0.5rem; font-size: 0.875rem;">
      <li><a href="../index.html" style="color: #6b7280; text-decoration: none;">Home</a></li>
      <li style="color: #9ca3af;">›</li>
      <li><a href="index.html" style="color: #6b7280; text-decoration: none;">Blog</a></li>
      <li style="color: #9ca3af;">›</li>
      <li style="color: #1a1a1a;">Article</li>
    </ol>
  </nav>

'''
    
    if 'aria-label="Breadcrumb"' not in content:
        content = re.sub(
            r'(<div class="masthead">)',
            f'{breadcrumb}\\1',
            content,
            count=1
        )
    
    # 2. Fix text justification (change justify to left)
    content = re.sub(
        r'text-align: justify;',
        'text-align: left;',
        content
    )
    
    # 3. Add breadcrumb schema to existing Article schema
    if '"@type": "Article"' in content and '"@type": "BreadcrumbList"' not in content:
        # Find the closing script tag of Article schema
        schema_end = content.find('</script>')
        if schema_end > 0:
            breadcrumb_schema = ''',
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mrtechfixes.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://mrtechfixes.com/blog/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Article"
    }
  ]
}'''
            # Insert before the closing brace of the JSON
            content = content[:schema_end] + breadcrumb_schema + '\n' + content[schema_end:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("  ✅ Updated\n")
    return True

def main():
    print("Starting Phase 3: Visual & UX Improvements")
    print("=" * 50)
    print()
    
    updated = 0
    for filename in POSTS:
        if update_post(filename):
            updated += 1
    
    print("=" * 50)
    print(f"Phase 3 Complete! Updated {updated}/{len(POSTS)} posts")
    print("\nAdded:")
    print("  ✅ Breadcrumb navigation")
    print("  ✅ Fixed text alignment (justify → left)")
    print("  ✅ Breadcrumb schema markup")

if __name__ == "__main__":
    main()
