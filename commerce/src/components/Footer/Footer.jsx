import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import FooterDescription from "./FooterDescription";
import FooterLocation from "./FooterLocation";
import FooterPhone from "./FooterPhone";
import FooterEmail from "./FooterEmail";
import FooterFacebook from "./FooterFacebook";
import FooterTwitter from "./FooterTwitter";
import FooterInstagram from "./FooterInstagram";
import FooterWhatsApp from "./FooterWhatsApp";









export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Barre rouge de séparation */}
      <div className={styles.redBar}></div>

      {/* === Top Section === */}
      <div className={styles.topSection}>
        <div className={styles.container}>
          {/* ABOUT US */}
          <div className={styles.column}>
            <h3 className={styles.title}>ABOUT US</h3>
            <FooterDescription />
            <FooterLocation />
            <FooterPhone />
            <FooterEmail />


            {/* Social Media */}
            <div className={styles.socialLinks}>
           
              <FooterFacebook />
              <FooterTwitter />
              <FooterInstagram />
              <FooterWhatsApp />

             
              


            </div>
          </div>

          {/* CATEGORIES */}
          <div className={styles.column}>
            <h3 className={styles.title}>CATEGORIES</h3>
            <ul className={styles.list}>
              <li><Link href="/categories/hot-deals" className={styles.listLink}>Hot deals</Link></li>
              <li><Link href="/categories/laptops" className={styles.listLink}>Laptops</Link></li>
              <li><Link href="/categories/smartphones" className={styles.listLink}>Smartphones</Link></li>
              <li><Link href="/categories/cameras" className={styles.listLink}>Cameras</Link></li>
              <li><Link href="/categories/accessories" className={styles.listLink}>Accessories</Link></li>
            </ul>
          </div>

          {/* INFORMATION */}
          <div className={styles.column}>
            <h3 className={styles.title}>INFORMATION</h3>
            <ul className={styles.list}>
              <li><Link href="/about" className={styles.listLink}>About Us</Link></li>
              <li><Link href="/contact" className={styles.listLink}>Contact Us</Link></li>
              <li><Link href="/privacy" className={styles.listLink}>Privacy Policy</Link></li>
              <li><Link href="/orders" className={styles.listLink}>Orders and Returns</Link></li>
              <li><Link href="/terms" className={styles.listLink}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* SERVICE */}
          <div className={styles.column}>
            <h3 className={styles.title}>SERVICE</h3>
            <ul className={styles.list}>
              <li><Link href="/account" className={styles.listLink}>My Account</Link></li>
              <li><Link href="/cart" className={styles.listLink}>View Cart</Link></li>
              <li><Link href="/wishlist" className={styles.listLink}>Wishlist</Link></li>
              <li><Link href="/track-order" className={styles.listLink}>Track My Order</Link></li>
              <li><Link href="/help" className={styles.listLink}>Help</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* === Bottom Section === */}
      <div className={styles.bottomSection}>
        <div className={styles.container}>
          <p className={styles.copyright}>
            Copyright © {new Date().getFullYear()} All rights reserved | This template is made with <span className={styles.heart}>♥</span> by Colorlib
          </p>
        </div>
      </div>
    </footer>
  );
}