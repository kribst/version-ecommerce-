"use client";

import styles from "./Navigation.module.css";
import Link from "next/link";


const Navigation = () => {
  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <ul className={styles.mainNav}>
          <li className={styles.active}>
            <Link href="/" >Acceuil</Link>
          </li>
          <li>
            <a href="#">Boutique</a>
          </li>
          <li>
            <a href="#">Promotions</a>
          </li>
          <li>
            <a href="#">Services</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
