"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const { cart, cartTotal } = useCart();

  const formatPrice = (num) =>
    typeof num === "number"
      ? num.toFixed(2)
      : Number(num || 0).toFixed(2);

  /* 🔤 Conversion nombre → lettres (FR) */
  const numberToWordsFR = (number) => {
    const units = [
      "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
      "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
      "dix-sept", "dix-huit", "dix-neuf",
    ];
  
    const tens = [
      "", "", "vingt", "trente", "quarante", "cinquante",
      "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix",
    ];
  
    const convertHundreds = (n) => {
      let result = "";
  
      if (n >= 100) {
        const h = Math.floor(n / 100);
        result += (h > 1 ? units[h] + " " : "") + "cent";
        n %= 100;
        if (n > 0) result += " ";
      }
  
      if (n >= 20) {
        const t = Math.floor(n / 10);
        result += tens[t];
        n %= 10;
        if (n > 0) result += "-" + units[n];
      } else if (n > 0) {
        result += units[n];
      }
  
      return result;
    };
  
    const convert = (n) => {
      if (n === 0) return units[0];
  
      let words = "";
  
      if (n >= 1_000_000) {
        const millions = Math.floor(n / 1_000_000);
        words +=
          (millions > 1
            ? convertHundreds(millions) + " millions"
            : "un million");
        n %= 1_000_000;
        if (n > 0) words += " ";
      }
  
      if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        words +=
          (thousands > 1
            ? convertHundreds(thousands) + " mille"
            : "mille");
        n %= 1000;
        if (n > 0) words += " ";
      }
  
      if (n > 0) {
        words += convertHundreds(n);
      }
  
      return words;
    };
  
    return convert(Math.floor(number));
  };
  

  return (
    <div className={styles.section}>
      <div className={styles.container}>
        <div className={styles.row}>

          {/* Billing */}
          <div className={styles.col5}>
            <div className={styles.billingDetails}>
              <h3 className={styles.title}>Billing address</h3>

              <input className={styles.input} placeholder="First Name" />
              <input className={styles.input} placeholder="Last Name" />
              <input className={styles.input} type="email" placeholder="Email" />
              <input className={styles.input} placeholder="Address" />
              <input className={styles.input} placeholder="City" />
              <input className={styles.input} placeholder="Country" />
              <input className={styles.input} placeholder="ZIP Code" />
              <input className={styles.input} placeholder="Telephone" />

              <label className={styles.checkbox}>
                <input type="checkbox" /> Create Account?
              </label>
            </div>
          </div>

          {/* Order */}
          <div className={styles.col7}>
            <h3 className={styles.titleCenter}>Your Order</h3>

            <div className={styles.orderBox}>
              <div className={styles.orderRow}>
                <strong>PRODUCT</strong>
                <strong>TOTAL</strong>
              </div>

              {cart.length === 0 ? (
                <div className={styles.orderRow}>
                  <span>Votre panier est vide</span>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div className={styles.orderRow} key={item.id}>
                      <span>
                        {item.quantity || 1}x {item.name}
                      </span>
                      <span>
                        {formatPrice(
                          (item.price || 0) * (item.quantity || 1)
                        )}{" "}
                        CFA
                      </span>
                    </div>
                  ))}

                  <div className={styles.orderRow}>
                    <span>Shipping</span>
                    <strong>FREE</strong>
                  </div>

                  <div className={styles.orderRow}>
                    <strong>TOTAL</strong>

                    {/* 💰 Total + montant en lettres */}
                    <div className={styles.totalBlock}>
                      <strong className={styles.total}>
                        {formatPrice(cartTotal)} CFA
                      </strong>
                      <span className={styles.totalWords}>
                        ({numberToWordsFR(cartTotal)} francs CFA)
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.payment}>
              <label>
                <input type="radio" name="payment" /> Direct Bank Transfer
              </label>
              <label>
                <input type="radio" name="payment" /> Cheque Payment
              </label>
              <label>
                <input type="radio" name="payment" /> Paypal System
              </label>
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" /> I’ve read and accept the terms &
              conditions
            </label>

            <button className={styles.btn}>Place Order</button>
          </div>

        </div>
      </div>
    </div>
  );
}
