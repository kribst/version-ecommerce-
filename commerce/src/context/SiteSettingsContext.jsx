"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
    async function fetchSettings() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/site-settings/`);
        setSettings(res.data);
        localStorage.setItem("siteSettings", JSON.stringify(res.data));
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres :", error);
      }
    }

    fetchSettings(); // fetch immédiat
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
