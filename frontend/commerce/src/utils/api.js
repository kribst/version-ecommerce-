import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000",
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

export default api;
