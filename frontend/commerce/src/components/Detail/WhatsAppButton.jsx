"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./WhatsAppButton.module.css";
import { FaWhatsapp } from "react-icons/fa";
import api from "@/utils/api";
import { useSiteSettings } from "@/context/SiteSettingsContext";

function normalizeWhatsappNumber(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("237") ? digits : `237${digits}`;
}

export default function WhatsAppButton({ productName, productImage, productSlug }) {
  const settings = useSiteSettings();
  const [whatsappNumber, setWhatsappNumber] = useState("237698936955");

  useEffect(() => {
    const fromContext = normalizeWhatsappNumber(settings?.whatsapp);
    if (fromContext) setWhatsappNumber(fromContext);
  }, [settings?.whatsapp]);

  useEffect(() => {
    // Fallback: si le contexte n'est pas prêt (ou vide), on récupère via api.js
    async function fetchSettings() {
      try {
        const res = await api.get("/api/site-settings/");
        const fromApi = normalizeWhatsappNumber(res?.data?.whatsapp);
        if (fromApi) setWhatsappNumber(fromApi);
      } catch {
        // silencieux: on garde le fallback hardcodé
      }
    }

    if (!normalizeWhatsappNumber(settings?.whatsapp)) {
      fetchSettings();
    }
  }, [settings?.whatsapp]);

  const productUrl = useMemo(() => {
    if (!productSlug || typeof window === "undefined") return null;
    return `${window.location.origin}/product/${productSlug}`;
  }, [productSlug]);

  const message = useMemo(() => {
    const lines = [];
    if (productName) lines.push(`Produit: ${productName}`);
    lines.push("Cet article m’intéresse, est-il toujours disponible ?");
    // Pour la prévisualisation WhatsApp: inclure une URL de page avec OG tags
    if (productUrl) lines.push(productUrl);
    // Optionnel: garder aussi l'URL de l'image dans le texte
    if (productImage) lines.push(`Image: ${productImage}`);
    return lines.join("\n");
  }, [productName, productUrl, productImage]);

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.btn}
    >
      <FaWhatsapp className={styles.icon} />
      <span className={styles.text}>Discutez</span>
    </a>
  );
}
