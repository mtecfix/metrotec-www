// Basic performance test
const testPerformance = () => {
  const start = performance.now();
  
  // Test DOM ready time
  document.addEventListener('DOMContentLoaded', () => {
    const domReady = performance.now() - start;
    console.log(`DOM Ready: ${domReady.toFixed(2)}ms`);
  });
  
  // Test load time
  window.addEventListener('load', () => {
    const loadTime = performance.now() - start;
    console.log(`Page Load: ${loadTime.toFixed(2)}ms`);
    
    // Test largest contentful paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    }).observe({entryTypes: ['largest-contentful-paint']});
  });
};

testPerformance();
