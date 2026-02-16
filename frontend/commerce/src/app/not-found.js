"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import PageHeader from "@/components/PageHeader/PageHeader";
import Services from "@/components/Services/Services";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div>
      <Header />
      <PageHeader
        title="Page non trouvée"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />
      <section className={styles.notFoundSection}>
        <div className={styles.notFoundContainer}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>Page introuvable</h1>
          <p className={styles.message}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.homeBtn}>
              Retour à l'accueil
            </Link>
            <Link href="/Boutique" className={styles.shopBtn}>
              Voir la boutique
            </Link>
          </div>
        </div>
      </section>
      <RedBar />
      <Footer />
    </div>
  );
}
