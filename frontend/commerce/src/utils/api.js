import axios from "axios";

// Fonction utilitaire pour obtenir l'URL de l'API
// Utilise l'IP réseau pour permettre l'accès depuis mobile
export const getApiUrl = () => {
  // Si une variable d'environnement est définie, l'utiliser
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // En développement, utiliser l'IP réseau pour permettre l'accès mobile
  // Sur PC, cela fonctionnera aussi car le backend écoute sur 0.0.0.0
  // Utilisez l'IP réseau de votre PC (192.168.8.101) au lieu de localhost
  return "http://192.168.8.101:9000";
};

const api = axios.create({
  baseURL: getApiUrl(),
});

// Fonctions API pour les commentaires
export const commentairesAPI = {
  // Récupérer les commentaires d'un produit avec statistiques
  getProductCommentaires: async (productIdOrSlug, page = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/api/product-commentaires/${productIdOrSlug}/`, {
        params: { page, page_size: pageSize },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
      throw error;
    }
  },

  // Créer un nouveau commentaire
  createCommentaire: async (commentaireData) => {
    try {
      const response = await api.post("/api/commentaires/", commentaireData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du commentaire:", error);
      throw error;
    }
  },

  // Récupérer tous les commentaires (avec filtres optionnels)
  getAllCommentaires: async (params = {}) => {
    try {
      const response = await api.get("/api/commentaires/", { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
      throw error;
    }
  },
};

// Fonction pour récupérer les paramètres de page
export const getParametrePage = async () => {
  try {
    const response = await api.get("/api/parametre-page/");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres de page:", error);
    throw error;
  }
};

// Fonction pour récupérer les produits de la boutique
export const getBoutiqueProducts = async (page = 1) => {
  try {
    const response = await api.get("/api/boutique/", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits de la boutique:", error);
    throw error;
  }
};

// Fonction pour récupérer les produits en promotion
export const getPromotionsProducts = async (page = 1) => {
  try {
    const response = await api.get("/api/promotions-page/", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits en promotion:", error);
    throw error;
  }
};

// Fonction pour récupérer les produits d'une catégorie
export const getCategoryProducts = async (categorySlug, page = 1) => {
  try {
    const response = await api.get("/api/category-products/", {
      params: { category_slug: categorySlug, page },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits de la catégorie:", error);
    throw error;
  }
};

// PayPal (création et capture gérées côté backend)
export const paypalAPI = {
  createOrder: async (payload) => {
    const response = await api.post("/api/paypal/create-order/", payload);
    return response.data;
  },
  captureOrder: async (orderId) => {
    const response = await api.post("/api/paypal/capture-order/", { orderId });
    return response.data;
  },
};

// MTN Mobile Money API (pour le Cameroun)
export const mtnMoMoAPI = {
  // Créer une demande de paiement MTN MoMo
  requestPayment: async (payload) => {
    try {
      const response = await api.post("/api/mtn-momo/request-payment/", payload);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la demande de paiement MTN MoMo:", error);
      throw error;
    }
  },

  // Vérifier le statut d'un paiement MTN MoMo
  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await api.get(`/api/mtn-momo/payment-status/${transactionId}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut du paiement:", error);
      throw error;
    }
  },

  // Annuler une transaction en attente
  cancelPayment: async (transactionId) => {
    try {
      const response = await api.post(`/api/mtn-momo/cancel-payment/`, { transactionId });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'annulation du paiement:", error);
      throw error;
    }
  },
};

// Orange Money API (pour le Cameroun)
export const orangeMoneyAPI = {
  // Créer une demande de paiement Orange Money
  requestPayment: async (payload) => {
    try {
      const response = await api.post("/api/orange-money/request-payment/", payload);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la demande de paiement Orange Money:", error);
      throw error;
    }
  },

  // Vérifier le statut d'un paiement Orange Money
  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await api.get(`/api/orange-money/payment-status/${transactionId}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut du paiement:", error);
      throw error;
    }
  },
};

export default api;
