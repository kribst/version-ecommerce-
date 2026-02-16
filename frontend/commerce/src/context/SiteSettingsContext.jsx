"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../utils/api";

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || null);

  useEffect(() => {
    // 1️⃣ Utiliser le cache localStorage si présent
    const cached = localStorage.getItem("siteSettings");
    if (cached) {
      setSettings(JSON.parse(cached));
    }

    // 2️⃣ Refetch instantané pour avoir la dernière version du backend
    // Seulement si on n'a pas déjà les settings depuis le SSR (initialSettings)
    async function fetchSettings() {
      // Si on a déjà les settings depuis le SSR, ne pas refetch immédiatement
      // pour éviter les appels redondants
      if (initialSettings) {
        return;
      }
      
      try {
        const apiUrl = getApiUrl();
        const res = await axios.get(`${apiUrl}/api/site-settings/`);
        setSettings(res.data);
        localStorage.setItem("siteSettings", JSON.stringify(res.data));
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres :", error);
      }
    }

    fetchSettings(); // fetch seulement si pas de initialSettings
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
