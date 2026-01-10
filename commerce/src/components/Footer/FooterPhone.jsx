"use client";

import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterPhone() {
  const settings = useSiteSettings();

  if (!settings) return null;

  return (
    <div className={styles.infoItem}>
      <FaPhoneAlt className={styles.infoIcon} />
      <a
        href={`tel:${settings.phone}`}
        className={styles.infoLink}
      >
        {settings.phone}
      </a>
    </div>
  );
}
