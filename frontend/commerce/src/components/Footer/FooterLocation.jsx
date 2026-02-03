"use client";

import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterLocation() {
  const settings = useSiteSettings();

  if (!settings) return null;

  return (
    <div className={styles.infoItem}>
      <FaMapMarkerAlt className={styles.infoIcon} />
      <span>{settings.location}</span>
    </div>
  );
}
