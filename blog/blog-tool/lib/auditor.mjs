/**
 * SEO Auditor - Scans blog posts for SEO issues
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const BLOG_DIR = join(import.meta.dirname, '..', '..');
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

// SEO rules and their weights
const RULES = [
  { id: 'title', name: 'Title tag', weight: 15, check: checkTitle },
  { id: 'meta-desc', name: 'Meta description', weight: 12, check: checkMetaDesc },
  { id: 'h1', name: 'H1 heading', weight: 10, check: checkH1 },
  { id: 'canonical', name: 'Canonical URL', weight: 8, check: checkCanonical },
  { id: 'og-tags', name: 'Open Graph tags', weight: 8, check: checkOG },
  { id: 'schema', name: 'Schema.org markup', weight: 10, check: checkSchema },
  { id: 'word-count', name: 'Word count (>800)', weight: 10, check: checkWordCount },
  { id: 'internal-links', name: 'Internal links', weight: 7, check: checkInternalLinks },
  { id: 'images', name: 'Image alt text', weight: 8, check: checkImages },
  { id: 'mobile-redirect', name: 'Mobile redirect', weight: 5, check: checkMobileRedirect },
  { id: 'heading-hierarchy', name: 'Heading hierarchy', weight: 7, check: checkHeadings },
];

function checkTitle(html) {
  const match = html.match(/<title>(.+?)<\/title>/i);
  if (!match) return { pass: false, detail: 'Missing <title> tag' };
  const title = match[1];
  if (title.length < 30) return { pass: false, detail: `Title too short (${title.length} chars, need 30+)` };
  if (title.length > 65) return { pass: false, detail: `Title too long (${title.length} chars, max 65)` };
  if (!title.includes('MetroTec')) return { pass: false, detail: 'Title missing brand name "MetroTec"' };
  return { pass: true, detail: `OK: "${title}" (${title.length} chars)` };
}

function checkMetaDesc(html) {
  const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (!match) return { pass: false, detail: 'Missing meta description' };
  const desc = match[1];
  if (desc.length < 120) return { pass: false, detail: `Too short (${desc.length} chars, need 120+)` };
  if (desc.length > 160) return { pass: false, detail: `Too long (${desc.length} chars, max 160)` };
  return { pass: true, detail: `OK (${desc.length} chars)` };
}

function checkH1(html) {
  const matches = html.match(/<h1[^>]*>(.+?)<\/h1>/gi);
  if (!matches) return { pass: false, detail: 'No H1 found' };
  if (matches.length > 2) return { pass: false, detail: `Multiple H1s (${matches.length}) — should be 1-2 max` };
  return { pass: true, detail: 'OK' };
}

function checkCanonical(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!match) return { pass: false, detail: 'Missing canonical link' };
  if (!match[1].startsWith('https://')) return { pass: false, detail: 'Canonical not using HTTPS' };
  return { pass: true, detail: `OK: ${match[1]}` };
}

function checkOG(html) {
  const issues = [];
  if (!html.includes('og:title')) issues.push('og:title');
  if (!html.includes('og:description')) issues.push('og:description');
  if (!html.includes('og:type')) issues.push('og:type');
  if (!html.includes('og:url')) issues.push('og:url');
  if (issues.length > 0) return { pass: false, detail: `Missing: ${issues.join(', ')}` };
  return { pass: true, detail: 'All OG tags present' };
}

function checkSchema(html) {
  const hasArticle = html.includes('"@type": "Article"') || html.includes('"@type":"Article"');
  const hasBreadcrumb = html.includes('"@type": "BreadcrumbList"') || html.includes('"@type":"BreadcrumbList"');
  if (!hasArticle && !hasBreadcrumb) return { pass: false, detail: 'No structured data found' };
  if (!hasArticle) return { pass: false, detail: 'Has Breadcrumb but missing Article schema' };
  return { pass: true, detail: hasArticle && hasBreadcrumb ? 'Article + Breadcrumb' : 'Article schema present' };
}

function checkWordCount(html) {
  // Strip HTML, scripts, styles
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = text.split(' ').filter(w => w.length > 2).length;
  if (words < 500) return { pass: false, detail: `Only ${words} words (need 800+ for SEO)` };
  if (words < 800) return { pass: false, detail: `${words} words — thin content (aim for 800+)` };
  return { pass: true, detail: `${words} words` };
}

function checkInternalLinks(html) {
  const links = html.match(/href="[^"]*\.html"/gi) || [];
  const internal = links.filter(l => !l.includes('http'));
  if (internal.length < 2) return { pass: false, detail: `Only ${internal.length} internal links (need 2+)` };
  return { pass: true, detail: `${internal.length} internal links` };
}

function checkImages(html) {
  const imgs = html.match(/<img[^>]+>/gi) || [];
  if (imgs.length === 0) return { pass: false, detail: 'No images found' };
  const missingAlt = imgs.filter(img => !img.includes('alt=') || img.includes('alt=""'));
  if (missingAlt.length > 0) return { pass: false, detail: `${missingAlt.length}/${imgs.length} images missing alt text` };
  return { pass: true, detail: `${imgs.length} images, all with alt text` };
}

function checkMobileRedirect(html) {
  if (html.includes("window.location.replace('../m/blog/")) return { pass: true, detail: 'Mobile redirect present' };
  return { pass: false, detail: 'No mobile redirect script' };
}

function checkHeadings(html) {
  const h2s = (html.match(/<h2/gi) || []).length;
  const h3s = (html.match(/<h3/gi) || []).length;
  if (h2s === 0 && h3s === 0) return { pass: false, detail: 'No subheadings (H2/H3) in content' };
  if (h3s > 0 && h2s === 0) return { pass: false, detail: 'Has H3s but no H2s — broken hierarchy' };
  return { pass: true, detail: `${h2s} H2s, ${h3s} H3s` };
}

async function auditFile(filePath) {
  const html = await readFile(filePath, 'utf-8');
  const fileName = basename(filePath);
  let totalScore = 0;
  let maxScore = 0;
  const results = [];

  for (const rule of RULES) {
    maxScore += rule.weight;
    const result = rule.check(html);
    if (result.pass) totalScore += rule.weight;
    results.push({ ...rule, ...result });
  }

  const score = Math.round((totalScore / maxScore) * 100);
  return { fileName, score, results, totalScore, maxScore };
}

export async function auditAll() {
  const files = (await readdir(BLOG_DIR))
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f))
    .sort();

  console.log(`\n🔍 SEO Audit: ${files.length} blog posts\n`);
  console.log('─'.repeat(70));

  const audits = [];
  let totalScore = 0;

  for (const file of files) {
    const result = await auditFile(join(BLOG_DIR, file));
    audits.push(result);
    totalScore += result.score;

    const bar = scoreBar(result.score);
    const slug = file.replace('.html', '');
    console.log(`${bar} ${result.score.toString().padStart(3)}%  ${slug.substring(0, 45)}`);
  }

  console.log('─'.repeat(70));
  const avg = Math.round(totalScore / files.length);
  console.log(`\n📊 Average SEO Score: ${avg}%`);
  console.log(`   Posts scoring 90+: ${audits.filter(a => a.score >= 90).length}`);
  console.log(`   Posts scoring 70-89: ${audits.filter(a => a.score >= 70 && a.score < 90).length}`);
  console.log(`   Posts scoring <70: ${audits.filter(a => a.score < 70).length}`);

  // Top issues
  const issueCounts = {};
  for (const audit of audits) {
    for (const r of audit.results) {
      if (!r.pass) {
        issueCounts[r.name] = (issueCounts[r.name] || 0) + 1;
      }
    }
  }
  const sorted = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    console.log(`\n⚠️  Top Issues (most common):`);
    for (const [name, count] of sorted.slice(0, 8)) {
      console.log(`   • ${name}: ${count}/${files.length} posts affected`);
    }
  }
  console.log('');
}

export async function auditOne(slug) {
  const fileName = slug.endsWith('.html') ? slug : `${slug}.html`;
  const filePath = join(BLOG_DIR, fileName);

  try {
    const result = await auditFile(filePath);
    console.log(`\n🔍 SEO Audit: ${result.fileName}`);
    console.log(`   Score: ${result.score}% ${scoreEmoji(result.score)}\n`);
    console.log('─'.repeat(60));

    for (const r of result.results) {
      const icon = r.pass ? '✅' : '❌';
      const weight = `[${r.weight}pts]`;
      console.log(`${icon} ${weight.padEnd(7)} ${r.name.padEnd(22)} ${r.detail}`);
    }
    console.log('─'.repeat(60));
    console.log(`\n   Total: ${result.totalScore}/${result.maxScore} points → ${result.score}%\n`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`File not found: ${fileName}`);
      console.error(`Looking in: ${BLOG_DIR}`);
    } else {
      throw err;
    }
  }
}

function scoreBar(score) {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  const color = score >= 90 ? '\x1b[32m' : score >= 70 ? '\x1b[33m' : '\x1b[31m';
  return `${color}${'█'.repeat(filled)}${'░'.repeat(empty)}\x1b[0m`;
}

function scoreEmoji(score) {
  if (score >= 90) return '🟢 Excellent';
  if (score >= 75) return '🟡 Good';
  if (score >= 60) return '🟠 Needs Work';
  return '🔴 Poor';
}
