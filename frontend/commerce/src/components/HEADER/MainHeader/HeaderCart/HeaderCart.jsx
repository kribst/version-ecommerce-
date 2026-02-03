"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaTimes, FaArrowCircleRight } from "react-icons/fa";
import { useCart } from "../../../../context/CartContext";
import styles from "./HeaderCart.module.css";

/* 🔤 Conversion nombre → lettres (FR) */
const numberToWordsFR = (number) => {
  const units = [
    "zéro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];

  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
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
        millions > 1
          ? convertHundreds(millions) + " millions"
          : "un million";
      n %= 1_000_000;
      if (n > 0) words += " ";
    }

    if (n >= 1000) {
      const thousands = Math.floor(n / 1000);
      words +=
        thousands > 1
          ? convertHundreds(thousands) + " mille"
          : "mille";
      n %= 1000;
      if (n > 0) words += " ";
    }

    if (n > 0) {
      words += convertHundreds(n);
    }

    return words;
  };

  return convert(Math.floor(Number(number) || 0));
};

const HeaderCart = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  const handleQtyChange = (id, value) => {
    const qty = Number(value);
    if (Number.isFinite(qty)) {
      updateQuantity(id, qty);
    }
  };

  const formatCFA = (value) => {
    const n = Number(value ?? 0);
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);
  };

  const handleViewCart = (e) => {
    e.preventDefault();
    router.push("/Viewcart");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    router.push("/Check");
  };

  return (
    <div
      className={`${styles.dropdown} ${open ? styles.open : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a href="#" className={styles.dropdownToggle}>
        <FaShoppingCart className={styles.icon} />
        <span>Your Cart</span>
        <div className={styles.qty}>{cartCount}</div>
      </a>

      <div className={styles.cartDropdown}>
        <div className={styles.cartList}>
          {cart.length === 0 ? (
            <div className={styles.empty}>Votre panier est vide</div>
          ) : (
            cart.map((item) => (
              <div className={styles.productWidget} key={item.id}>
                <div className={styles.productImg}>
                  <img src={item.image || "/img/shop01.png"} alt={item.name} />
                </div>

                <div className={styles.productBody}>
                  <h3 className={styles.productName}>
                    <a href={`/product/${item.slug || item.id}`}>{item.name}</a>
                  </h3>
                  <h4 className={styles.productPrice}>
                    <span className={styles.productQty}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        className={styles.qtyInput}
                        aria-label="Quantité"
                      />
                      x
                    </span>
                    {formatCFA(item.price)} CFA
                  </h4>
                </div>

                <button
                  className={styles.delete}
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Retirer du panier"
                >
                  <FaTimes />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartSummary}>
          <small>{cartCount} article(s)</small>
          
          <h5>TOTAL: {formatCFA(cartTotal)} CFA</h5>
          <div>{numberToWordsFR(cartTotal)} francs CFA</div>
        </div>

        <div className={styles.cartBtns}>
          <a href="/Viewcart" onClick={handleViewCart}>
            View Cart
          </a>
          <a href="/Check" onClick={handleCheckout}>
            Checkout <FaArrowCircleRight />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeaderCart;
