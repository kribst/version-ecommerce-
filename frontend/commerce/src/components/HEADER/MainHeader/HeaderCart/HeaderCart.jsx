"use client";

import React, { useState } from "react";
import { FaShoppingCart, FaTimes, FaArrowCircleRight } from "react-icons/fa";
import { useCart } from "../../../../context/CartContext";
import styles from "./HeaderCart.module.css";

const HeaderCart = () => {
  const [open, setOpen] = useState(false);
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  const handleQtyChange = (id, value) => {
    const qty = Number(value);
    if (Number.isFinite(qty)) {
      updateQuantity(id, qty);
    }
  };

  const formatPrice = (num) =>
    typeof num === "number" ? num.toFixed(2) : Number(num || 0).toFixed(2);

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
                    {formatPrice(item.price)} CFA
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
          <h5>SUBTOTAL: {formatPrice(cartTotal)} CFA</h5>
        </div>

        <div className={styles.cartBtns}>
          <a href="#">View Cart</a>
          <a href="#">
            Checkout <FaArrowCircleRight />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeaderCart;
