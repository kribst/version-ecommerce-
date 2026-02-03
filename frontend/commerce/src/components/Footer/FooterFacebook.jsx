"use client";

import React from "react";
import { FaFacebook } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterFacebook() {
  const settings = useSiteSettings();

  // Si pas de settings ou pas de facebook_page → n'affiche rien
  if (!settings || !settings.facebook_page || settings.facebook_page.trim() === "") {
    return null;
  }

  return (
    <a
      href={settings.facebook_page}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialIcon}
      aria-label="Facebook"
    >
      <FaFacebook />
    </a>
  );
}
