import HeroCarousel from "./HeroCarousel";
import HeroPromo from "./HeroPromo";

export default function Hero() {
  return (
    <section className="w-full bg-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-12 min-h-[520px]">

        {/* Carousel 9/12 sur desktop, 12/12 sur mobile */}
        <div className="col-span-12 lg:col-span-9">
          <HeroCarousel />
        </div>

        {/* Promo 3/12 sur desktop, masqué sur mobile/tablette */}
        <div className="hidden lg:block col-span-3">
          <HeroPromo />
        </div>

      </div>
    </section>
  );
}
