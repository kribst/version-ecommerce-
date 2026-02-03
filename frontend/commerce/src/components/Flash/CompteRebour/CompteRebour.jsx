"use client";

import React from "react";
import styles from "./CompteRebour.module.css";
import FlashPromo from "./FlashPromo/FlashPromo";

export default function CompteRebour() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* contenu */}
        <FlashPromo />
      </div>
    </section>
  );
}
