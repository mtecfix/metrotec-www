// Minimal CMS Integration
class CMS {
    constructor() {
        this.load();
    }

    async load() {
        try {
            const page = location.pathname.split('/').pop().replace('.html', '') || 'home';
            const data = await fetch(`/content/pages/${page}.json`).then(r => r.json());
            this.update(data);
        } catch (e) {
            console.log('CMS: Using static content');
        }
    }

    update(data) {
        if (!data) return;
        
        // Update title and meta
        if (data.title) document.title = data.title;
        if (data.description) {
            const meta = document.querySelector('meta[name="description"]');
            if (meta) meta.content = data.description;
        }
        
        // Update hero section
        if (data.hero) {
            const h1 = document.querySelector('h1');
            if (h1 && data.hero.headline) h1.textContent = data.hero.headline;
        }
        
        // Update contact info
        if (data.contact) {
            document.querySelectorAll('a[href^="tel:"]').forEach(el => {
                if (data.contact.phone) {
                    el.href = `tel:${data.contact.phone}`;
                    el.textContent = data.contact.phone;
                }
            });
            document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
                if (data.contact.email && el.href.includes('info@')) {
                    el.href = `mailto:${data.contact.email}`;
                    el.textContent = data.contact.email;
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new CMS());
