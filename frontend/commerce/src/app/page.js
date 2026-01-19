import Header from "../components/HEADER/Header";
import HeroBanner from "../components/Herobanner/HeroBanner";
import RedBar from "../components/RedBar/RedBar";
import CategoryShop from "@/components/CategoryShop/CategoryShop";
import NewProductsSection from "@/components/NewProductsSection/NewProductsSection";

export default function Home() {
  return (
    <div>
      <Header />
      <HeroBanner />
      <RedBar />
      <CategoryShop />
      <RedBar />
      <NewProductsSection />
    </div>
  );
}