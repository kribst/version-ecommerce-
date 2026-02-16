"use client";

import styles from "./Navigation.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = (usePathname() || "").toLowerCase();

  const isActive = (href) => {
    const target = href.toLowerCase();
    if (target === "/") return pathname === "/";
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <ul className={styles.mainNav}>
          <li className={isActive("/") ? styles.active : undefined}>
            <Link href="/">Acceuil</Link>
          </li>
          <li className={isActive("/Boutique") ? styles.active : undefined}>
            <Link href="/Boutique">Boutique</Link>
          </li>
          <li className={isActive("/Promotions") ? styles.active : undefined}>
            <Link href="/Promotions">Promotions</Link>
          </li>
          <li className={isActive("/Services") ? styles.active : undefined}>
            <Link href="/Services">Services</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
