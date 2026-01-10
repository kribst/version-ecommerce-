"use client";

import React from "react";
import styles from "./Header.module.css";
import { FaFacebook } from "react-icons/fa";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function FacebookLink() {
  const settings = useSiteSettings();

  if (!settings) return null; // évite l'affichage vide pendant le fetch

  return (
    <a
      href={settings.facebook_page}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.infoLink}
    >
      <FaFacebook className={styles.infoIcon} />
      <span>Facebook</span>
    </a>
  );
}
