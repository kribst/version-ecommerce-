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

// Export metadata pour SEO (Next.js App Router)
export async function generateMetadata() {
  const settings = await fetchSiteSettings();
  
  // NEXT_PUBLIC_API_URL doit être défini dans les variables d'environnement (production et développement)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const metadata = {
    title: settings?.company_name || "Mon Ecommerrrrrrrrce",
    description: settings?.meta_description || settings?.about || "Site ecommerce avec Next.js",
  };
  
  // Ajouter le favicon si présent
  if (settings?.favicon && apiUrl) {
    metadata.icons = {
      icon: `${apiUrl}${settings.favicon}`,
    };
  }
  
  return metadata;
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
