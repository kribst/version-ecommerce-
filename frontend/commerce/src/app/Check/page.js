"use client";

import React from "react";
import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import Checkout from "./Checkout";
import PageHeader from "@/components/PageHeader/PageHeader";
import styles from "./check.module.css";
import Services from "@/components/Services/Services";


export default function Check() {
  return (
    <div>
     {/* Header fixé */}
     <div className={styles.fixedHeader}>
        <Header />
      </div>
     <PageHeader title="Checkout" backgroundImage="/images/cart-header.jpg" />
     <Services />
     <Checkout />
      <RedBar />
      <Footer />
    </div>
  );
}
