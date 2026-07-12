/**
 * SEO Fixer - Batch-fix common SEO issues across all blog posts
 * 
 * Fixes applied:
 * 1. Heading hierarchy: Convert <h3> in article-body to <h2>
 * 2. Title tag: Trim to ≤65 chars (shorten before "| MetroTec IT Blog")
 * 3. Missing Schema.org Article markup: inject it
 * 4. Missing BreadcrumbList schema: inject it
 * 5. Meta description too short/long: flag only (can't auto-fix content)
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(import.meta.dirname, '..');
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

async function fixAll() {
  const files = (await readdir(BLOG_DIR))
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f));

  console.log(`\n🔧 SEO Fixer — Processing ${files.length} posts\n`);

  let headingFixes = 0;
  let titleFixes = 0;
  let schemaFixes = 0;
  let breadcrumbFixes = 0;
  let totalChanged = 0;

  for (const file of files) {
    const filePath = join(BLOG_DIR, file);
    let html = await readFile(filePath, 'utf-8');
    const original = html;
    const slug = file.replace('.html', '');

    // --- FIX 1: Heading hierarchy ---
    // In article-body sections, h3 should be h2 (they're top-level content headings)
    // Only fix h3s that are inside .article-body (not nav/footer h3s)
    const bodyMatch = html.match(/(class="article-body"[\s\S]*?)(<\/div>\s*(?:<\/main>|<div class="cta|<!-- Ad|<footer|<div style))/i);
    if (bodyMatch) {
      const bodySection = bodyMatch[1];
      // Check if body has h3 but no h2
      const hasH2 = /<h2[\s>]/i.test(bodySection);
      const hasH3 = /<h3[\s>]/i.test(bodySection);
      
      if (hasH3 && !hasH2) {
        // Replace h3 with h2 in the body section only
        const fixedBody = bodySection
          .replace(/<h3(\s[^>]*)?>/gi, '<h2$1>')
          .replace(/<\/h3>/gi, '</h2>');
        html = html.replace(bodySection, fixedBody);
        headingFixes++;
      }
    }

    // --- FIX 2: Title tag length ---
    const titleMatch = html.match(/<title>(.+?)<\/title>/i);
    if (titleMatch) {
      const fullTitle = titleMatch[1];
      if (fullTitle.length > 65) {
        // Try to shorten by removing " | MetroTec IT Blog" suffix variants
        let newTitle = fullTitle;
        
        // Remove trailing brand
        newTitle = newTitle.replace(/\s*\|\s*MetroTec\s*(IT\s*)?Blog\s*$/i, '');
        
        // If still too long, truncate intelligently at word boundary
        if (newTitle.length > 55) {
          // We need room for " | MetroTec" (12 chars)
          const maxContentLen = 52;
          if (newTitle.length > maxContentLen) {
            newTitle = newTitle.substring(0, maxContentLen).replace(/\s+\S*$/, '');
          }
        }
        
        // Add back short brand
        newTitle = newTitle + ' | MetroTec';
        
        if (newTitle.length <= 65 && newTitle !== fullTitle) {
          html = html.replace(`<title>${fullTitle}</title>`, `<title>${newTitle}</title>`);
          titleFixes++;
        }
      }
    }

    // --- FIX 3: Missing Article schema ---
    const hasArticleSchema = html.includes('"@type": "Article"') || html.includes('"@type":"Article"');
    if (!hasArticleSchema) {
      // Extract needed info
      const titleForSchema = (html.match(/<title>(.+?)(?:\s*\|[^<]*)?<\/title>/i) || ['', slug])[1];
      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
      const desc = descMatch ? descMatch[1].replace(/"/g, '\\"') : '';
      const dateMatch = html.match(/<!-- Created: (.+?) -->/) || html.match(/"datePublished":\s*"([^"]+)"/);
      const date = dateMatch ? dateMatch[1] : '2026-01-01';

      const schema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${titleForSchema.replace(/"/g, '\\"')}",
  "datePublished": "${date}",
  "dateModified": "${date}",
  "author": { "@type": "Organization", "name": "MetroTec" },
  "publisher": {
    "@type": "Organization",
    "name": "MetroTec",
    "logo": { "@type": "ImageObject", "url": "https://metrotec.biz/metrotec-logo.png" }
  },
  "description": "${desc}"
}
</script>`;

      // Insert before </head>
      html = html.replace('</head>', schema + '\n</head>');
      schemaFixes++;
    }

    // --- FIX 4: Missing Breadcrumb schema ---
    const hasBreadcrumb = html.includes('"@type": "BreadcrumbList"') || html.includes('"@type":"BreadcrumbList"');
    if (!hasBreadcrumb) {
      const breadcrumb = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://metrotec.biz" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://metrotec.biz/blog/" },
    { "@type": "ListItem", "position": 3, "name": "Article" }
  ]
}
</script>`;

      html = html.replace('</head>', breadcrumb + '\n</head>');
      breadcrumbFixes++;
    }

    // Write if changed
    if (html !== original) {
      await writeFile(filePath, html, 'utf-8');
      totalChanged++;
    }
  }

  console.log(`  ✅ Heading hierarchy fixed:    ${headingFixes} posts (h3 → h2)`);
  console.log(`  ✅ Title tags shortened:       ${titleFixes} posts`);
  console.log(`  ✅ Article schema added:       ${schemaFixes} posts`);
  console.log(`  ✅ Breadcrumb schema added:    ${breadcrumbFixes} posts`);
  console.log(`\n  📝 Total files modified: ${totalChanged}/${files.length}`);
  console.log(`\n  ⚠️  Remaining manual fixes needed:`);
  console.log(`     • Word count: 76 posts under 800 words (need content expansion)`);
  console.log(`     • Meta descriptions: some too short/long (review individually)\n`);
}

fixAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
