"use client";

import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import PageHeader from "@/components/PageHeader/PageHeader";
import WishlistTable from "./WishlistTable";
import Services from "@/components/Services/Services";
import styles from "../Viewcart/check.module.css";

export default function WishlistPage() {
  return (
    <div>
      {/* Header fixé */}
      <div className={styles.fixedHeader}>
        <Header />
      </div>

      <PageHeader
        title="Ma Wishlist"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />
      <WishlistTable />
      <RedBar />
      <Footer />
    </div>
  );
}
