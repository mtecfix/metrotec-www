// Mobile Detection and Optimization
(function() {
    const isIPhone = /iPhone|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Load responsive CSS for all devices
    const responsiveCSS = document.createElement('link');
    responsiveCSS.rel = 'stylesheet';
    responsiveCSS.href = 'mobile-responsive.css';
    document.head.appendChild(responsiveCSS);
    
    if (isIPhone) {
        document.documentElement.classList.add('iphone-mobile');
        const mobileCSS = document.createElement('link');
        mobileCSS.rel = 'stylesheet';
        mobileCSS.href = 'mobile-iphone.css';
        document.head.appendChild(mobileCSS);
    } else if (isAndroid) {
        document.documentElement.classList.add('android-mobile');
        const androidCSS = document.createElement('link');
        androidCSS.rel = 'stylesheet';
        androidCSS.href = 'mobile-android.css';
        document.head.appendChild(androidCSS);
    }
    
    // Add mobile navigation functionality
    document.addEventListener('DOMContentLoaded', function() {
        const navToggle = document.getElementById('navMenuToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });
        }
    });
})();
