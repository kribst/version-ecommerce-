"use client";

import React, { useState } from "react";
import { FaHeart, FaTimes, FaArrowCircleRight } from "react-icons/fa";
import { useWishlist } from "../../../../context/WishlistContext";
import styles from "./HeaderWishlist.module.css";

const HeaderWishlist = () => {
  const [open, setOpen] = useState(false);
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();

  const formatCFA = (value) => {
    const n = Number(value ?? 0);
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);
  };

  return (
    <div
      className={`${styles.dropdown} ${open ? styles.open : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a href="#" className={styles.dropdownToggle}>
        <FaHeart className={styles.icon} />
        <span>Your Wishlist</span>
        <div className={styles.qty}>{wishlistCount}</div>
      </a>

      <div className={styles.wishlistDropdown}>
        <div className={styles.wishlistList}>
          {wishlist.length === 0 ? (
            <div className={styles.empty}>Votre wishlist est vide</div>
          ) : (
            wishlist.map((item) => (
              <div className={styles.productWidget} key={item.id}>
                <div className={styles.productImg}>
                  <img src={item.image || "/img/shop01.png"} alt={item.name} />
                </div>

                <div className={styles.productBody}>
                  <h3 className={styles.productName}>
                    <a href={`/product/${item.slug || item.id}`}>{item.name}</a>
                  </h3>
                  <h4 className={styles.productPrice}>
                    {formatCFA(item.price)} CFA
                  </h4>
                </div>

                <button
                  className={styles.delete}
                  onClick={() => removeFromWishlist(item.id)}
                  aria-label="Retirer de la wishlist"
                  title="Retirer de la wishlist"
                >
                  <FaTimes />
                </button>
              </div>
            ))
          )}
        </div>

        {wishlist.length > 0 && (
          <>
            <div className={styles.wishlistSummary}>
              <small>{wishlistCount} Article(s) sélectionné(s)</small>
            </div>

            <div className={styles.wishlistBtns}>
              <a href="/wishlist">Voir la Wishlist</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderWishlist;
