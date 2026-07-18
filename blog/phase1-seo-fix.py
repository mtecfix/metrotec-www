#!/usr/bin/env python3
"""Phase 1: Critical SEO Fixes for MetroTec Blog"""

import re
import os
from pathlib import Path

BLOG_DIR = Path("/mnt/d/KIRO PROJECTS/METROTEC/blog")
DOMAIN = "https://mrtechfixes.com"

# Blog post metadata
POSTS = {
    "active-directory-security.html": {
        "title": "Active Directory Security Best Practices",
        "description": "Learn essential Active Directory security practices to protect your Metro Detroit business from unauthorized access, credential theft, and domain compromise.",
        "date": "2026-03-10"
    },
    "aws-vs-azure.html": {
        "title": "AWS vs Azure: Which Cloud Platform is Right for Your Business?",
        "description": "Compare AWS and Azure features, pricing, and use cases to choose the best cloud platform for your Metro Detroit business needs.",
        "date": "2025-12-31"
    },
    "backup-strategy-guide.html": {
        "title": "Complete Backup Strategy Guide for Businesses",
        "description": "Develop a comprehensive backup strategy with the 3-2-1 rule, testing procedures, and recovery planning for Metro Detroit businesses.",
        "date": "2026-02-01"
    },
    "cloud-backup-solutions.html": {
        "title": "Cloud Backup Solutions for Metro Detroit Businesses",
        "description": "Discover cloud backup solutions that protect your business data with automated backups, encryption, and fast recovery capabilities.",
        "date": "2026-03-17"
    },
    "cloud-cost-optimization.html": {
        "title": "Cloud Cost Optimization Strategies",
        "description": "Reduce cloud spending by 30-50% with rightsizing, reserved instances, and cost monitoring strategies for Metro Detroit businesses.",
        "date": "2026-03-14"
    },
    "cloud-migration-guide.html": {
        "title": "Cloud Migration Guide for Small Businesses",
        "description": "Step-by-step cloud migration guide for small businesses. Learn planning, execution, and optimization strategies to reduce IT costs by 30%.",
        "date": "2025-12-08"
    },
    "cnc-machine-monitoring.html": {
        "title": "CNC Machine Monitoring and Predictive Maintenance",
        "description": "Implement CNC machine monitoring and predictive maintenance to reduce downtime, improve quality, and optimize production in manufacturing.",
        "date": "2025-12-15"
    },
    "cost-of-downtime.html": {
        "title": "The True Cost of IT Downtime",
        "description": "IT downtime costs businesses $5,600 per minute. Learn how to calculate downtime costs and implement prevention strategies for your business.",
        "date": "2026-01-05"
    },
    "cybersecurity-insurance.html": {
        "title": "Cybersecurity Insurance: Coverage and Requirements",
        "description": "Understand cybersecurity insurance coverage, requirements, and how to qualify for protection against ransomware and data breaches.",
        "date": "2026-01-21"
    },
    "cybersecurity-threats-2026.html": {
        "title": "5 Cybersecurity Threats Facing Detroit Businesses in 2026",
        "description": "Ransomware attacks targeting Michigan businesses surged 23% in 2026. Discover the 5 biggest cybersecurity threats and defense strategies.",
        "date": "2026-01-01"
    },
    "data-backup-vs-archive.html": {
        "title": "Data Backup vs Archive: Understanding the Difference",
        "description": "Learn the critical differences between data backup and archiving, and when to use each strategy for compliance and recovery.",
        "date": "2026-02-05"
    },
    "disaster-recovery-testing.html": {
        "title": "Disaster Recovery Testing: Ensuring Your Plan Works",
        "description": "Regular disaster recovery testing ensures your business can recover from outages. Learn testing methodologies and best practices.",
        "date": "2026-01-07"
    },
    "email-security-best-practices.html": {
        "title": "Email Security Best Practices",
        "description": "Protect your business from phishing, BEC attacks, and email threats with SPF, DKIM, DMARC, and security awareness training.",
        "date": "2026-01-09"
    },
    "endpoint-security-guide.html": {
        "title": "Endpoint Security: Beyond Traditional Antivirus",
        "description": "Modern endpoint security goes beyond antivirus with EDR, zero trust, and behavioral analysis to stop advanced threats.",
        "date": "2025-12-24"
    },
    "erp-systems-manufacturing.html": {
        "title": "ERP Systems for Manufacturing Operations",
        "description": "ERP systems integrate manufacturing operations, inventory, quality, and financials for improved efficiency and visibility.",
        "date": "2026-01-19"
    },
    "hipaa-compliance-guide.html": {
        "title": "HIPAA Compliance Guide for Metro Detroit Healthcare Providers",
        "description": "Healthcare data breaches cost $1.5M on average. Ensure HIPAA compliance with encryption, access controls, and audit procedures.",
        "date": "2026-01-07"
    },
    "incident-response-plan.html": {
        "title": "Incident Response Planning and Execution",
        "description": "Develop and test an incident response plan to minimize damage, reduce recovery time, and meet compliance requirements.",
        "date": "2026-01-19"
    },
    "iot-manufacturing-sensors.html": {
        "title": "IoT Sensors in Manufacturing: Real-Time Visibility",
        "description": "IoT sensors provide real-time visibility into manufacturing operations, enabling predictive maintenance and quality improvements.",
        "date": "2026-02-25"
    },
    "it-budget-planning-2026.html": {
        "title": "IT Budget Planning for 2026",
        "description": "Plan your 2026 IT budget with strategies for cloud costs, security investments, and technology modernization for Metro Detroit businesses.",
        "date": "2026-02-27"
    },
    "it-compliance-checklist.html": {
        "title": "IT Compliance Checklist for 2026",
        "description": "Complete IT compliance checklist covering HIPAA, SOC 2, PCI DSS, and GDPR requirements for Metro Detroit businesses.",
        "date": "2026-01-28"
    },
    "it-documentation-guide.html": {
        "title": "IT Documentation Best Practices Guide",
        "description": "Proper IT documentation reduces downtime, improves security, and ensures business continuity. Learn what to document and how.",
        "date": "2026-03-14"
    },
    "kubernetes-basics.html": {
        "title": "Kubernetes Basics for Business Applications",
        "description": "Learn Kubernetes fundamentals for container orchestration, scaling, and managing business applications in the cloud.",
        "date": "2026-02-22"
    },
    "managed-it-troy-businesses.html": {
        "title": "Why Troy Businesses Need Managed IT Services",
        "description": "Troy businesses save 40% on IT costs with managed services. Learn how proactive monitoring and expert support improve uptime.",
        "date": "2025-12-16"
    },
    "manufacturing-downtime-prevention.html": {
        "title": "How Michigan Manufacturers Can Prevent Costly Downtime",
        "description": "Manufacturing downtime costs $260K per hour. Discover proactive IT strategies to prevent equipment failures and production losses.",
        "date": "2026-01-09"
    },
    "mes-manufacturing-execution.html": {
        "title": "MES: Manufacturing Execution Systems Explained",
        "description": "Manufacturing Execution Systems (MES) provide real-time production tracking, quality control, and operational efficiency.",
        "date": "2026-03-04"
    },
    "mfa-security-guide.html": {
        "title": "Multi-Factor Authentication: Complete Security Guide",
        "description": "MFA blocks 99.9% of automated attacks. Learn implementation strategies, best practices, and MFA solutions for businesses.",
        "date": "2025-12-15"
    },
    "microsoft-365-security.html": {
        "title": "Microsoft 365 Security Best Practices",
        "description": "Secure Microsoft 365 with conditional access, DLP, threat protection, and security baselines for Metro Detroit businesses.",
        "date": "2026-02-23"
    },
    "network-monitoring-tools.html": {
        "title": "Network Monitoring Tools for Business IT",
        "description": "Network monitoring tools provide visibility, alerting, and performance optimization to prevent downtime and security breaches.",
        "date": "2025-12-31"
    },
    "network-security-layers.html": {
        "title": "Network Security Layers: Defense in Depth",
        "description": "Implement layered network security with firewalls, IDS/IPS, segmentation, and zero trust to protect against cyber threats.",
        "date": "2026-01-13"
    },
    "network-segmentation.html": {
        "title": "Network Segmentation for Security and Performance",
        "description": "Network segmentation improves security, performance, and compliance by isolating systems and controlling traffic flow.",
        "date": "2026-02-18"
    },
    "office-365-migration.html": {
        "title": "Office 365 Migration Guide for Businesses",
        "description": "Migrate to Office 365 with minimal disruption. Learn planning, execution, and optimization strategies for Metro Detroit businesses.",
        "date": "2026-01-15"
    },
    "password-management-guide.html": {
        "title": "Password Management Best Practices",
        "description": "81% of breaches involve weak passwords. Implement password management tools and policies to protect your business credentials.",
        "date": "2026-02-19"
    },
    "patch-management-strategy.html": {
        "title": "Patch Management Strategy for Business Security",
        "description": "Effective patch management prevents 85% of targeted attacks. Learn automated patching strategies and best practices.",
        "date": "2026-02-11"
    },
    "quality-management-software.html": {
        "title": "Quality Management Software for Manufacturing",
        "description": "Quality management software automates inspections, tracks defects, and ensures compliance in manufacturing operations.",
        "date": "2026-02-14"
    },
    "ransomware-recovery-plan.html": {
        "title": "Ransomware Recovery Planning",
        "description": "Ransomware attacks increased 150% in 2025. Develop a recovery plan with immutable backups, testing, and incident response procedures.",
        "date": "2026-02-28"
    },
    "remote-work-security.html": {
        "title": "Remote Work Security Best Practices",
        "description": "Secure remote work with VPN, endpoint protection, MFA, and security policies to protect distributed teams from cyber threats.",
        "date": "2026-01-11"
    },
    "scada-systems-guide.html": {
        "title": "SCADA Systems Security and Management Guide",
        "description": "SCADA systems control critical infrastructure. Learn security best practices, network segmentation, and monitoring strategies.",
        "date": "2026-01-23"
    },
    "server-virtualization-benefits.html": {
        "title": "Server Virtualization Benefits for Businesses",
        "description": "Server virtualization reduces costs by 50%, improves disaster recovery, and increases flexibility for Metro Detroit businesses.",
        "date": "2026-02-08"
    },
    "soc2-compliance-guide.html": {
        "title": "SOC 2 Compliance Guide for Service Providers",
        "description": "Achieve SOC 2 compliance with security controls, policies, and audit procedures for Metro Detroit service providers.",
        "date": "2026-02-20"
    },
    "vdi-virtual-desktop.html": {
        "title": "VDI: Virtual Desktop Infrastructure Explained",
        "description": "VDI provides secure, centralized desktop management with improved security, flexibility, and cost savings for businesses.",
        "date": "2026-01-26"
    },
    "voip-troubleshooting.html": {
        "title": "VoIP Troubleshooting Guide",
        "description": "Resolve common VoIP issues including call quality, connectivity, and configuration problems for Metro Detroit businesses.",
        "date": "2026-02-12"
    },
    "voip-vs-traditional-phone.html": {
        "title": "VoIP vs Traditional Phone Systems",
        "description": "Compare VoIP and traditional phone systems. Learn cost savings, features, and migration strategies for Metro Detroit businesses.",
        "date": "2026-01-17"
    },
    "wireless-network-security.html": {
        "title": "Wireless Network Security Best Practices",
        "description": "Secure wireless networks with WPA3, network segmentation, monitoring, and access controls to prevent unauthorized access.",
        "date": "2026-02-06"
    },
    "zero-trust-security.html": {
        "title": "Zero Trust Security Model Explained",
        "description": "Zero trust security eliminates implicit trust with continuous verification, least privilege access, and micro-segmentation.",
        "date": "2026-02-16"
    }
}

def update_blog_post(filename, metadata):
    filepath = BLOG_DIR / filename
    
    if not filepath.exists():
        print(f"⚠️  Skipping {filename} (not found)")
        return False
    
    title = metadata["title"]
    description = metadata["description"]
    date = metadata["date"]
    url = f"{DOMAIN}/blog/{filename}"
    
    print(f"Processing: {filename}")
    print(f"  Title: {title}")
    
    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Backup
    with open(str(filepath) + '.backup', 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        f'<title>{title} | MetroTec IT Blog</title>',
        content,
        count=1
    )
    
    # Add meta description if missing
    if 'meta name="description"' not in content:
        content = re.sub(
            r'(<title>.*?</title>)',
            f'\\1\n  <meta name="description" content="{description}">',
            content,
            count=1
        )
    
    # Add canonical URL if missing
    if 'rel="canonical"' not in content:
        content = re.sub(
            r'(<title>.*?</title>)',
            f'\\1\n  <link rel="canonical" href="{url}">',
            content,
            count=1
        )
    
    # Add Open Graph tags if missing
    if 'og:title' not in content:
        og_tags = f'''  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{DOMAIN}/metrotec-logo.png">
  <meta name="twitter:card" content="summary_large_image">'''
        
        content = re.sub(
            r'(<title>.*?</title>)',
            f'\\1\n{og_tags}',
            content,
            count=1
        )
    
    # Add Article schema if missing
    if '"@type": "Article"' not in content:
        schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{title}",
  "datePublished": "{date}",
  "dateModified": "{date}",
  "author": {{
    "@type": "Organization",
    "name": "MetroTec"
  }},
  "publisher": {{
    "@type": "Organization",
    "name": "MetroTec",
    "logo": {{
      "@type": "ImageObject",
      "url": "{DOMAIN}/metrotec-logo.png"
    }}
  }},
  "description": "{description}"
}}
</script>'''
        
        content = re.sub(
            r'(</head>)',
            f'{schema}\n\\1',
            content,
            count=1
        )
    
    # Write updated content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("  ✅ Updated\n")
    return True

def main():
    print("Starting Phase 1: Critical SEO Fixes")
    print("=" * 40)
    print()
    
    updated = 0
    for filename, metadata in POSTS.items():
        if update_blog_post(filename, metadata):
            updated += 1
    
    print("=" * 40)
    print(f"Phase 1 Complete! Updated {updated}/{len(POSTS)} posts")
    print("Backups saved with .backup extension")

if __name__ == "__main__":
    main()
