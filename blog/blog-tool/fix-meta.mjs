/**
 * Fix short meta descriptions by extracting from article content
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(import.meta.dirname, '..');
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

async function fixMetaDesc() {
  const files = (await readdir(BLOG_DIR))
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f));

  let fixed = 0;

  for (const file of files) {
    const filePath = join(BLOG_DIR, file);
    let html = await readFile(filePath, 'utf-8');

    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (!descMatch) continue;
    
    const currentDesc = descMatch[1];
    if (currentDesc.length >= 120 && currentDesc.length <= 160) continue;

    if (currentDesc.length >= 120) continue; // Only fix too-short ones

    // Extract first meaningful paragraph from article body
    const bodyMatch = html.match(/class="article-body"[^>]*>([\s\S]*?)<\/div>/i);
    if (!bodyMatch) continue;

    const body = bodyMatch[1];
    // Get text from paragraphs
    const paragraphs = body.match(/<p[^>]*>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi) || [];
    
    let bestDesc = currentDesc;
    
    for (const p of paragraphs) {
      // Strip HTML tags
      const text = p.replace(/<[^>]+>/g, '').trim();
      if (text.length < 80) continue; // skip short paras
      
      // Take first ~155 chars at a word boundary
      let candidate = text.substring(0, 155);
      if (text.length > 155) {
        candidate = candidate.replace(/\s+\S*$/, '') + '...';
      }
      
      // Must be better than what we have
      if (candidate.length >= 120 && candidate.length <= 160) {
        bestDesc = candidate;
        break;
      } else if (candidate.length > 100 && candidate.length < 120) {
        // Pad slightly with context
        const extra = text.substring(candidate.length - 3, 155);
        bestDesc = text.substring(0, 155).replace(/\s+\S*$/, '');
        if (bestDesc.length < 160 && bestDesc.length > 100) {
          bestDesc += '...';
          break;
        }
      }
    }

    // If we still couldn't get a good one, build from title + current desc
    if (bestDesc.length < 100) {
      const titleMatch = html.match(/<title>(.+?)(?:\s*\|[^<]*)?<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      bestDesc = `${title}. ${currentDesc}`.substring(0, 155);
      if (bestDesc.length < 155) {
        bestDesc += ' Learn how MetroTec helps Metro Detroit businesses.';
      }
      bestDesc = bestDesc.substring(0, 158);
    }

    // Clean up
    bestDesc = bestDesc.replace(/"/g, "'").replace(/\s+/g, ' ').trim();
    if (bestDesc.length > 160) bestDesc = bestDesc.substring(0, 157) + '...';

    if (bestDesc !== currentDesc && bestDesc.length >= 100) {
      html = html.replace(descMatch[0], `<meta name="description" content="${bestDesc}"`);
      
      // Also update og:description if present
      const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
      if (ogDescMatch) {
        html = html.replace(ogDescMatch[0], `<meta property="og:description" content="${bestDesc}"`);
      }
      
      await writeFile(filePath, html, 'utf-8');
      fixed++;
    }
  }

  console.log(`✅ Improved meta descriptions on ${fixed} posts`);
}

fixMetaDesc().catch(err => { console.error(err); process.exit(1); });
