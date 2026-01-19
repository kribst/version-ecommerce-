import React from "react";
import HeroPromo from "./HeroPromo/HeroPromo";
import HeroCarousel from "./HeroCarousel/HeroCarousel";

export default function Hero() {
  return (
    <section className="hero-banner" style={{ backgroundColor: '#F8F8F8', padding: '0', margin: '0', width: '100%' }}>
      <div className="container-fluid px-0">
        <div className="row g-0">
          {/* Section Laptop + Texte - Gauche + Centre */}
          <div className="col-12 col-lg-9" style={{ backgroundColor: '#F8F8F8' }}>
            <HeroCarousel />
          </div>

          {/* Section Promo Femme/Smartphone - Droite */}
          <div className="col-12 col-lg-3" style={{ backgroundColor: '#2B2D42', position: 'relative', overflow: 'hidden' }}>
            <HeroPromo />
          </div>
        </div>
      </div>
    </section>
  );
}
