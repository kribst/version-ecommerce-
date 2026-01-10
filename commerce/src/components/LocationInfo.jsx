"use client";

import React from "react";
import styles from "./Header.module.css";
import { GoLocation } from "react-icons/go";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function LocationInfo() {
  const settings = useSiteSettings();

  if (!settings) return null; // évite l'affichage vide pendant le fetch

  return (
    <span className={styles.infoLink}>
      <GoLocation className={styles.infoIcon} />
      <span>{settings.location}</span>
    </span>
  );
}
