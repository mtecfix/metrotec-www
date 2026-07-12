#!/usr/bin/env node
/**
 * MetroTec Blog CLI Tool
 * Usage:
 *   node cli.mjs audit          - SEO audit all blog posts
 *   node cli.mjs audit <file>   - SEO audit a single post
 *   node cli.mjs generate       - Generate a new blog post (interactive)
 *   node cli.mjs reindex        - Rebuild index.html and allposts.html
 *   node cli.mjs stats          - Blog stats overview
 */

import { auditAll, auditOne } from './lib/auditor.mjs';
import { generatePost } from './lib/generator.mjs';
import { reindex } from './lib/indexer.mjs';
import { showStats } from './lib/stats.mjs';

const [,, cmd, ...args] = process.argv;

async function main() {
  switch (cmd) {
    case 'audit':
      if (args[0]) {
        await auditOne(args[0]);
      } else {
        await auditAll();
      }
      break;
    case 'generate':
      await generatePost(args);
      break;
    case 'reindex':
      await reindex();
      break;
    case 'stats':
      await showStats();
      break;
    default:
      console.log(`
╔══════════════════════════════════════════════════╗
║        MetroTec Blog CLI Tool v1.0              ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Commands:                                       ║
║    audit          SEO audit all blog posts       ║
║    audit <file>   SEO audit a single post        ║
║    generate       Generate a new blog post       ║
║    reindex        Rebuild index + allposts       ║
║    stats          Blog stats overview            ║
║                                                  ║
║  Examples:                                       ║
║    node cli.mjs audit                            ║
║    node cli.mjs audit cybersecurity-threats-2026 ║
║    node cli.mjs generate --topic "AI Security"   ║
║    node cli.mjs reindex                          ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
