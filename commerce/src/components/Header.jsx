"use client"; 
import React from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import PhoneLink from "./PhoneLink";
import EmailLink from "./EmailLink";
import WhatsAppLink from "./WhatsAppLink";
import FacebookLink from "./FacebookLink";
import LocationInfo from "./LocationInfo";
import SearchBar from "./SearchBar/SearchBar";


import { FaHeart, FaShoppingCart, FaUser, FaDollarSign, FaBars } from "react-icons/fa";


export default function Header() {
  return (
    <header className={styles.headerWrapper}>
      {/* --- Top bar --- */}
      <div className={styles.topBar}>
        <div className={styles.container}>
        <div className={styles.leftInfo}>
          <PhoneLink />
          <EmailLink />
          <WhatsAppLink />
          <FacebookLink />
          <LocationInfo />
        </div>

          <div className={styles.rightInfo}>
            <div className={styles.infoLink}>
              <FaDollarSign className={styles.infoIcon} />
              <select className={styles.currencySelect}>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
            <Link href="/account" className={styles.infoLink}>
              <FaUser className={styles.infoIcon} />
              <span>My Account</span>
            </Link>
          </div>
        </div>
      </div>


      {/* --- Main header --- */}
      <div className={styles.mainHeader}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            Electro<span className={styles.dot}>.</span>
          </Link>

          {/* Search bar */}
          <SearchBar />

          {/* Wishlist + Cart + Menu */}
          <div className={styles.actions}>
            <Link href="/wishlist" className={styles.iconBox}>
              <div className={styles.iconWrapper}>
                <FaHeart className={styles.icon} />
                <span className={styles.badge}>2</span>
              </div>
              <p className={styles.iconLabel}>Your Wishlist</p>
            </Link>

            <Link href="/cart" className={styles.iconBox}>
              <div className={styles.iconWrapper}>
                <FaShoppingCart className={styles.icon} />
                <span className={styles.badge}>3</span>
              </div>
              <p className={styles.iconLabel}>Your Cart</p>
            </Link>

          
          </div>

          
        </div>
      </div>

      {/* Fine barre rouge de séparation */}
      <div className={styles.redBar}></div>
    </header>
  );
}