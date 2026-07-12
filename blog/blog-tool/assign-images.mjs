/**
 * Assign blog images to appropriate posts based on topic/category
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(import.meta.dirname, '..');
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

// Map: image file → array of post slugs that should use it
const IMAGE_MAP = {
  '../images/blog/Cyber attack in a high-tech office.png': [
    'cybersecurity-threats-2026',
    'cybersecurity-insurance',
    'small-business-cybersecurity-checklist',
    'modernizing-cybersecurity-smb',
    'layered-security-approach-small-business',
    'ransomware-recovery-plan',
    'incident-response-plan',
    'email-security-best-practices',
    'email-security-spam-filtering',
    'phishing-training-employees',
    'zero-trust-security',
    'active-directory-security',
    'endpoint-security-guide',
    'endpoint-security-tiers-guide',
    'endpoint-detection-response',
    'behavior-shield-ransomware-protection',
    'security-management-console-benefits',
    'centralized-security-management',
    'business-security-essential-vs-premium',
    'business-security-tiers-comparison',
    'software-patches-cybersecurity-seatbelt',
    'patch-management-critical-security',
    'patch-management-strategy',
    'patch-management-automation',
    'password-management-guide',
    'password-manager-business-security',
    'mfa-security-guide',
    'multi-factor-authentication-guide',
    'secure-web-gateway-business-protection',
    'remote-work-security',
    'hybrid-work-security-2026',
  ],
  '../images/blog/cloud-migration-guide.png': [
    'cloud-migration-guide',
    'aws-vs-azure',
    'cloud-cost-optimization',
    'cloud-backup-solutions',
    'cloud-backup-vs-traditional',
    'cloud-backup-business-guide',
    'cloud-vs-onpremise-comparison',
    'microsoft-365-security',
    'microsoft-365-migration-guide',
    'office-365-migration',
    'kubernetes-basics',
    'server-virtualization-benefits',
    'ai-business-it-2026',
    '5g-network-business-2026',
  ],
  '../images/blog/data-backup-strategy-321-rule.png': [
    'data-backup-strategy-321-rule',
    'data-backup-vs-archive',
    'backup-strategy-guide',
    'cloud-backup-disaster-recovery-guide',
    'disaster-recovery-planning',
    'disaster-recovery-testing',
    'it-documentation-guide',
    'it-documentation-disaster-recovery',
    'soc2-compliance-guide',
    'hipaa-compliance-guide',
    'it-compliance-checklist',
    'compliance-requirements-small-business',
    'it-budget-planning-2026',
  ],
  '../images/blog/manufacturing-downtime-prevention.png': [
    'manufacturing-downtime-prevention',
    'cost-of-downtime',
    'erp-systems-manufacturing',
    'cnc-machine-monitoring',
    'mes-manufacturing-execution',
    'iot-manufacturing-sensors',
    'scada-systems-guide',
    'quality-management-software',
    'managed-it-troy-businesses',
  ],
  '../images/blog/virtual-desktop-infrastructure.png': [
    'virtual-desktop-infrastructure',
    'vdi-virtual-desktop',
    'remote-control-it-support',
    'remote-control-it-support-efficiency',
    'voip-vs-traditional-phone',
    'voip-troubleshooting',
    'voip-phone-system-benefits',
    'network-monitoring-tools',
    'network-monitoring-prevent-downtime',
    'network-security-layers',
    'network-segmentation',
    'network-segmentation-security',
    'server-maintenance-best-practices',
    'wireless-network-security',
  ],
};

async function assignImages() {
  let updated = 0;
  let alreadyHad = 0;

  for (const [imagePath, slugs] of Object.entries(IMAGE_MAP)) {
    const altText = imagePath.split('/').pop().replace('.png', '').replace(/-/g, ' ');

    for (const slug of slugs) {
      const filePath = join(BLOG_DIR, `${slug}.html`);
      let html;
      try {
        html = await readFile(filePath, 'utf-8');
      } catch {
        continue; // file doesn't exist
      }

      // Check if already has a hero image with a real src (not unsplash placeholder)
      const hasRealImage = html.includes('class="hero-image"') && 
        !html.includes('source.unsplash.com') &&
        html.includes('images/blog/');
      
      if (hasRealImage) {
        alreadyHad++;
        continue;
      }

      const original = html;

      // Strategy 1: Replace unsplash placeholder in hero-image
      if (html.includes('class="hero-image"') && html.includes('source.unsplash.com')) {
        html = html.replace(
          /<div class="hero-image">.*?<\/div>/s,
          `<div class="hero-image"><img src="${imagePath}" alt="${altText}" loading="lazy"></div>`
        );
      }
      // Strategy 2: Add hero-image after article-header if none exists
      else if (!html.includes('class="hero-image"') && html.includes('</div>\n\n  <main') || html.includes('class="article-body"')) {
        // Insert before article-body
        const insertPoint = html.indexOf('class="article-body"');
        if (insertPoint !== -1) {
          // Find the opening div before article-body
          const beforeBody = html.lastIndexOf('<', insertPoint);
          const heroHtml = `\n  <div class="hero-image"><img src="${imagePath}" alt="${altText}" loading="lazy" style="width:100%;max-height:420px;object-fit:cover;display:block;"></div>\n\n  `;
          // Insert right before the article-body div
          const divStart = html.lastIndexOf('<div', insertPoint);
          if (divStart !== -1) {
            html = html.slice(0, divStart) + heroHtml + html.slice(divStart);
          }
        }
      }

      if (html !== original) {
        await writeFile(filePath, html, 'utf-8');
        updated++;
      }
    }
  }

  console.log(`\n🖼️  Image Assignment Results:`);
  console.log(`   ✅ Images added to: ${updated} posts`);
  console.log(`   ⏭️  Already had images: ${alreadyHad} posts`);
  console.log(`   📁 Source: images/blog/ (5 images)\n`);
}

assignImages().catch(err => { console.error(err); process.exit(1); });
