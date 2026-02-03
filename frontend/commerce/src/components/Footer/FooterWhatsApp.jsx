"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterWhatsApp() {
  const settings = useSiteSettings();

  // Si aucun paramètre WhatsApp → Ne rien afficher
  if (!settings || !settings.whatsapp || settings.whatsapp.trim() === "") {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${settings.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialIcon}
      aria-label="WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
}
