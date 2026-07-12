/**
 * Blog Post Generator - Creates SEO-optimized posts matching existing layouts
 */
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const BLOG_DIR = join(import.meta.dirname, '..', '..');
const BLOG_POST_DIR = BLOG_DIR;

const CATEGORIES = [
  'Cybersecurity', 'Cloud', 'Data Protection', 'Manufacturing',
  'Healthcare', 'Managed IT', 'Security', 'Compliance',
  'Network', 'VoIP', 'AI & Automation'
];

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

function today() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function generateHTML({ title, slug, category, metaDesc, subtitle, sections, date }) {
  const dateFormatted = formatDate(date);
  const wordCount = sections.reduce((sum, s) => sum + s.body.split(' ').length, 0);
  const readTime = Math.max(3, Math.ceil(wordCount / 250));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<script>
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !sessionStorage.getItem('prefer_desktop')) {
    window.location.replace('../m/blog/${slug}.html');
  }
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8815300775068949" crossorigin="anonymous"></script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17815464842"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17815464842');
</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | MetroTec IT Blog</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://metrotec.biz/blog/${slug}.html">
  <meta property="og:image" content="https://metrotec.biz/metrotec-logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://metrotec.biz/blog/${slug}.html">
  <meta name="description" content="${metaDesc}">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Merriweather', serif; line-height: 1.8; color: #1a1a1a; background: #f5f5f5; }
    .newspaper-wrapper { max-width: 1200px; margin: 2rem auto; background: white; box-shadow: 0 0 30px rgba(0,0,0,0.1); }
    .masthead { background: #000; color: white; padding: 2rem; text-align: center; border-bottom: 4px solid #7c3aed; }
    .masthead-title { font-family: 'Playfair Display', serif; font-size: 4rem; font-weight: 900; letter-spacing: 0.1em; margin: 0; }
    .masthead-tagline { font-size: 0.875rem; margin-top: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase; }
    .masthead-date { font-size: 0.75rem; margin-top: 0.5rem; color: #999; }
    .article-header { padding: 3rem 3rem 2rem; border-bottom: 3px solid #000; }
    .article-category { color: #7c3aed; font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
    .article-title { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 700; line-height: 1.1; margin-bottom: 1rem; }
    .article-subtitle { font-size: 1.5rem; color: #666; line-height: 1.4; margin-bottom: 1rem; }
    .article-byline { font-size: 0.875rem; color: #999; }
    .article-body { padding: 2rem 3rem; column-count: 2; column-gap: 3rem; }
    .article-body p { margin-bottom: 1.25rem; text-align: left; }
    .article-body .drop-cap::first-letter { font-size: 4rem; font-weight: 700; float: left; line-height: 0.8; margin: 0.1rem 0.5rem 0 0; font-family: 'Playfair Display', serif; }
    .article-body h2 { font-family: 'Playfair Display', serif; font-size: 1.75rem; margin: 2.5rem 0 1rem; column-span: all; border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
    .article-body h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin: 2rem 0 1rem; column-span: all; }
    .pullquote { column-span: all; text-align: center; font-size: 1.75rem; font-style: italic; padding: 2rem 4rem; margin: 2rem 0; border-top: 3px solid #7c3aed; border-bottom: 3px solid #7c3aed; font-family: 'Playfair Display', serif; }
    .sidebar { background: #f9f9f9; padding: 1.5rem; margin: 2rem 0; border-left: 4px solid #7c3aed; column-span: all; }
    .sidebar h4 { font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.75rem; }
    .cta-box { column-span: all; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 2.5rem; border-radius: 0.75rem; margin: 2.5rem 0; text-align: center; }
    .cta-box h3 { color: white; border: none; margin: 0 0 0.75rem; font-size: 1.5rem; }
    .cta-box p { margin-bottom: 1.25rem; font-size: 1.1rem; opacity: 0.9; }
    .cta-box a { display: inline-block; background: white; color: #7c3aed; padding: 0.85rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; }
    @media (max-width: 768px) {
      .article-body { column-count: 1; padding: 2rem 1.5rem; }
      .article-header { padding: 2rem 1.5rem; }
      .article-title { font-size: 2.5rem; }
      .masthead-title { font-size: 2.5rem; }
    }
  </style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "datePublished": "${date}",
  "dateModified": "${date}",
  "author": { "@type": "Organization", "name": "MetroTec" },
  "publisher": {
    "@type": "Organization",
    "name": "MetroTec",
    "logo": { "@type": "ImageObject", "url": "https://metrotec.biz/metrotec-logo.png" }
  },
  "description": "${metaDesc}"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://metrotec.biz" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://metrotec.biz/blog/" },
    { "@type": "ListItem", "position": 3, "name": "${title}" }
  ]
}
</script>
  <link rel="stylesheet" href="../universal-ui.css">
  <link rel="stylesheet" href="../mobile-optimized.css">
</head>
<body>
<!-- Created: ${date} -->

<a href="#main-content" class="skip-link">Skip to main content</a>

<header class="header">
  <div class="container">
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <a href="../index.html" class="nav-brand" aria-label="MetroTec Home">
        <div style="display: inline-block;"><img class="responsive-img" src="../metrotec-logo.png" alt="MetroTec"></div>
      </a>
      <ul class="nav-links" id="navLinks">
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

<div class="newspaper-wrapper">
  <nav style="padding: 1rem 3rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb;" aria-label="Breadcrumb">
    <ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 0.5rem; font-size: 0.875rem;">
      <li><a href="../index.html" style="color: #6b7280; text-decoration: none;">Home</a></li>
      <li style="color: #9ca3af;">›</li>
      <li><a href="index.html" style="color: #6b7280; text-decoration: none;">Blog</a></li>
      <li style="color: #9ca3af;">›</li>
      <li style="color: #1a1a1a;">${title}</li>
    </ol>
  </nav>

  <div class="masthead">
    <h1 class="masthead-title">THE METROTEC TIMES</h1>
    <p class="masthead-tagline">Metro Detroit's Technology Chronicle</p>
    <p class="masthead-date">${dateFormatted}</p>
  </div>

  <div class="article-header">
    <div class="article-category">${category}</div>
    <h1 class="article-title">${title}</h1>
    <p class="article-subtitle">${subtitle}</p>
    <p class="article-byline">By MetroTec Team • ${date} • ${readTime} min read</p>
  </div>

  <main id="main-content">
  <div class="article-body">
${sections.map((s, i) => {
  let html = '';
  if (i === 0) {
    html += `    <p class="drop-cap">${s.body.split('\n\n')[0]}</p>\n`;
    const rest = s.body.split('\n\n').slice(1);
    if (rest.length) html += rest.map(p => `    <p>${p}</p>`).join('\n') + '\n';
  } else {
    html += `    <h2>${s.heading}</h2>\n`;
    html += s.body.split('\n\n').map(p => `    <p>${p}</p>`).join('\n') + '\n';
  }
  return html;
}).join('\n')}
    <div class="cta-box">
      <h3>Need Help With Your IT Security?</h3>
      <p>MetroTec provides expert IT support for Metro Detroit businesses. Get a free assessment today.</p>
      <a href="../get-quote.html">Get a Free Quote →</a>
    </div>
  </div>
  </main>
</div>

<!-- AdSense -->
<div style="max-width: 728px; margin: 2rem auto; text-align: center;">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8815300775068949" data-ad-slot="6120355328" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<footer style="background:#0f172a;padding:20px 0;color:rgba(255,255,255,0.7);">
  <div style="max-width:1200px;margin:auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
    <span style="font-style:italic;font-size:0.875rem;">Business IT Support Solutions</span>
    <ul style="list-style:none;padding:0;margin:0;display:flex;gap:24px;flex-wrap:wrap;">
      <li><a href="../index.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Home</a></li>
      <li><a href="../services.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Services</a></li>
      <li><a href="../about.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">About</a></li>
      <li><a href="index.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Blog</a></li>
      <li><a href="../contact.html" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:0.875rem;">Contact</a></li>
    </ul>
    <span style="font-size:0.8rem;">© 2026 MetroTec | <a href="../terms-of-service.html" style="color:rgba(255,255,255,0.7);text-decoration:none;">Terms</a> | <a href="../privacy-policy.html" style="color:rgba(255,255,255,0.7);text-decoration:none;">Privacy</a></span>
  </div>
</footer>
</body>
</html>`;
}

export async function generatePost(args) {
  // Parse CLI args
  let topic = '', category = '', keywords = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i+1]) topic = args[++i];
    if (args[i] === '--category' && args[i+1]) category = args[++i];
    if (args[i] === '--keywords' && args[i+1]) keywords = args[++i];
  }

  // Interactive prompts for missing info
  if (!topic) topic = await prompt('📝 Topic/Title: ');
  if (!category) {
    console.log('\nCategories: ' + CATEGORIES.join(', '));
    category = await prompt('📂 Category: ');
  }
  if (!keywords) keywords = await prompt('🔑 Focus keywords (comma-separated): ');

  const metaDesc = await prompt('📋 Meta description (120-160 chars): ');
  const subtitle = await prompt('📰 Subtitle/deck: ');

  console.log('\n📝 Enter content sections. For each section, provide a heading and body.');
  console.log('   Type "done" for heading when finished.\n');

  const sections = [];
  let sectionNum = 0;
  while (true) {
    sectionNum++;
    const heading = sectionNum === 1
      ? '(intro)'
      : await prompt(`\n  Section ${sectionNum} heading (or "done"): `);
    if (heading.toLowerCase() === 'done') break;

    console.log('  Body (multi-paragraph, blank line between paragraphs, type END on its own line):');
    const lines = [];
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    for await (const line of rl) {
      if (line.trim() === 'END') break;
      lines.push(line);
    }
    sections.push({ heading, body: lines.join('\n').trim().replace(/\n\n+/g, '\n\n') });
  }

  if (sections.length === 0) {
    console.log('❌ No content provided. Aborting.');
    return;
  }

  const slug = slugify(topic);
  const date = today();
  const html = generateHTML({ title: topic, slug, category, metaDesc, subtitle, sections, date });
  const outPath = join(BLOG_POST_DIR, `${slug}.html`);

  await writeFile(outPath, html, 'utf-8');
  console.log(`\n✅ Blog post created: blog/${slug}.html`);
  console.log(`   Title: ${topic}`);
  console.log(`   Category: ${category}`);
  console.log(`   Date: ${date}`);
  console.log(`   Word count: ~${sections.reduce((s, sec) => s + sec.body.split(' ').length, 0)}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Run "node cli.mjs audit ${slug}" to verify SEO score`);
  console.log(`   2. Run "node cli.mjs reindex" to update the blog index`);
  console.log(`   3. Deploy to S3\n`);
}
