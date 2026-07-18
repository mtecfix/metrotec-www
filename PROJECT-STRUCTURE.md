# MetroTec Project Structure

## Production Files (Keep)

### Root HTML Pages
- index.html, about.html, contact.html, get-quote.html
- services.html, industries.html
- managed-it.html, cybersecurity.html, cloud-services.html
- voip-phone.html, network-support.html, help-desk.html
- healthcare.html, manufacturing.html, professional-services.html, retail.html
- privacy-policy.html, terms-of-service.html

### CSS
- universal-ui.css (main stylesheet)
- mobile-*.css (mobile responsive styles)
- blog-enhanced.css

### JavaScript
- lead-engine.js
- js/metrotec-forms.js
- js/script.js

### Assets
- metrotec-logo.png
- images/ (all production images)
- robots.txt, sitemap.xml, .htaccess

### Blog
- blog/index.html (blog homepage)
- blog/allposts.html (all posts page)
- blog/*.html (81 blog posts)
- blog/create-avast-blog-posts.py (blog generator)

### Store
- store/ (HP PQWS integration)

### Avast Materials
- avast/ (partner materials for blog content)

### WordPress Integration
- metrotec-importer.php (HTML to WordPress importer)
- metrotec-lead-engine.php
- metrotec-contact-handler.php
- metrotec-quote-calculator.php
- metrotec-lead-tracker.php

### Deployment
- upload.lftp (SFTP upload script)

## Archived Files (_archive/)
- Old Python scripts
- Backup files (*.backup)
- Old shell scripts
- Old PHP automation
- Markdown reports
- Test files
- Old CMS files
- Config files

## Folders to Keep
- blog/
- images/
- js/
- store/
- avast/
- lead system/

## Folders Archived
- cms/
- cms-backend/
- content/
- metrotec-improved/
- blog_backup/
- node_modules/ (can reinstall if needed)

## Next Steps
1. Review _archive/ folder
2. Delete _archive/ if confirmed unnecessary: `rm -rf _archive/`
3. Upload cleaned structure to server
