import Header from "../components/HEADER/Header";
import HeroBanner from "../components/Herobanner/HeroBanner";
import RedBar from "../components/RedBar/RedBar";
import CategoryShop from "@/components/CategoryShop/CategoryShop";
import ProductSummary from "@/components/ProductSummary/ProductSummary";
import NewProductsSection from "@/components/NewProductsSection/NewProductsSection";
import Flash from "@/components/Flash/Flash";
import ServicesPreview from "@/components/ServicesPreview/ServicesPreview";
import Footer from "@/components/Footer/Footer";



export default function Home() {
  return (
    <div>
      <Header />
      <HeroBanner />
      <RedBar />
      <CategoryShop />
      <RedBar />
      <NewProductsSection />
      <RedBar />
      <Flash />
      <ServicesPreview />
      <Footer />
    </div>
  );
}