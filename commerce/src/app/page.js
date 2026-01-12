import HeroBanner from "@/components/herobanner/HeroBanner";
import RedBar from "@/components/RedBar";
import CategoryShop from "@/components/CategoryShop/CategoryShop";
import NewProductsSection from "@/components/NewProductsSection/NewProductsSection";

export default function Home() {
  return (
    <div>
     <HeroBanner />
     <RedBar />
     <CategoryShop />
     <NewProductsSection />
    </div>
  );
}