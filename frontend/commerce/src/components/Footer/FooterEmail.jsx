"use client";

import React from "react";
import { FaEnvelope } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterEmail() {
  const settings = useSiteSettings();

  if (!settings) return null;

  return (
    <div className={styles.infoItem}>
      <FaEnvelope className={styles.infoIcon} />
      <a
        href={`mailto:${settings.email}`}
        className={styles.infoLink}
      >
        {settings.email}
      </a>
    </div>
  );
}
