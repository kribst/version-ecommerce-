"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import RedBar from "@/components/RedBar/RedBar";
import PageHeader from "@/components/PageHeader/PageHeader";
import Services from "@/components/Services/Services";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/api";
import styles from "./page.module.css";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    page_size: 50,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construire les paramètres de recherche
        const params = new URLSearchParams();
        if (query) {
          params.append("q", query);
        }
        if (category) {
          params.append("category", category);
        }

        // Si aucun paramètre, ne pas faire de requête
        if (!query && !category) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Ajouter la pagination aux paramètres
        params.append("page", currentPage.toString());
        params.append("page_size", "50");

        const response = await api.get(`/api/search/?${params.toString()}`);
        const { results, count, page, page_size, total_pages, has_next, has_previous } = response.data || {};

        // Transformer les produits au format attendu par ProductCard
        const formattedProducts = (results || []).map((product) => {
          // Construire l'URL de l'image
          let imageUrl = "/img/shop01.svg"; // Image par défaut
          if (product.image) {
            imageUrl = product.image.startsWith("http")
              ? product.image
              : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`;
          } else if (product.image_url) {
            imageUrl = product.image_url;
          }

          // Calculer le pourcentage de réduction si compare_at_price existe
          let salePercent = null;
          if (product.compare_at_price && product.price) {
            const reduction =
              ((parseFloat(product.compare_at_price) - parseFloat(product.price)) /
                parseFloat(product.compare_at_price)) *
              100;
            salePercent = `-${Math.round(reduction)}%`;
          }

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: parseFloat(product.price) || 0,
            oldPrice: product.compare_at_price
              ? parseFloat(product.compare_at_price)
              : null,
            image: imageUrl,
            sale: salePercent,
            isNew: false,
            category: product.category || "",
          };
        });

        setProducts(formattedProducts);
        setPagination({
          count: count || 0,
          page: page || 1,
          page_size: page_size || 50,
          total_pages: total_pages || 0,
          has_next: has_next || false,
          has_previous: has_previous || false,
        });
      } catch (err) {
        console.error("Erreur lors de la recherche :", err);
        setError("Une erreur est survenue lors de la recherche.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category, currentPage]);

  const handleToggleCart = (product) => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <div>
      <div className={styles.fixedHeader}>
        <Header />
      </div>

      <PageHeader
        title="Résultats de recherche"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />

      <div className={styles.searchContainer}>
        <div className={styles.container}>
          {/* Informations de recherche */}
          <div className={styles.searchInfo}>
            {query && (
              <p className={styles.searchQuery}>
                Recherche pour : <strong>"{query}"</strong>
              </p>
            )}
            {category && (
              <p className={styles.searchCategory}>
                Catégorie : <strong>{category}</strong>
              </p>
            )}
            {!query && !category && (
              <p className={styles.noSearchParams}>
                Veuillez entrer un terme de recherche
              </p>
            )}
          </div>

          {/* Résultats */}
          {loading ? (
            <div className={styles.loading}>
              <p>Recherche en cours...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.noResults}>
              <p>Aucun produit trouvé pour votre recherche.</p>
            </div>
          ) : (

            <>              
               {/* Résultats des produits */}
              <div className={styles.productsGridContainer}>
                 <div className={styles.resultsCount}>
                <p>
                  {pagination.count} produit{pagination.count > 1 ? "s" : ""}{" "}
                  trouvé{pagination.count > 1 ? "s" : ""}
                  {pagination.total_pages > 1 && (
                    <span> (Page {pagination.page} sur {pagination.total_pages})</span>
                  )}
                </p>
              </div>
                
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <ProductCard
                    key={product.id}
                      product={product}
                      isInWishlist={isInWishlist(product.id)}
                      onToggleWishlist={() => toggleWishlist(product)}
                      isInCart={isInCart(product.id)}
                      onToggleCart={() => handleToggleCart(product)}
                    />
                  ))}
                </div>

                {/* Pagination */}
              {pagination.total_pages > 1 && (
                  <div className={styles.pagination}>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", (currentPage - 1).toString());
                      router.push(`/Seach?${params.toString()}`);
                    }}
                    disabled={!pagination.has_previous}
                    className={styles.paginationBtn}
                  >
                    Précédent
                  </button>
                  <span className={styles.paginationInfo}>
                    Page {pagination.page} sur {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", (currentPage + 1).toString());
                      router.push(`/Seach?${params.toString()}`);
                    }}
                    disabled={!pagination.has_next}
                    className={styles.paginationBtn}
                  >
                    Suivant
                  </button>
                </div>
              )}

              </div>
              {/* Résultats des produits */}


            </>
          )}
        </div>
      </div>

      <RedBar />
      <Footer />
    </div>
  );
}
