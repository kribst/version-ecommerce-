"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import styles from "./CSS Logo.module.css";

export default function Logo() {
  const settings = useSiteSettings();

  // Récupérer le nom de l'entreprise et le logo depuis les settings
  const companyName = settings?.company_name || "Electro";
  const logoPath = settings?.logo || null;

  // Construire l'URL complète du logo si disponible
  const logoUrl = logoPath
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000"}${logoPath}`
    : null;

  return (
    <Link href="/" className={styles.logo}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={companyName}
          width={150}
          height={50}
          className={styles.logoImage}
          priority
          unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('127.0.0.1') || process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
        />
      ) : (
        <span className={styles.logoText}>
          {companyName}
          <span className={styles.dot}>.</span>
        </span>
      )}
    </Link>
  );
}