"use client";

import React, { useState } from "react";
import styles from "./Flash.module.css";
import Limite from "./Limite/Limite";
import FlashPromo from "./CompteRebour/FlashPromo/FlashPromo";

export default function SimpleSection() {
  const [isActive, setIsActive] = useState(false); // prêt pour plus tard 😉

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>Produit Flash</h2>
          <div className={styles.titleUnderline}></div>
        </div>
        <div className={styles.grid}>
          {/* Colonne 2/6 */}
          <div className={styles.colTwo}>
          <FlashPromo />
          </div>

          {/* Colonne 4/6 */}
          <div className={styles.colFour}>
            <Limite />
          </div>
        </div>
      </div>
    </section>
  );
}
