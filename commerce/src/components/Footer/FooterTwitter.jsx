"use client";

import React from "react";
import { FaTwitter } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterTwitter() {
  const settings = useSiteSettings();

  // Si aucun paramètre ou aucun lien Twitter → Ne rien afficher
  if (
    !settings ||
    !settings.twitter ||
    settings.twitter.trim() === ""
  ) {
    return null;
  }

  return (
    <a
      href={settings.twitter}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialIcon}
      aria-label="Twitter"
    >
      <FaTwitter />
    </a>
  );
}
