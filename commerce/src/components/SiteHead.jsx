"use client";

import React, { useEffect } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function SiteHead() {
  const settings = useSiteSettings();

  useEffect(() => {
    // Ajouter les keywords comme balise meta (Next.js App Router ne supporte pas keywords directement dans metadata)
    if (settings?.meta_keywords) {
      // Vérifier si la balise keywords existe déjà
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      
      if (keywordsMeta) {
        keywordsMeta.setAttribute('content', settings.meta_keywords);
      } else {
        // Créer la balise keywords si elle n'existe pas
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        keywordsMeta.setAttribute('content', settings.meta_keywords);
        document.head.appendChild(keywordsMeta);
      }
    }
  }, [settings?.meta_keywords]);

  // Note: Dans Next.js App Router, les métadonnées SEO principales (title, description)
  // sont gérées par generateMetadata dans layout.js pour un meilleur SEO (SSR).
  // Les keywords sont ajoutés ici car Next.js ne les supporte pas directement dans metadata.
  
  return null;
}
