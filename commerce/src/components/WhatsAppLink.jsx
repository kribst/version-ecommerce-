"use client";

import React from "react";
import styles from "./Header.module.css";
import { FaWhatsapp } from "react-icons/fa";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function WhatsAppLink() {
  const settings = useSiteSettings();

  if (!settings) return null; // évite l'affichage vide pendant le fetch

  return (
    <a
      href={`https://wa.me/${settings.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.infoLink}
    >
      <FaWhatsapp className={styles.infoIcon} />
      <span>WhatsApp</span>
    </a>
  );
}
