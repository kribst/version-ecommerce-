"use client";

import React from "react";
import styles from "./TopHeader.module.css";
import { FaPhone, FaEnvelope, FaMapMarker, FaDollarSign, FaUser } from "react-icons/fa";
import { useSiteSettings } from "../../../context/SiteSettingsContext";

const TopHeader = () => {
  const iconColor = "#D10024"; // couleur rouge pour toutes les icônes
  const settings = useSiteSettings();

  // Récupération des données dynamiques depuis l'API
  const phone = settings?.support_phone || settings?.phone || "+021-95-51-84";
  const email = settings?.support_email || "email@email.com";
  const location = settings?.support_location || settings?.location || "NEW YORK, USA";

  return (
    <div id={styles.topHeader}>
      <div className={styles.container}>
        <ul className={`${styles.headerLinks} ${styles.pullLeft}`}>
          <li>
            <a href={`tel:${phone}`}>
              <FaPhone color={iconColor} /> {phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${email}`}>
              <FaEnvelope color={iconColor} /> {email}
            </a>
          </li>
          <li>
            <a href="#">
              <FaMapMarker color={iconColor} /> {location}
            </a>
          </li>
        </ul>
        <ul className={`${styles.headerLinks} ${styles.pullRight}`}>
          <li>
            <a href="#">
              <FaDollarSign color={iconColor} /> USD
            </a>
          </li>
          <li>
            <a href="#">
              <FaUser color={iconColor} /> My Account
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopHeader;
