"use client";

import React from "react";
import Link from "next/link";
import styles from "./WishlistTable.module.css";
import { FaTimes, FaShoppingCart } from "react-icons/fa";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistTable() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
  };

  const formatPrice = (num) => {
    const value = typeof num === "number" ? num : Number(num || 0);
    return Math.round(value).toLocaleString("fr-FR");
  };

  if (wishlist.length === 0) {
    return (
      <section className={styles.wishlistSection}>
        <div className={styles.emptyWishlist}>
          <p>Votre wishlist est vide</p>
          <Link href="/Boutique" className={styles.continueShoppingBtn}>
            Continuer les achats
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wishlistSection}>
      <div className={styles.tableWrapper}>
        <table className={styles.wishlistTable}>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Image</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {wishlist.map((item) => {
              const price = item.price || 0;
              const inCart = isInCart(item.id);

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

                  {/* Colonne Prix */}
                  <td className={styles.priceCell}>
                    <span className={styles.priceValue}>
                      {formatPrice(price)} CFA
                    </span>
                  </td>

                  {/* Colonne Statut */}
                  <td className={styles.statusCell}>
                    {inCart ? (
                      <span className={styles.inCartBadge}>Dans le panier</span>
                    ) : (
                      <span className={styles.notInCartBadge}>Non ajouté</span>
                    )}
                  </td>

                  {/* Colonne Action */}
                  <td className={styles.actionCell}>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.addToCartBtn}
                        onClick={() => handleAddToCart(item)}
                        disabled={inCart}
                        aria-label="Ajouter au panier"
                        title={inCart ? "Déjà dans le panier" : "Ajouter au panier"}
                      >
                        <FaShoppingCart />
                        {inCart ? "Déjà au panier" : "Ajouter"}
                      </button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label="Retirer de la wishlist"
                        title="Retirer de la wishlist"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
