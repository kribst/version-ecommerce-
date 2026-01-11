import HeroCarousel from "./HeroCarousel";
import HeroPromo from "./HeroPromo";
import styles from "./HeroBanner.module.css";

export default function Hero() {
  return (
    <section className={styles.heroContainer}>
  <div className="max-w-7xl mx-auto grid grid-cols-12 min-h-[520px] gap-0"> {/* gap-0 pour supprimer l’espacement entre colonnes */}
    
    {/* Carousel */}
    <div className="col-span-12 lg:col-span-9">
      <HeroCarousel />
    </div>

    {/* Promo */}
    <div className="col-span-12 lg:col-span-3 h-full">
      <HeroPromo />
    </div>

  </div>
</section>

  );
}
