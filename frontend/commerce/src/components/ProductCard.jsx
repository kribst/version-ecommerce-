"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import styles from "./ProductCard.module.css";

const ProductCard = ({
  product,
  isInWishlist,
  onToggleWishlist,
  isInCart,
  onToggleCart,
}) => {
  const {
    id,
    name,
    slug,
    price,
    oldPrice,
    image,
    sale,
    isNew,
    category,
  } = product;

  const productLink = slug ? `/product/${slug}` : `/product/${id}`;

  return (
    <div className={`${styles.product} group`}>
      {/* IMAGE */}
      <Link href={productLink} className={styles.productImg}>
        <img
          src={image}
          alt={name}
          onError={(e) => (e.target.src = "/img/shop01.svg")}
        />
      
        {/* Wishlist */}
        <button
          className={`${styles.wishlistBtn} ${
            isInWishlist ? styles.wishlistActive : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product);
          }}
          aria-label="wishlist"
        >
          <FaHeart />
        </button>

        {/* Cart Button */}
        <button
          className={`${styles.cartBtn} ${
            isInCart ? styles.cartBtnActive : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            onToggleCart(product);
          }}
          aria-label="cart"
        >
          <FaShoppingCart />
        </button>

        {/* Labels */}
        <div className={styles.productLabel}>
          {sale && <span className={styles.sale}>{sale}</span>}
          {isNew && <span className={styles.new}>NEW</span>}
        </div>
      </Link>

      {/* BODY */}
      <div className={styles.productBody}>
        <p className={styles.productCategory}>{category}</p>

        <h3 className={styles.productName}>
          <Link href={productLink}>{name}</Link>
        </h3>

        {oldPrice && (
          <del className={styles.productOldPrice}>
            {parseInt(oldPrice, 10).toLocaleString('fr-FR')} CFA
          </del>
        )}

        <div className={styles.productPrice}>
          {parseInt(price, 10).toLocaleString('fr-FR')} CFA
        </div>
      </div>
    </div>
  );
};

export default ProductCard;