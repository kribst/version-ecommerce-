'use client';

import Script from 'next/script';

export default function ScriptLoader() {
  return (
    <>
      {/* jQuery - doit être chargé en premier */}
      <Script
        src="/js/jquery.min.js"
        strategy="beforeInteractive"
      />
      
      {/* Bootstrap */}
      <Script
        src="/js/bootstrap.min.js"
        strategy="afterInteractive"
      />
      
      {/* Slick Carousel */}
      <Script
        src="/js/slick.min.js"
        strategy="afterInteractive"
      />
      
      {/* noUiSlider */}
      <Script
        src="/js/nouislider.min.js"
        strategy="afterInteractive"
      />
      
      {/* jQuery Zoom */}
      <Script
        src="/js/jquery.zoom.min.js"
        strategy="afterInteractive"
      />
      
      {/* Fichier local main.js */}
      <Script
        src="/js/main.js"
        strategy="lazyOnload"
      />
    </>
  );
}
