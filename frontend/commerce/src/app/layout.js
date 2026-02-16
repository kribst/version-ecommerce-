// src/app/layout.js
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { SiteSettingsProvider } from "../context/SiteSettingsContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CartProvider } from "../context/CartContext";
import { getApiUrl } from "../utils/api";

// Fonction serveur pour précharger les settings avec gestion d'erreur
async function fetchSiteSettings() {
  try {
    // Utiliser la fonction getApiUrl pour obtenir l'URL de l'API
    // Cela fonctionne aussi bien sur PC que sur mobile
    const apiUrl = getApiUrl();

    // Ajouter un timeout pour éviter que l'application reste bloquée
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout

    try {
      const res = await fetch(`${apiUrl}/api/site-settings/`, {
        signal: controller.signal,
        cache: 'no-store', // Pour éviter le cache en développement
      });
      
      clearTimeout(timeoutId);

      // Si la requête échoue, retourner null au lieu de lancer une erreur
      if (!res.ok) {
        console.warn(`Erreur API site-settings: ${res.status} ${res.statusText}`);
        return null;
      }

      return await res.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Gérer les erreurs de réseau, timeout, etc.
      if (fetchError.name === 'AbortError') {
        console.warn("Timeout lors du chargement des settings");
      } else {
        console.warn("Erreur lors du chargement des settings:", fetchError.message);
      }
      return null;
    }
  } catch (error) {
    console.warn("Erreur inattendue lors du chargement des settings:", error.message);
    return null;
  }
}

// Export metadata pour SEO (Next.js App Router)
export async function generateMetadata() {
  try {
    const settings = await fetchSiteSettings();
    
    // Utiliser la fonction getApiUrl pour obtenir l'URL de l'API
    const apiUrl = getApiUrl();
    
    const metadata = {
      title: settings?.company_name || "Mon App",
      description: settings?.meta_description || settings?.about || "Application Next.js",
    };
    
    // Ajouter le favicon si présent
    if (settings?.favicon && apiUrl) {
      metadata.icons = {
        icon: `${apiUrl}${settings.favicon}`,
      };
    }
    
    return metadata;
  } catch (error) {
    // En cas d'erreur, retourner des métadonnées par défaut
    console.warn("Erreur lors de la génération des métadonnées:", error.message);
    return {
      title: "Mon App",
      description: "Application Next.js",
    };
  }
}

export default async function RootLayout({ children }) {
  // SSR: fetch côté serveur avec gestion d'erreur
  let settings = null;
  try {
    settings = await fetchSiteSettings();
  } catch (error) {
    // Si le chargement échoue, l'application continue avec des valeurs par défaut
    console.warn("Impossible de charger les settings au démarrage:", error.message);
  }

  return (
    <html lang="fr">
      <body>
        <SiteSettingsProvider initialSettings={settings}>
          <WishlistProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </WishlistProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
