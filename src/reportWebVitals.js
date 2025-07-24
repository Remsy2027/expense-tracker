/**
 * Web Vitals reporting for performance monitoring
 * Reports key metrics like CLS, FID, FCP, LCP, and TTFB
 */

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals")
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Cumulative Layout Shift
        getCLS(onPerfEntry);

        // First Input Delay
        getFID(onPerfEntry);

        // First Contentful Paint
        getFCP(onPerfEntry);

        // Largest Contentful Paint
        getLCP(onPerfEntry);

        // Time to First Byte
        getTTFB(onPerfEntry);
      })
      .catch((error) => {
        console.warn("Web Vitals library could not be loaded:", error);
      });
  }
};

export default reportWebVitals;
