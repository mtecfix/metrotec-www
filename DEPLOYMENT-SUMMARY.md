# MetroTec Infrastructure & Deployment Summary

**Last Updated:** July 18, 2026  
**Repo:** https://github.com/mtecfix/metrotec-www  
**Live Site:** http://metrotec-www.s3-website-us-east-1.amazonaws.com  
**Status Page:** https://mtecfix.github.io/metrotec-upptime/  
**GitHub Pages:** https://mtecfix.github.io/metrotec-www/

---

## Architecture Overview

```
Local (D:\KIRO PROJECTS\METROTEC\www)
    │
    ├── git push ──→ GitHub (mtecfix/metrotec-www)
    │                    │
    │                    ├── GitHub Actions: Deploy to S3
    │                    ├── GitHub Actions: Lighthouse CI (SEO/perf audits)
    │                    ├── GitHub Actions: PurgeCSS (strip unused CSS)
    │                    ├── GitHub Actions: Pagefind (build search index)
    │                    └── GitHub Actions: Image Optimize (on PRs)
    │
    └── S3 Bucket: metrotec-www (us-east-1)
         └── Static website hosting enabled
```

---

## AWS Resources

### S3 Buckets
| Bucket | Purpose |
|--------|---------|
| `metrotec-www` | Main website (static hosting) |
| `metrotec-iso-transfer` | File transfer / ISO storage |

### EC2 Instances
| Name | Type | State | Notes |
|------|------|-------|-------|
| Metrotec-Windows-Server | m7i-flex.large | STOPPED | Created Jun 24 |
| JudeVpc NatInstance | t3a.nano | RUNNING | NAT gateway |

### Lambda Functions (MetroTec)
| Function | Purpose | Runtime |
|----------|---------|---------|
| `metrotec-subscribe` | Newsletter subscriber (DynamoDB) | Node.js 20 |
| `metrotec-ticket-submit` | Support ticket system w/ AI triage (Nova 2 Lite) | Node.js 20 |

### Other AWS Services
- **DynamoDB:** `metrotec-subscribers`, `metrotec-tickets`
- **SNS:** `metrotec-ticket-notifications`
- **Cognito:** Customer pool `us-east-1_Qntxlc9eP` (ticket auth)

---

## CI/CD Pipelines (GitHub Actions)

### 1. Deploy to S3 (`deploy-s3.yml`)
- **Trigger:** Push to main (blog, HTML, CSS, images, mobile)
- **Action:** Syncs blog/, root pages, and mobile site to S3
- **Status:** ✅ Active

### 2. Lighthouse CI (`lighthouse-ci.yml`)
- **Trigger:** Push to main (HTML/CSS changes)
- **Action:** Runs Lighthouse audits on 5 key pages via local server
- **Output:** Performance, accessibility, SEO, best-practices scores
- **Artifacts:** `.lighthouseci/` results (14-day retention)
- **Status:** ✅ Active

### 3. PurgeCSS (`purgecss.yml`)
- **Trigger:** Push to main (CSS/HTML changes)
- **Action:** Strips unused CSS rules, generates `.min.css` files
- **Permissions:** `contents: write` (auto-commits purged CSS)
- **Output:** `universal-ui.min.css`, `mobile-optimized.min.css`
- **Status:** ✅ Active

### 4. Pagefind Search Index (`pagefind.yml`)
- **Trigger:** Push to main (HTML changes)
- **Action:** Builds static search index from all HTML content
- **Output:** `_pagefind/` directory deployed to S3
- **Status:** ✅ Active

### 5. Image Optimization (`image-optimize.yml`)
- **Trigger:** PRs with image files
- **Action:** Compresses PNGs/JPGs, generates WebP variants
- **Tool:** sharp-cli
- **Status:** ✅ Active

---

## Integrated Third-Party Services

### Tawk.to (Live Chat)
- **Property ID:** `6a5b93a71c52dc1d4c7eda46`
- **Pages:** All key pages (index, services, about, contact, managed-it, cybersecurity, cloud-services, get-quote)
- **Status:** ✅ Live

### Umami Analytics
- **Script:** `https://cloud.umami.is/script.js`
- **Website ID:** `REPLACE_WITH_UMAMI_ID` (pending signup)
- **Pages:** Same 9 pages as Tawk.to
- **Status:** ⏳ Awaiting website ID

### Tailwind CSS (CDN)
- **Mode:** CDN with `tw-` prefix to avoid conflicts with existing CSS
- **Usage:** Use `tw-flex`, `tw-grid`, `tw-p-4`, etc.
- **Purpose:** Interim responsive utility classes while consolidating mobile/desktop

### Google Ads / GTM
- **Tag ID:** `AW-17815464842`
- **Status:** ✅ Active on all pages

### Pagefind (Site Search)
- **Search Page:** `/search.html`
- **Index:** `/_pagefind/` (auto-built by CI)
- **Status:** ✅ Live

---

## Uptime Monitoring (Upptime)

- **Repo:** https://github.com/mtecfix/metrotec-upptime
- **Status Page:** https://mtecfix.github.io/metrotec-upptime/
- **Check Frequency:** Every 5 minutes
- **Monitored Endpoints:**
  - Main site (index)
  - Blog (blog/index.html)
  - Contact page
  - Mobile site (m/index.html)
- **Alerts:** Email notifications (configurable in `.upptime.yml`)

---

## Blog System

### Current (Production)
- 80+ static HTML blog posts in `/blog/`
- Blog index at `/blog/index.html` and `/blog/allposts.html`
- Blog tool scripts in `/blog/blog-tool/` (Node.js CLI)
- Decap CMS admin at `/blog/admin/` (GitHub PKCE auth)

### Eleventy (Scaffold Ready)
- Config: `.eleventy.js`
- Source: `/blog-src/posts/` (Markdown)
- Templates: `/blog-src/_includes/` (Nunjucks)
- Data: `/blog-src/_data/site.json`
- Sample post: `zero-trust-security.md`

---

## Form Handling

### Current (Lambda-based)
- **Contact/Quote forms:** Custom JS → API Gateway → Lambda
- **Newsletter:** `metrotec-subscribe` Lambda → DynamoDB
- **Tickets:** `metrotec-ticket-submit` Lambda → DynamoDB + SNS + AI triage

### Formspree (Ready to Swap)
- Templates in `/formspree-integration.html`
- Thank-you page at `/thank-you.html`
- Honeypot spam protection included
- Requires Formspree account + form IDs

---

## File Structure

```
www/
├── .github/workflows/      # CI/CD pipelines (5 workflows)
├── blog/                   # 80+ blog posts (HTML)
├── blog-src/               # Eleventy source (Markdown + templates)
├── cms-backend/            # Express.js CMS server
├── content/                # JSON content files
├── images/                 # Site images (cards, blog, logos)
│   ├── cards/              # Industry card backgrounds (10 images)
│   └── blog/              # Blog post hero images
├── js/                     # Client-side JavaScript (6 files)
├── m/                      # Mobile-optimized site
├── newsletter-backend/     # Lambda newsletter function
├── ticket-backend/         # Lambda ticket function
├── store/                  # Store/hardware setup
├── *.html                  # Service pages, landing pages
├── *.css                   # Stylesheets (universal-ui, mobile, blog)
├── search.html             # Pagefind search page
├── thank-you.html          # Form submission confirmation
└── integrations-snippet.html  # Copy/paste integration guide
```

---

## Image Inventory (index.html)

| Image | Location | S3 Status |
|-------|----------|-----------|
| `metrotec-logo.png` | Root | ✅ |
| `images/trust-tru-katsande-*.jpg` | Hero background (CSS) | ✅ |
| `images/hero-header-background.webp` | Alt hero | ✅ |
| `images/cards/scheduling.png` | CTA section | ✅ |
| `images/cards/healthcare & medical.png` | Industry card | ✅ |
| `images/cards/professional services.png` | Industry card | ✅ |
| `images/cards/manufacturing.png` | Industry card | ✅ |
| `images/cards/retail & e-commerce.png` | Industry card | ✅ |
| `images/cards/accounting & finance.png` | Industry card | ✅ (fixed case) |
| `images/cards/real estate.png` | Industry card | ✅ (fixed case) |
| `images/cards/insurance.png` | Industry card | ✅ (fixed case) |
| `images/cards/medical laboratories.png` | Industry card | ✅ (fixed case) |
| `images/cards/industrial & mining.png` | Industry card | ✅ (fixed case) |

---

## Known Issues / Notes

1. **Umami Analytics:** Script tag deployed but needs website ID from cloud.umami.is signup
2. **Formspree:** Templates ready but still using Lambda for production forms
3. **Tailwind CSS:** CDN-only (interim) — full responsive rewrite would eliminate `/m/` mobile folder
4. **Image filenames:** S3 has both uppercase (original) and lowercase (fixed) copies of 5 card images. Can remove uppercase variants later.
5. **`.gitignore` excludes:** Images, PHP, shell scripts, credentials, node_modules — by design

---

## Credentials & Secrets

⚠️ **Never commit these. Stored locally only.**

- `metrotec_accessKeys.csv` — AWS IAM keys
- `metrotec_credentials.csv` — AWS credentials
- `calendar-ai/ai-credentials.env` — Bedrock API
- `calendar-ai/zoom-credentials.env` — Zoom API
- `calendar-ai/service-account.json` — Google Calendar

**GitHub Secrets (for Actions):**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## Quick Commands

```bash
# Deploy to S3 manually
cd "/mnt/d/KIRO PROJECTS/METROTEC/www"
aws s3 sync . s3://metrotec-www/ --exclude ".git/*" --exclude "node_modules/*" --exclude "*.env" --exclude "*credentials*" --exclude "*accessKeys*" --delete

# Run Eleventy blog locally
npm run serve

# Build search index locally
npm run search

# Purge CSS locally
npm run purge
```
