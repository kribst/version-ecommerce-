"use client";

import React from "react";
import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import PageHeader from "@/components/PageHeader/PageHeader";
import Services from "@/components/Services/Services";

export default function PaymentSuccessPage() {
  return (
    <div>
      <Header />
      <PageHeader
        title="Paiement réussi"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />
      <section style={{ padding: "40px 0", textAlign: "center" }}>
        <h2>Paiement effectué avec succès.</h2>
        <p>Merci pour votre commande. Vous recevrez un récapitulatif par email si vous avez fourni une adresse valide.</p>
      </section>
      <RedBar />
      <Footer />
    </div>
  );
}

