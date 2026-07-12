// Dynamic host detection for MetroTec site
(function() {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    const baseUrl = `${currentProtocol}//${currentHost}`;
    
    // Update all hardcoded domain references
    document.addEventListener('DOMContentLoaded', function() {
        // Update email links
        const emailLinks = document.querySelectorAll('a[href*="mailto:info@mrtechfixes.com"]');
        emailLinks.forEach(link => {
            link.href = 'mailto:info@mrtechfixes.com'; // Keep email as is
        });
        
        // Update any absolute URLs that reference the old domain
        const links = document.querySelectorAll('a[href*="mrtechfixes.com"]');
        links.forEach(link => {
            if (link.href.includes('mailto:')) return; // Skip email links
            const path = link.getAttribute('href').replace(/https?:\/\/[^\/]+/, '');
            link.href = baseUrl + path;
        });
        
        // Update form actions
        const forms = document.querySelectorAll('form[action*="mrtechfixes.com"]');
        forms.forEach(form => {
            const action = form.getAttribute('action');
            const path = action.replace(/https?:\/\/[^\/]+/, '');
            form.action = baseUrl + path;
        });
        
        // Update any src attributes
        const sources = document.querySelectorAll('[src*="mrtechfixes.com"]');
        sources.forEach(element => {
            const src = element.getAttribute('src');
            const path = src.replace(/https?:\/\/[^\/]+/, '');
            element.src = baseUrl + path;
        });
    });
})();
