"use client";

import React from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function SiteHead() {
  const settings = useSiteSettings();

  const title = settings?.company_name || "Mon Ecommerrrrrrrrce";
  const description = settings?.about || "Site ecommerce avec Next.js";
  const favicon = settings?.logo || "/favicon.ico"; // fallback si pas de logo

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href={favicon} />
    </>
  );
}
