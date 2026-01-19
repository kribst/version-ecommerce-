"use client";

import React from "react";
import styles from "./HeaderLogo.module.css";
import { useSiteSettings } from "../../../../../context/SiteSettingsContext";

const HeaderLogo = () => {
  const settings = useSiteSettings();

  // Récupération du logo depuis l'API
  const logoPath = settings?.logo || "/media/branding/logo_Jlm2aUk.png";
  
  // Construire l'URL complète du logo
  // Si le logo commence par /media, on préfixe avec l'URL de l'API
  const logoUrl = logoPath.startsWith('/media') 
    ? `${process.env.NEXT_PUBLIC_API_URL}${logoPath}`
    : logoPath;

  return (
    <div className={styles.headerLogo}>
      <a href="#" className={styles.logo}>
        <img src={logoUrl} alt="Logo" className={styles.logoImage} />
      </a>
    </div>
  );
};

export default HeaderLogo;
