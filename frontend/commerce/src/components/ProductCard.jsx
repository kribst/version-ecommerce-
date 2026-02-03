"use client";

import Link from "next/link";
import { FaHeart } from "react-icons/fa";
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
      <div className={styles.productImg}>
        <img
          src={image}
          alt={name}
          onError={(e) => (e.target.src = "/img/shop01.png")}
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

        {/* Labels */}
        <div className={styles.productLabel}>
          {sale && <span className={styles.sale}>{sale}</span>}
          {isNew && <span className={styles.new}>NEW</span>}
        </div>
      </div>

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

      {/* ADD TO CART */}
      <div className={styles.addToCart}>
        <button
          className={`${styles.addToCartBtn} ${
            isInCart ? styles.removeFromCartBtn : ""
          }`}
          onClick={() => onToggleCart(product)}
        >
          {isInCart ? "remove from cart" : "add to cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;