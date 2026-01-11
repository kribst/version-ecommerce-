import HeroBanner from "@/components/herobanner/HeroBanner";
import ShopSection from "@/components/ShopSection/ShopSection"
import RedBar from "@/components/RedBar";


export default function Home() {
  return (
    <div>
     <HeroBanner />
     <RedBar />
     <RedBar />
     <ShopSection />
    </div>
  );
}