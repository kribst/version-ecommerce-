"use client";

import React from "react";
import Link from "next/link";
import styles from "./CartTable.module.css";
import { FaPlus, FaMinus, FaTimes } from "react-icons/fa";
import { useCart } from "@/context/CartContext";

// Couleurs disponibles pour les produits
const AVAILABLE_COLORS = [
  { name: "Rouge", value: "#D10024" },
  { name: "Noir", value: "#000000" },
  { name: "Blanc", value: "#FFFFFF" },
  { name: "Bleu", value: "#0066CC" },
  { name: "Vert", value: "#00AA44" },
  { name: "Jaune", value: "#FFD700" },
  { name: "Gris", value: "#808080" },
  { name: "Rose", value: "#FF69B4" },
];

export default function CartTable() {
  const { cart, updateQuantity, removeFromCart, updateCartItem } = useCart();

  const handleIncrease = (id, currentQty) => {
    updateQuantity(id, currentQty + 1);
  };

  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1);
    } else {
      removeFromCart(id);
    }
  };

  const handleColorChange = (itemId, color) => {
    updateCartItem(itemId, { selectedColor: color });
  };

  const formatPrice = (num) =>
    typeof num === "number" ? num.toFixed(2) : Number(num || 0).toFixed(2);

  if (cart.length === 0) {
    return (
      <section className={styles.cartSection}>
        <div className={styles.emptyCart}>
          <p>Votre panier est vide</p>
          <Link href="/" className={styles.continueShoppingBtn}>
            Continuer les achats
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.cartSection}>
      <div className={styles.tableWrapper}>
        <table className={styles.cartTable}>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Image</th>
              <th>Couleur</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item) => {
              const quantity = item.quantity || 1;
              const price = item.price || 0;
              const total = price * quantity;
              const selectedColor = item.selectedColor || AVAILABLE_COLORS[0].value;

              return (
                <tr key={item.id}>
                  {/* Colonne Produit */}
                  <td className={styles.productCell}>
                    <Link
                      href={`/product/${item.slug || item.id}`}
                      className={styles.productNameLink}
                    >
                      {item.name}
                    </Link>
                  </td>

                  {/* Colonne Image */}
                  <td className={styles.imageCell}>
                    <div className={styles.imageWrapper}>
                      <img
                        src={item.image || "/img/shop01.svg"}
                        alt={item.name}
                        className={styles.productImage}
                      />
                    </div>
                  </td>

                  {/* Colonne Couleur */}
                  <td className={styles.colorCell}>
                    <div className={styles.colorSelector}>
                      <div className={styles.colorOptions}>
                        {AVAILABLE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            className={`${styles.colorOption} ${
                              selectedColor === color.value ? styles.colorSelected : ""
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => handleColorChange(item.id, color.value)}
                            aria-label={`Choisir la couleur ${color.name}`}
                            title={color.name}
                          />
                        ))}
                      </div>
                      <div
                        className={styles.selectedColorDisplay}
                        style={{ backgroundColor: selectedColor }}
                      />
                    </div>
                  </td>

                  {/* Colonne Prix */}
                  <td className={styles.priceCell}>
                    <span className={styles.priceValue}>
                      {formatPrice(price)} CFA
                    </span>
                  </td>

                  {/* Colonne Quantité */}
                  <td className={styles.quantityCell}>
                    <div className={styles.qtyBox}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => handleDecrease(item.id, quantity)}
                        aria-label="Diminuer la quantité"
                      >
                        <FaMinus />
                      </button>

                      <input
                        type="number"
                        value={quantity}
                        readOnly
                        className={styles.qtyInput}
                        min="1"
                      />

                      <button
                        className={styles.qtyBtn}
                        onClick={() => handleIncrease(item.id, quantity)}
                        aria-label="Augmenter la quantité"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </td>

                  {/* Colonne Total */}
                  <td className={styles.totalCell}>
                    <span className={styles.totalValue}>
                      {formatPrice(total)} CFA
                    </span>
                  </td>

                  {/* Colonne Action */}
                  <td className={styles.actionCell}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Retirer du panier"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Coupon */}
      <div className={styles.couponBox}>
        <button className={styles.couponBtn}>Checkout</button>
      </div>
    </section>
  );
}
