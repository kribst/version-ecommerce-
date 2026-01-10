"use client";

import React from "react";
import styles from "./Header.module.css";
import { MdEmail } from "react-icons/md";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function EmailLink() {
  const settings = useSiteSettings();

  if (!settings) return null; // évite l'affichage vide pendant le fetch

  return (
    <a href={`mailto:${settings.email}`} className={styles.infoLink}>
      <MdEmail className={styles.infoIcon} />
      <span>{settings.email}</span>
    </a>
  );
}
