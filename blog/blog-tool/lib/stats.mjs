/**
 * Blog Stats - Quick overview of the blog's health
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_POST_DIR = join(import.meta.dirname, '..', '..');
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

export async function showStats() {
  const files = (await readdir(BLOG_POST_DIR))
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f));

  const categories = {};
  const months = {};
  let totalWords = 0;
  let withImages = 0;
  let withSchema = 0;
  let withMetaDesc = 0;

  for (const file of files) {
    const html = await readFile(join(BLOG_POST_DIR, file), 'utf-8');

    // Category
    const catMatch = html.match(/class="article-category">([^<]+)</i);
    const cat = catMatch ? catMatch[1].trim() : 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;

    // Date
    const dateMatch = html.match(/"datePublished":\s*"([^"]+)"/) || html.match(/<!-- Created: (.+?) -->/);
    if (dateMatch) {
      const month = dateMatch[1].substring(0, 7);
      months[month] = (months[month] || 0) + 1;
    }

    // Word count
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
    totalWords += text.split(' ').filter(w => w.length > 2).length;

    // Features
    if (html.includes('hero-image') || html.includes('article-image')) withImages++;
    if (html.includes('"@type": "Article"') || html.includes('"@type":"Article"')) withSchema++;
    if (html.match(/<meta\s+name="description"/i)) withMetaDesc++;
  }

  const avgWords = Math.round(totalWords / files.length);

  console.log(`
╔══════════════════════════════════════════════════╗
║           MetroTec Blog Stats                    ║
╠══════════════════════════════════════════════════╣

  📝 Total Posts:        ${files.length}
  📖 Total Words:        ${totalWords.toLocaleString()}
  📊 Avg Words/Post:     ${avgWords}
  🖼️  Posts with Images:  ${withImages}/${files.length} (${Math.round(withImages/files.length*100)}%)
  🏷️  With Schema.org:    ${withSchema}/${files.length} (${Math.round(withSchema/files.length*100)}%)
  📋 With Meta Desc:     ${withMetaDesc}/${files.length} (${Math.round(withMetaDesc/files.length*100)}%)

  📂 Categories:`);

  const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats) {
    const bar = '█'.repeat(Math.ceil(count / 2));
    console.log(`     ${cat.padEnd(20)} ${bar} ${count}`);
  }

  console.log(`\n  📅 Posts by Month:`);
  const sortedMonths = Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  for (const [month, count] of sortedMonths.slice(0, 8)) {
    const bar = '█'.repeat(count);
    console.log(`     ${month}  ${bar} ${count}`);
  }

  // Freshness check
  const latestMonth = sortedMonths[0]?.[0] || 'unknown';
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthsStale = monthDiff(latestMonth, currentMonth);

  console.log(`\n  ⏰ Freshness:`);
  console.log(`     Latest post:       ${latestMonth}`);
  console.log(`     Current month:     ${currentMonth}`);
  if (monthsStale > 0) {
    console.log(`     ⚠️  ${monthsStale} month(s) without new content!`);
  } else {
    console.log(`     ✅ Blog is current`);
  }

  console.log(`
╚══════════════════════════════════════════════════╝
`);
}

function monthDiff(from, to) {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}
