// src/app/layout.js
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer/Footer";
import { SiteSettingsProvider } from "../context/SiteSettingsContext";
import SiteHead from "../components/SiteHead";




// Fonction serveur pour précharger les settings
async function fetchSiteSettings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site-settings/`);
  if (!res.ok) throw new Error("Impossible de charger les settings");
  return res.json();
}

export default async function RootLayout({ children }) {
  const settings = await fetchSiteSettings(); // SSR: fetch côté serveur

  return (
    <html lang="fr">
      <body>
        <SiteSettingsProvider initialSettings={settings}>
          <SiteHead />
          <Header />   {/* Header reçoit déjà les settings */}
          {children}
          <Footer />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
