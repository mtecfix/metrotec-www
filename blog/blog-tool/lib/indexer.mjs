/**
 * Blog Indexer - Rebuilds index.html card entries and allposts.html
 * Scans all blog HTML files, extracts metadata, and updates the listing pages.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(import.meta.dirname, '..', '..');
const BLOG_POST_DIR = BLOG_DIR;
const SKIP_FILES = ['index.html', 'allposts.html', 'test2.html'];

const CATEGORY_ICONS = {
  'cybersecurity': 'bi-shield-lock-fill',
  'security': 'bi-key-fill',
  'cloud': 'bi-cloud-fill',
  'data protection': 'bi-hdd-stack-fill',
  'manufacturing': 'bi-gear-wide-connected',
  'healthcare': 'bi-heart-pulse',
  'managed it': 'bi-headset',
  'compliance': 'bi-clipboard-check-fill',
  'network': 'bi-hdd-network-fill',
  'voip': 'bi-telephone-fill',
  'ai': 'bi-cpu-fill',
};

function getCategoryIcon(category) {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return 'bi-file-earmark-text-fill';
}

async function extractMeta(filePath) {
  const html = await readFile(filePath, 'utf-8');
  const fileName = filePath.split('/').pop().split('\\').pop();

  const titleMatch = html.match(/<title>(.+?)\s*\|/i) || html.match(/<title>(.+?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : fileName.replace('.html', '');

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const description = descMatch ? descMatch[1] : '';

  const categoryMatch = html.match(/class="article-category">([^<]+)</i);
  const category = categoryMatch ? categoryMatch[1].trim() : 'General';

  const dateMatch = html.match(/"datePublished":\s*"([^"]+)"/);
  const date = dateMatch ? dateMatch[1] : '2026-01-01';

  const createdMatch = html.match(/<!-- Created: (.+?) -->/);
  const created = createdMatch ? createdMatch[1].trim() : date;

  // Check for hero image
  const imgMatch = html.match(/class="hero-image"[^>]*>.*?<img[^>]+src="([^"]+)"/s);
  const image = imgMatch ? imgMatch[1] : null;

  return { fileName, title, description, category, date: created || date, image };
}

export async function reindex() {
  console.log('🔄 Rebuilding blog index...\n');

  const files = (await readdir(BLOG_POST_DIR))
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f))
    .sort();

  const posts = [];
  for (const file of files) {
    const meta = await extractMeta(join(BLOG_POST_DIR, file));
    posts.push(meta);
  }

  // Sort by date descending
  posts.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`   Found ${posts.length} posts`);

  // Get unique months for date filters
  const months = [...new Set(posts.map(p => p.date.substring(0, 7)))].sort().reverse();

  // Generate index.html cards (show top 6 + ad slot)
  const topPosts = posts.slice(0, 6);
  let cardsHtml = '';
  for (let i = 0; i < topPosts.length; i++) {
    const p = topPosts[i];
    const icon = getCategoryIcon(p.category);
    const slug = p.fileName.replace('.html', '');
    const month = p.date.substring(0, 7);

    if (i === 3) {
      // Ad slot after 3rd card
      cardsHtml += `
        <!-- In-grid ad slot (spans full row) -->
        <div class="ad-slot">
          <div class="ad-slot-label">Sponsored</div>
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-8815300775068949"
               data-ad-slot="6120355328"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>\n`;
    }

    const imageHtml = p.image
      ? `<img src="${p.image}" alt="${p.title}" loading="lazy">`
      : `<i class="bi ${icon} placeholder-icon"></i>`;

    cardsHtml += `
        <article class="article" data-title="${slug}" data-month="${month}" data-category="${p.category}">
          <div class="article-image">
            ${imageHtml}
          </div>
          <div class="article-body">
            <span class="article-meta">${p.category}</span>
            <h3><a href="${p.fileName}">${p.title}</a></h3>
            <p class="article-excerpt">${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}</p>
          </div>
        </article>\n`;
  }

  // Update index.html - replace the article-grid contents
  const indexPath = join(BLOG_POST_DIR, 'index.html');
  let indexHtml = await readFile(indexPath, 'utf-8');

  // Replace article grid content
  const gridStart = indexHtml.indexOf('<div class="article-grid" id="articleList">');
  const gridEnd = indexHtml.indexOf('</div>', indexHtml.indexOf('</div>', gridStart + 1) + 1);
  // Find the closing </div> that matches the article-grid
  const afterGrid = indexHtml.indexOf('\n      </div>\n      \n      <div style="text-align: center;');

  if (gridStart !== -1 && afterGrid !== -1) {
    indexHtml = indexHtml.substring(0, gridStart) +
      `<div class="article-grid" id="articleList">${cardsHtml}\n      ` +
      indexHtml.substring(afterGrid);
  }

  // Update date filters
  const dateFilterHtml = `<div class="date-filter-row">
        <button class="date-filter active" onclick="filterByDate(event, 'all')">All Posts</button>
${months.slice(0, 6).map(m => {
    const d = new Date(m + '-15');
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `        <button class="date-filter" onclick="filterByDate(event, '${m}')">${label}</button>`;
  }).join('\n')}
      </div>`;

  indexHtml = indexHtml.replace(
    /<div class="date-filter-row">[\s\S]*?<\/div>/,
    dateFilterHtml
  );

  await writeFile(indexPath, indexHtml, 'utf-8');
  console.log('   ✅ Updated blog/index.html');

  // Generate allposts.html
  await generateAllPosts(posts, months);
  console.log('   ✅ Updated blog/allposts.html');
  console.log(`\n📊 Index rebuilt: ${posts.length} posts, ${months.length} months of content\n`);
}

async function generateAllPosts(posts, months) {
  const rows = posts.map(p => {
    const icon = getCategoryIcon(p.category);
    return `          <tr>
            <td><i class="bi ${icon}" style="color:#7c3aed;margin-right:0.5rem;"></i><a href="${p.fileName}" style="color:#1a1a1a;text-decoration:none;font-weight:600;">${p.title}</a></td>
            <td style="color:#6b7280;">${p.category}</td>
            <td style="color:#6b7280;white-space:nowrap;">${p.date}</td>
          </tr>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<script>
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !sessionStorage.getItem('prefer_desktop')) {
    window.location.replace('../m/blog/index.html');
  }
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8815300775068949" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17815464842"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17815464842');
</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Blog Posts | MetroTec IT Blog</title>
  <meta name="description" content="Browse all MetroTec IT blog posts covering cybersecurity, cloud services, managed IT, and more for Metro Detroit businesses.">
  <link rel="canonical" href="https://metrotec.biz/blog/allposts.html">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
  <link rel="stylesheet" href="../universal-ui.css">
  <link rel="stylesheet" href="../mobile-optimized.css">
  <style>
    .page-header { background: #1a1a1a; color: white; padding: 2.25rem 0; border-bottom: 4px solid #7c3aed; text-align: center; }
    .page-title { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 900; margin: 0; }
    .page-subtitle { font-size: 0.875rem; color: #9ca3af; margin-top: 0.5rem; }
    .content { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-bar input { width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; }
    .search-bar input:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,0.12); }
    .post-count { font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem 1rem; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.95rem; }
    tr:hover { background: #faf5ff; }
    @media (max-width: 768px) {
      td:nth-child(3) { display: none; }
      th:nth-child(3) { display: none; }
    }
  </style>
</head>
<body>
<a href="#main-content" class="skip-link">Skip to main content</a>
<header class="header">
  <div class="container">
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <a href="../index.html" class="nav-brand" aria-label="MetroTec Home">
        <div style="display: inline-block;"><img class="responsive-img" src="../metrotec-logo.png" alt="MetroTec"></div>
      </a>
      <ul class="nav-links">
        <li><a href="../services.html" class="nav-link">Services</a></li>
        <li><a href="../about.html" class="nav-link">About</a></li>
        <li><a href="../industries.html" class="nav-link">Industries</a></li>
        <li><a href="index.html" class="nav-link">Blog</a></li>
        <li><a href="../contact.html" class="nav-link">Contact</a></li>
      </ul>
      <div class="desktop-only">
        <a href="../get-quote.html" class="btn btn-primary" style="white-space: nowrap;">Get Quote</a>
      </div>
    </nav>
  </div>
</header>

<div class="page-header">
  <h1 class="page-title">All Posts</h1>
  <p class="page-subtitle">${posts.length} articles • Metro Detroit IT News & Insights</p>
</div>

<main id="main-content" class="content">
  <div class="search-bar">
    <input type="text" id="search" placeholder="🔍 Search articles..." oninput="filterPosts()">
  </div>
  <p class="post-count"><span id="visibleCount">${posts.length}</span> posts</p>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Category</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody id="postList">
${rows}
    </tbody>
  </table>
</main>

<footer style="background:#0f172a;padding:20px 0;color:rgba(255,255,255,0.7);margin-top:3rem;">
  <div style="max-width:1200px;margin:auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
    <span style="font-style:italic;font-size:0.875rem;">Business IT Support Solutions</span>
    <ul style="list-style:none;padding:0;margin:0;display:flex;gap:24px;flex-wrap:wrap;">
      <li><a href="../index.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Home</a></li>
      <li><a href="../services.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Services</a></li>
      <li><a href="index.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Blog</a></li>
      <li><a href="../contact.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Contact</a></li>
    </ul>
    <span style="font-size:0.8rem;">© 2026 MetroTec</span>
  </div>
</footer>

<script>
function filterPosts() {
  const q = document.getElementById('search').value.toLowerCase();
  const rows = document.querySelectorAll('#postList tr');
  let visible = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const show = text.includes(q);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('visibleCount').textContent = visible;
}
</script>
</body>
</html>`;

  await writeFile(join(BLOG_POST_DIR, 'allposts.html'), html, 'utf-8');
}
