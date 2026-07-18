# MetroTec Session Summary — 2026-03-19

## Infrastructure

### EC2 / Openclaw
- Uninstalled Ollama + all models (llama3.2:3b, gemma:7b, qwen2.5-coder:7b) from `NemoClaw-GPU-Server` (i-0d507c2e4f00c3179, t3.xlarge, 3.236.81.19)
- Switched openclaw provider from `ollama` → `amazon-bedrock` (Bedrock via IAM role)
- Created IAM instance profile `OpenClawBedrockAgentRole` (has `AmazonBedrockFullAccess`), replaced existing profile on EC2
- Created `/home/ubuntu/start-openclaw.sh` — fetches IMDSv2 creds and starts gateway with AWS env vars
- Confirmed openclaw working with `amazon-bedrock/amazon.nova-pro-v1:0` (asked it the time, responded correctly)
- Switched primary model to `amazon-bedrock/us.meta.llama4-maverick-17b-instruct-v1:0` for site tasks
- Gateway port: `18789`, auth token: `109cde0cbdb704dab09a1bd31fc9c6e41473859530273151`

---

## Site Changes (S3: `mrtechfixes-com`, CloudFront: `E25DZD0N0BGJG2`)

### cybersecurity.html
- Structural redesign (Ray Ray): replaced JS slider stats with 6-card CSS grid, removed broken empty `<img>` threat cards, cleaned inline styles into `<style>` block, added threat cards grid, layer steps layout
- Stats grid changed to 3×2 (3 columns, 2 rows)
- Maverick 17B redesign uploaded as `cybersecurity.html` (via `aws bedrock-runtime converse` CLI)
- Creative free-form redesign saved as `cybersecurity_2.html`

### Site-Wide Fixes (28 root pages + 46 blog pages)
| Fix | Details |
|-----|---------|
| Broken blog links | `href="blog.html"` → `href="blog/index.html"` (blog.html was 404; blog/index.html exists) |
| Alt text | Empty/missing `alt=""` on `<img>` tags filled with filename-derived text |
| Lazy loading | Added `loading="lazy"` to all non-logo images |
| Content tone | Normalized "metro detroit" / "METRO DETROIT" → "Metro Detroit" |
| Canonical URLs | All pages fixed to `http://mrtechfixes-com.s3-website-us-east-1.amazonaws.com/[page]` (were pointing to wrong region: us-east-2) |
| Geo meta tags | Added to all pages missing them: `geo.region`, `geo.placename`, `geo.position`, `ICBM` |
| og:url | Fixed/added on all pages |
| og:description | Added where missing, pulled from existing meta description |

### H1 Updates
| Page | Old H1 | New H1 |
|------|--------|--------|
| index.html | "Metro Detroit's Premier Business IT Support" | **"Metro Detroit IT Support"** |
| services.html | "Information Technology Services" | **"Metro Detroit IT Services"** |

---

## SEO Evaluation (Maverick 17B — SpyFu-style)

**Overall Score: 65/100**

| Category | Score | Top Issue |
|----------|-------|-----------|
| On-Page SEO | 18/25 | Weak OG tags on inner pages |
| Technical SEO | 17/25 | Canonical URLs wrong domain/region |
| Local SEO | 14/20 | Geo tags only on cybersecurity page |
| Content & Authority | 10/15 | Internal linking weak |
| Backlink/Domain Authority | 6/15 | No custom domain |

**Biggest remaining unlock: custom domain** — single biggest SEO improvement available.

---

## Openclaw Model History (this session)
| Model | Result |
|-------|--------|
| `ollama/llama3.2:3b` | Removed (Ollama uninstalled) |
| `bedrock/amazon.nova-lite-v1:0` | Failed — wrong provider key |
| `amazon-bedrock/amazon.nova-pro-v1:0` | ✅ Working |
| `us.anthropic.claude-3-5-haiku-20241022-v1:0` | ❌ Marketplace subscription required |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | ✅ Works via CLI (`aws bedrock-runtime converse`), ❌ no tool use in streaming via openclaw |

---

## Next Steps
1. **Custom domain** — point a real domain at CloudFront, update sitemap + canonicals + robots.txt
2. **Google Search Console** — submit sitemap once domain is live
3. **Internal linking** — link service pages to relevant blog posts
4. **LocalBusiness schema** — add to all service pages (currently only on index.html)
5. **GPU quota** — request "All G and VT Spot Instance Requests" increase (currently 0) for faster inference
6. **Openclaw marketplace permissions** — add `aws-marketplace:ViewSubscriptions` + `aws-marketplace:Subscribe` to `OpenClawSSMRole` to unlock Claude Haiku
