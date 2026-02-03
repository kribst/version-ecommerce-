"use client";

import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import PageHeader from "@/components/PageHeader/PageHeader";
import CartTable from "./CartTable";
import Services from "@/components/Services/Services";
import styles from "./check.module.css";

export default function Page() {
  return (
    <div>
      {/* Header fixé */}
      <div className={styles.fixedHeader}>
        <Header />
      </div>

      <PageHeader
        title="View Cart"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />
      <CartTable />
      <RedBar />
      <Footer />
    </div>
  );
}
