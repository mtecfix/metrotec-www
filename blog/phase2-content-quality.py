#!/usr/bin/env python3
"""Phase 2: Content Quality Improvements"""

import re
from pathlib import Path

BLOG_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC/blog")

# Post metadata with dates and related posts
POSTS = {
    "active-directory-security.html": {"date": "March 10, 2026", "read_time": "8 min", "related": ["zero-trust-security.html", "password-management-guide.html", "incident-response-plan.html"]},
    "aws-vs-azure.html": {"date": "December 31, 2025", "read_time": "10 min", "related": ["cloud-migration-guide.html", "cloud-cost-optimization.html", "cloud-services.html"]},
    "backup-strategy-guide.html": {"date": "February 1, 2026", "read_time": "9 min", "related": ["disaster-recovery-testing.html", "cloud-backup-solutions.html", "data-backup-vs-archive.html"]},
    "cloud-backup-solutions.html": {"date": "March 17, 2026", "read_time": "7 min", "related": ["backup-strategy-guide.html", "disaster-recovery-testing.html", "ransomware-recovery-plan.html"]},
    "cloud-cost-optimization.html": {"date": "March 14, 2026", "read_time": "9 min", "related": ["aws-vs-azure.html", "cloud-migration-guide.html", "it-budget-planning-2026.html"]},
    "cloud-migration-guide.html": {"date": "December 8, 2025", "read_time": "10 min", "related": ["aws-vs-azure.html", "cloud-cost-optimization.html", "office-365-migration.html"]},
    "cnc-machine-monitoring.html": {"date": "December 15, 2025", "read_time": "8 min", "related": ["iot-manufacturing-sensors.html", "manufacturing-downtime-prevention.html", "mes-manufacturing-execution.html"]},
    "cost-of-downtime.html": {"date": "January 5, 2026", "read_time": "7 min", "related": ["manufacturing-downtime-prevention.html", "disaster-recovery-testing.html", "backup-strategy-guide.html"]},
    "cybersecurity-insurance.html": {"date": "January 21, 2026", "read_time": "8 min", "related": ["cybersecurity-threats-2026.html", "ransomware-recovery-plan.html", "incident-response-plan.html"]},
    "cybersecurity-threats-2026.html": {"date": "January 1, 2026", "read_time": "10 min", "related": ["ransomware-recovery-plan.html", "email-security-best-practices.html", "zero-trust-security.html"]},
    "data-backup-vs-archive.html": {"date": "February 5, 2026", "read_time": "7 min", "related": ["backup-strategy-guide.html", "cloud-backup-solutions.html", "it-compliance-checklist.html"]},
    "disaster-recovery-testing.html": {"date": "January 7, 2026", "read_time": "9 min", "related": ["backup-strategy-guide.html", "incident-response-plan.html", "ransomware-recovery-plan.html"]},
    "email-security-best-practices.html": {"date": "January 9, 2026", "read_time": "8 min", "related": ["cybersecurity-threats-2026.html", "mfa-security-guide.html", "microsoft-365-security.html"]},
    "endpoint-security-guide.html": {"date": "December 24, 2025", "read_time": "8 min", "related": ["zero-trust-security.html", "remote-work-security.html", "network-security-layers.html"]},
    "erp-systems-manufacturing.html": {"date": "January 19, 2026", "read_time": "8 min", "related": ["mes-manufacturing-execution.html", "quality-management-software.html", "manufacturing-downtime-prevention.html"]},
    "hipaa-compliance-guide.html": {"date": "January 7, 2026", "read_time": "10 min", "related": ["it-compliance-checklist.html", "soc2-compliance-guide.html", "data-backup-vs-archive.html"]},
    "incident-response-plan.html": {"date": "January 19, 2026", "read_time": "9 min", "related": ["ransomware-recovery-plan.html", "disaster-recovery-testing.html", "cybersecurity-threats-2026.html"]},
    "iot-manufacturing-sensors.html": {"date": "February 25, 2026", "read_time": "8 min", "related": ["cnc-machine-monitoring.html", "mes-manufacturing-execution.html", "scada-systems-guide.html"]},
    "it-budget-planning-2026.html": {"date": "February 27, 2026", "read_time": "9 min", "related": ["cloud-cost-optimization.html", "managed-it-troy-businesses.html", "it-documentation-guide.html"]},
    "it-compliance-checklist.html": {"date": "January 28, 2026", "read_time": "9 min", "related": ["hipaa-compliance-guide.html", "soc2-compliance-guide.html", "it-documentation-guide.html"]},
    "it-documentation-guide.html": {"date": "March 14, 2026", "read_time": "8 min", "related": ["it-compliance-checklist.html", "patch-management-strategy.html", "network-monitoring-tools.html"]},
    "kubernetes-basics.html": {"date": "February 22, 2026", "read_time": "9 min", "related": ["cloud-migration-guide.html", "server-virtualization-benefits.html", "aws-vs-azure.html"]},
    "managed-it-troy-businesses.html": {"date": "December 16, 2025", "read_time": "8 min", "related": ["network-monitoring-tools.html", "it-budget-planning-2026.html", "remote-work-security.html"]},
    "manufacturing-downtime-prevention.html": {"date": "January 9, 2026", "read_time": "9 min", "related": ["cnc-machine-monitoring.html", "cost-of-downtime.html", "iot-manufacturing-sensors.html"]},
    "mes-manufacturing-execution.html": {"date": "March 4, 2026", "read_time": "8 min", "related": ["erp-systems-manufacturing.html", "quality-management-software.html", "cnc-machine-monitoring.html"]},
    "mfa-security-guide.html": {"date": "December 15, 2025", "read_time": "10 min", "related": ["password-management-guide.html", "zero-trust-security.html", "email-security-best-practices.html"]},
    "microsoft-365-security.html": {"date": "February 23, 2026", "read_time": "8 min", "related": ["email-security-best-practices.html", "office-365-migration.html", "mfa-security-guide.html"]},
    "network-monitoring-tools.html": {"date": "December 31, 2025", "read_time": "8 min", "related": ["network-security-layers.html", "network-segmentation.html", "managed-it-troy-businesses.html"]},
    "network-security-layers.html": {"date": "January 13, 2026", "read_time": "9 min", "related": ["network-segmentation.html", "zero-trust-security.html", "wireless-network-security.html"]},
    "network-segmentation.html": {"date": "February 18, 2026", "read_time": "8 min", "related": ["network-security-layers.html", "zero-trust-security.html", "scada-systems-guide.html"]},
    "office-365-migration.html": {"date": "January 15, 2026", "read_time": "8 min", "related": ["microsoft-365-security.html", "cloud-migration-guide.html", "email-security-best-practices.html"]},
    "password-management-guide.html": {"date": "February 19, 2026", "read_time": "7 min", "related": ["mfa-security-guide.html", "active-directory-security.html", "zero-trust-security.html"]},
    "patch-management-strategy.html": {"date": "February 11, 2026", "read_time": "8 min", "related": ["endpoint-security-guide.html", "it-documentation-guide.html", "network-monitoring-tools.html"]},
    "quality-management-software.html": {"date": "February 14, 2026", "read_time": "8 min", "related": ["mes-manufacturing-execution.html", "erp-systems-manufacturing.html", "manufacturing-downtime-prevention.html"]},
    "ransomware-recovery-plan.html": {"date": "February 28, 2026", "read_time": "9 min", "related": ["cybersecurity-threats-2026.html", "backup-strategy-guide.html", "incident-response-plan.html"]},
    "remote-work-security.html": {"date": "January 11, 2026", "read_time": "8 min", "related": ["endpoint-security-guide.html", "mfa-security-guide.html", "zero-trust-security.html"]},
    "scada-systems-guide.html": {"date": "January 23, 2026", "read_time": "8 min", "related": ["iot-manufacturing-sensors.html", "network-segmentation.html", "manufacturing-downtime-prevention.html"]},
    "server-virtualization-benefits.html": {"date": "February 8, 2026", "read_time": "8 min", "related": ["vdi-virtual-desktop.html", "cloud-migration-guide.html", "kubernetes-basics.html"]},
    "soc2-compliance-guide.html": {"date": "February 20, 2026", "read_time": "9 min", "related": ["hipaa-compliance-guide.html", "it-compliance-checklist.html", "it-documentation-guide.html"]},
    "vdi-virtual-desktop.html": {"date": "January 26, 2026", "read_time": "8 min", "related": ["server-virtualization-benefits.html", "remote-work-security.html", "cloud-migration-guide.html"]},
    "voip-troubleshooting.html": {"date": "February 12, 2026", "read_time": "7 min", "related": ["voip-vs-traditional-phone.html", "network-monitoring-tools.html", "managed-it-troy-businesses.html"]},
    "voip-vs-traditional-phone.html": {"date": "January 17, 2026", "read_time": "8 min", "related": ["voip-troubleshooting.html", "cloud-cost-optimization.html", "managed-it-troy-businesses.html"]},
    "wireless-network-security.html": {"date": "February 6, 2026", "read_time": "8 min", "related": ["network-security-layers.html", "network-segmentation.html", "zero-trust-security.html"]},
    "zero-trust-security.html": {"date": "February 16, 2026", "read_time": "9 min", "related": ["network-security-layers.html", "mfa-security-guide.html", "endpoint-security-guide.html"]}
}

RELATED_TITLES = {
    "active-directory-security.html": "Active Directory Security Best Practices",
    "aws-vs-azure.html": "AWS vs Azure: Which Cloud Platform is Right?",
    "backup-strategy-guide.html": "Complete Backup Strategy Guide",
    "cloud-backup-solutions.html": "Cloud Backup Solutions",
    "cloud-cost-optimization.html": "Cloud Cost Optimization Strategies",
    "cloud-migration-guide.html": "Cloud Migration Guide",
    "cnc-machine-monitoring.html": "CNC Machine Monitoring",
    "cost-of-downtime.html": "The True Cost of IT Downtime",
    "cybersecurity-insurance.html": "Cybersecurity Insurance Guide",
    "cybersecurity-threats-2026.html": "5 Cybersecurity Threats in 2026",
    "data-backup-vs-archive.html": "Data Backup vs Archive",
    "disaster-recovery-testing.html": "Disaster Recovery Testing",
    "email-security-best-practices.html": "Email Security Best Practices",
    "endpoint-security-guide.html": "Endpoint Security Guide",
    "erp-systems-manufacturing.html": "ERP Systems for Manufacturing",
    "hipaa-compliance-guide.html": "HIPAA Compliance Guide",
    "incident-response-plan.html": "Incident Response Planning",
    "iot-manufacturing-sensors.html": "IoT Sensors in Manufacturing",
    "it-budget-planning-2026.html": "IT Budget Planning for 2026",
    "it-compliance-checklist.html": "IT Compliance Checklist",
    "it-documentation-guide.html": "IT Documentation Guide",
    "kubernetes-basics.html": "Kubernetes Basics",
    "managed-it-troy-businesses.html": "Managed IT for Troy Businesses",
    "manufacturing-downtime-prevention.html": "Manufacturing Downtime Prevention",
    "mes-manufacturing-execution.html": "Manufacturing Execution Systems",
    "mfa-security-guide.html": "Multi-Factor Authentication Guide",
    "microsoft-365-security.html": "Microsoft 365 Security",
    "network-monitoring-tools.html": "Network Monitoring Tools",
    "network-security-layers.html": "Network Security Layers",
    "network-segmentation.html": "Network Segmentation Guide",
    "office-365-migration.html": "Office 365 Migration Guide",
    "password-management-guide.html": "Password Management Best Practices",
    "patch-management-strategy.html": "Patch Management Strategy",
    "quality-management-software.html": "Quality Management Software",
    "ransomware-recovery-plan.html": "Ransomware Recovery Planning",
    "remote-work-security.html": "Remote Work Security",
    "scada-systems-guide.html": "SCADA Systems Guide",
    "server-virtualization-benefits.html": "Server Virtualization Benefits",
    "soc2-compliance-guide.html": "SOC 2 Compliance Guide",
    "vdi-virtual-desktop.html": "Virtual Desktop Infrastructure",
    "voip-troubleshooting.html": "VoIP Troubleshooting Guide",
    "voip-vs-traditional-phone.html": "VoIP vs Traditional Phone Systems",
    "wireless-network-security.html": "Wireless Network Security",
    "zero-trust-security.html": "Zero Trust Security Model"
}

def update_post(filename, metadata):
    filepath = BLOG_DIR / filename
    if not filepath.exists():
        return False
    
    print(f"Processing: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add visible byline with date and read time
    byline = f'<p class="article-byline">By MetroTec Team • {metadata["date"]} • {metadata["read_time"]} read</p>'
    
    if 'class="article-byline"' not in content:
        content = re.sub(
            r'(<p class="article-subtitle">.*?</p>)',
            f'\\1\n    {byline}',
            content,
            count=1
        )
    
    # 2. Add CTA before footer
    cta = '''
  <div style="background: #f0f9ff; border: 2px solid #0284c7; border-radius: 8px; padding: 2rem; margin: 3rem 0; text-align: center;">
    <h3 style="color: #0284c7; margin-bottom: 1rem;">Need IT Support for Your Metro Detroit Business?</h3>
    <p style="margin-bottom: 1.5rem; font-size: 1.125rem;">MetroTec provides managed IT services, cybersecurity, and cloud solutions to businesses across Metro Detroit.</p>
    <a href="../get-quote.html" style="display: inline-block; background: #0284c7; color: white; padding: 1rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 600; transition: background 0.3s;">Get a Free Quote</a>
  </div>'''
    
    if 'Get a Free Quote' not in content:
        content = re.sub(
            r'(<div style="padding: 2rem 3rem; border-top)',
            f'{cta}\n\n\\1',
            content,
            count=1
        )
    
    # 3. Add related articles section
    related_html = '\n  <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 2rem; margin: 2rem 0;">\n    <h3 style="margin-bottom: 1rem;">Related Articles</h3>\n    <ul style="list-style: none; padding: 0; margin: 0;">\n'
    
    for related_file in metadata["related"]:
        title = RELATED_TITLES.get(related_file, related_file)
        related_html += f'      <li style="margin-bottom: 0.75rem;"><a href="{related_file}" style="color: #7c3aed; text-decoration: none; font-weight: 600;">→ {title}</a></li>\n'
    
    related_html += '    </ul>\n  </div>'
    
    if 'Related Articles' not in content:
        content = re.sub(
            r'(<div style="padding: 2rem 3rem; border-top)',
            f'{related_html}\n\n\\1',
            content,
            count=1
        )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("  ✅ Updated\n")
    return True

def main():
    print("Starting Phase 2: Content Quality Improvements")
    print("=" * 50)
    print()
    
    updated = 0
    for filename, metadata in POSTS.items():
        if update_post(filename, metadata):
            updated += 1
    
    print("=" * 50)
    print(f"Phase 2 Complete! Updated {updated}/{len(POSTS)} posts")
    print("\nAdded:")
    print("  ✅ Visible publication dates and read times")
    print("  ✅ Call-to-action boxes")
    print("  ✅ Related articles sections")

if __name__ == "__main__":
    main()
