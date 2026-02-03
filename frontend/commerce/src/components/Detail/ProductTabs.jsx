"use client";

import { useState, useEffect } from "react";
import styles from "./ProductTabs.module.css";
import { commentairesAPI, getParametrePage } from "@/utils/api";

export default function ProductTabs({ description, productId, productSlug }) {
  const [activeTab, setActiveTab] = useState("description");
  const [commentairesData, setCommentairesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    commentaire: "",
    note: 0,
    save_email: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [displayedCommentaires, setDisplayedCommentaires] = useState(4);
  const [commentairesPerPage, setCommentairesPerPage] = useState(4);

  // Charger les paramètres de page pour obtenir le nombre de commentaires par page
  useEffect(() => {
    const loadParametres = async () => {
      try {
        const parametres = await getParametrePage();
        if (parametres?.commentaires_per_page) {
          setCommentairesPerPage(parametres.commentaires_per_page);
          setDisplayedCommentaires(parametres.commentaires_per_page);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des paramètres:", err);
        // Utiliser la valeur par défaut (4) en cas d'erreur
      }
    };

    loadParametres();
  }, []);

  // Charger les commentaires automatiquement
  useEffect(() => {
    const loadCommentaires = async () => {
      if (!productId && !productSlug) return;
      
      try {
        setLoading(true);
        setError(null);
        const identifier = productSlug || productId;
        // Charger tous les commentaires pour le défilement côté client
        const data = await commentairesAPI.getProductCommentaires(identifier, 1, 100);
        setCommentairesData(data);
        setDisplayedCommentaires(commentairesPerPage); // Utiliser la valeur depuis les paramètres
      } catch (err) {
        console.error("Erreur lors du chargement des commentaires:", err);
        setError("Erreur lors du chargement des commentaires");
      } finally {
        setLoading(false);
      }
    };

    loadCommentaires();
  }, [productId, productSlug, commentairesPerPage]);

  return (
    <div className={styles["product-tab-container"]}>
      <div id="product-tab">

        {/* TAB NAV */}
        <ul className={styles["tab-nav"]}>
          <li
            className={activeTab === "description" ? styles.active : ""}
            onClick={() => setActiveTab("description")}
          >
            Description
          </li>
          <li
            className={activeTab === "reviews" ? styles.active : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Commentaires ({commentairesData?.total_count || 0})
          </li>
        </ul>

        {/* TAB CONTENT */}
        <div className={styles["tab-content"]}>

          {activeTab === "description" && (
            <div className={styles["tab-pane"]}>
              <p>
                {description ||
                  "Aucune description détaillée n'est disponible pour ce produit pour le moment."}
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className={`${styles["tab-pane"]} ${styles["reviews-row"]}`}>

              <div className={styles["rating-box"]}>
              <div className={styles["rating-avg"]}>
                <span>
                  {commentairesData?.average_rating || 0} <span className={styles.stars}>
                    {commentairesData?.average_rating 
                      ? "★".repeat(Math.round(commentairesData.average_rating)) + "☆".repeat(5 - Math.round(commentairesData.average_rating))
                      : "☆☆☆☆☆"}
                  </span>
                </span>
              </div>

                <ul className={styles["rating-list"]}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const dist = commentairesData?.rating_distribution?.[stars] || { count: 0, percent: 0 };
                    return (
                      <RatingLine 
                        key={stars} 
                        stars={stars} 
                        percent={dist.percent} 
                        count={dist.count} 
                      />
                    );
                  })}
                </ul>
              </div>

              <div className={styles["reviews-box"]}>
                {loading ? (
                  <p>Chargement des commentaires...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : commentairesData?.commentaires?.length > 0 ? (
                  <>
                    <ul className={styles.reviews}>
                      {commentairesData.commentaires.slice(0, displayedCommentaires).map((commentaire) => (
                        <li key={commentaire.id}>
                          <div className={styles["review-heading"]}>
                            <h5>{commentaire.nom}</h5>
                            <span>
                              {new Date(commentaire.created_at).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <div className={styles.stars}>{commentaire.stars_display}</div>
                          </div>
                          <p>{commentaire.commentaire}</p>
                        </li>
                      ))}
                    </ul>

                    {commentairesData.commentaires.length > displayedCommentaires && (
                      <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <button
                          onClick={() => setDisplayedCommentaires(displayedCommentaires + commentairesPerPage)}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Voir plus de commentaires ({commentairesData.commentaires.length - displayedCommentaires} restants)
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Aucun commentaire pour le moment.</p>
                )}
              </div>

              <div className={styles["review-form-box"]}>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 10) {
                      setFormData({ ...formData, nom: value });
                    }
                  }}
                  maxLength={10}
                />
                <input
                  type="email"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <textarea
                  placeholder="Votre commentaire"
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                />

                <div className={styles["rating-input"]}>
                  <span>Votre note:</span>
                  <div className={styles["stars-input"]}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setFormData({ ...formData, note: star })}
                        style={{ cursor: "pointer", fontSize: "1.5em" }}
                      >
                        {star <= formData.note ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.save_email}
                      onChange={(e) => setFormData({ ...formData, save_email: e.target.checked })}
                      style={{ cursor: "pointer" }}
                    />
                    <span>J'autorise l'enregistrement de mon email</span>
                  </label>
                </div>

                <button
                  onClick={async () => {
                    if (!formData.nom || !formData.email || !formData.commentaire || !formData.note) {
                      alert("Veuillez remplir tous les champs");
                      return;
                    }
                    try {
                      setSubmitting(true);
                      await commentairesAPI.createCommentaire({
                        product: productId,
                        nom: formData.nom,
                        email: formData.email,
                        commentaire: formData.commentaire,
                        note: formData.note,
                        save_email: formData.save_email,
                      });
                      alert("Merci pour votre commentaire 😊 Il sera examiné et publié prochainement s’il respecte nos règles de modération.");
                      setFormData({ nom: "", email: "", commentaire: "", note: 0, save_email: false });
                      // Recharger les commentaires
                      const identifier = productSlug || productId;
                      const data = await commentairesAPI.getProductCommentaires(identifier, 1, 100);
                      setCommentairesData(data);
                      setDisplayedCommentaires(commentairesPerPage);
                    } catch (err) {
                      alert("Erreur lors de l'envoi du commentaire. Veuillez réessayer.");
                      console.error(err);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingLine({ stars, percent, count }) {
  return (
    <li className={styles["rating-line"]}>
      <div className={styles.stars}>
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </div>
      <div className={styles.progress}>
        <div style={{ width: `${percent}%` }} />
      </div>
      <span>{count}</span>
    </li>
  );
}
