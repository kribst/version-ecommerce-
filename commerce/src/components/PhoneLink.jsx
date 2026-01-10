import React from "react";
import styles from "./Header.module.css";
import { FaPhoneAlt } from "react-icons/fa";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function PhoneLink() {
  const settings = useSiteSettings();

  if (!settings) return null;

  return (
    <a href={`tel:${settings.phone}`} className={styles.infoLink}>
      <FaPhoneAlt className={styles.infoIcon} />
      <span>{settings.phone}</span>
    </a>
  );
}
