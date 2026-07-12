/**
 * Fix missing Open Graph tags on blog posts
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(import.meta.dirname, '..');
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

async function fixOG() {
  const files = (await readdir(BLOG_DIR))
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f));

  let fixed = 0;

  for (const file of files) {
    const filePath = join(BLOG_DIR, file);
    let html = await readFile(filePath, 'utf-8');

    if (html.includes('og:title')) continue; // already has OG

    const slug = file.replace('.html', '');

    // Extract title and description
    const titleMatch = html.match(/<title>(.+?)(?:\s*\|[^<]*)?<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : slug;
    
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const desc = descMatch ? descMatch[1] : '';

    const ogTags = `  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
  <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://metrotec.biz/blog/${file}">
  <meta property="og:image" content="https://metrotec.biz/metrotec-logo.png">
  <meta name="twitter:card" content="summary_large_image">`;

    // Insert after the meta description tag, or before </head>
    if (descMatch) {
      html = html.replace(
        descMatch[0],
        descMatch[0] + '\n' + ogTags
      );
    } else {
      html = html.replace('</head>', ogTags + '\n</head>');
    }

    await writeFile(filePath, html, 'utf-8');
    fixed++;
  }

  console.log(`✅ Added Open Graph tags to ${fixed} posts`);
}

fixOG().catch(err => { console.error(err); process.exit(1); });
