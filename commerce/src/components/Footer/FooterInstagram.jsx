"use client";

import React from "react";
import { FaInstagram } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterInstagram() {
  const settings = useSiteSettings();

  // si pas de settings ou pas de lien instagram → ne rien afficher
  if (!settings || !settings.instagram) return null;

  return (
    <a
      href={settings.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialIcon}
      aria-label="Instagram"
    >
      <FaInstagram />
    </a>
  );
}
