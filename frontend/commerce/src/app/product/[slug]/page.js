import React from "react";
import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import PageHeader from "@/components/PageHeader/PageHeader";
import Services from "@/components/Services/Services";
import Detail from "@/components/Detail/Detail";
import styles from "./page.module.css";  

export default function ProductDetailPage() {
  return (
    <div>
       <div className={styles.fixedHeader}>
        <Header />
      </div>
      <PageHeader
        title="Détail du produit"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />
      <Detail />
      <RedBar />
      <Footer />
    </div>
  );
}
