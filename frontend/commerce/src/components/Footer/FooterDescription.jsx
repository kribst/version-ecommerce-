"use client";

import React from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./Footer.module.css";

export default function FooterDescription() {
  const settings = useSiteSettings();

  if (!settings) return null;

  return (
    <p className={styles.description}>
      {settings.about}
    </p>
  );
}
