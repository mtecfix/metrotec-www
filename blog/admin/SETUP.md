# MetroTec Blog Admin — Setup Guide

## Architecture

Both MetroTec and Johnson Legal use the same CMS pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    mtecfix GitHub Org                     │
├─────────────────────┬───────────────────────────────────┤
│  metrotec-www repo  │  johnson-legal-team repo          │
│  └── blog/admin/cms │  └── admin/                       │
│      (Decap CMS)    │      (Decap CMS)                  │
│                     │                                    │
│  Content path:      │  Content path:                     │
│  blog/content/*.md  │  content/blog/*.md                 │
│                     │                                    │
│  Deploy target:     │  Deploy target:                    │
│  S3: metrotec-www   │  GitHub Pages                      │
└─────────────────────┴───────────────────────────────────┘
```

## Access Points

| Admin Panel | URL | Auth |
|-------------|-----|------|
| MetroTec Blog | `/blog/admin/` → `/blog/admin/cms/` | GitHub OAuth |
| Johnson Legal | `/johnson-legal-team/admin/` | Cognito (staff pool) |

## How It Works

1. **Decap CMS** (formerly Netlify CMS) is an open-source, MIT-licensed CMS
2. It runs 100% in the browser — no server needed
3. It authenticates via GitHub OAuth
4. Edits are committed directly to the GitHub repo as Markdown files
5. A build/deploy step converts Markdown → HTML and pushes to S3

## Shared Infrastructure

Both projects share:
- **GitHub org:** `mtecfix`
- **AWS account:** 663877906756
- **GitHub OAuth app:** (needs setup — one app serves both)

## Setup Steps (One-Time)

### 1. Create GitHub Repo
```bash
# If not already created:
gh repo create mtecfix/metrotec-www --public
```

### 2. Push the blog content to the repo
```bash
cd "/mnt/d/KIRO PROJECTS/METROTEC/www"
git init
git remote add origin https://github.com/mtecfix/metrotec-www.git
git add blog/
git commit -m "Add blog with Decap CMS"
git push -u origin main
```

### 3. Set Up GitHub OAuth App
The same OAuth app can serve both MetroTec and Johnson Legal:

1. Go to https://github.com/settings/developers
2. Create new OAuth App:
   - Name: `MetroTec CMS`
   - Homepage: `https://metrotec-www.s3-website-us-east-1.amazonaws.com`
   - Callback: your OAuth proxy URL
3. Note the Client ID and Secret

### 4. OAuth Proxy (Shared)
You need a small auth endpoint to exchange GitHub tokens. Options:
- **Netlify Identity** (free, easiest if you have a Netlify account)
- **Cloudflare Worker** (free tier, ~5 min setup)
- **GitHub Pages + external-oauth-proxy** (free)

The same proxy serves both CMS instances.

### 5. Update config.yml
In `blog/admin/cms/config.yml`, set:
```yaml
backend:
  name: github
  repo: mtecfix/metrotec-www
  branch: main
  base_url: https://your-oauth-proxy.workers.dev
  auth_endpoint: auth
```

### 6. Build Pipeline
After content is committed via CMS, you need a way to:
1. Convert Markdown → HTML (using the blog-tool generator)
2. Deploy to S3

This can be a GitHub Action:
```yaml
on:
  push:
    paths: ['blog/content/**']
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node blog/blog-tool/build-from-md.mjs
      - run: aws s3 sync blog/ s3://metrotec-www/blog/ --delete
```

## Navigation Between Admins

From MetroTec Blog Admin (`/blog/admin/`):
- Link to Johnson Legal Admin → `https://mtecfix.github.io/johnson-legal-team/admin/`

From Johnson Legal Admin:
- Link to MetroTec Blog Admin → `https://metrotec-www.s3-website-us-east-1.amazonaws.com/blog/admin/`

Both are accessible from a single "master admin" concept — same GitHub login gives
access to both since they share the `mtecfix` org.

## Local Development

```bash
# Run the Decap CMS local proxy (no GitHub OAuth needed locally):
npx decap-server

# Then open blog/admin/cms/index.html in browser
# Content edits go to local filesystem instead of GitHub
```

## Cost

| Component | Cost |
|-----------|------|
| Decap CMS | $0 (MIT open source) |
| GitHub repo + Pages | $0 |
| OAuth proxy (Cloudflare Worker) | $0 (free tier) |
| S3 hosting | ~$0 (already have) |
| **Total** | **$0/month** |
