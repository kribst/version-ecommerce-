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
import { getBoutiqueProducts } from "@/utils/api";
import styles from "./page.module.css";

export default function BoutiquePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    page_size: 24,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchBoutiqueProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getBoutiqueProducts(currentPage);
        const { results, count, page, page_size, total_pages, has_next, has_previous } = response || {};

        // Transformer les produits au format attendu par ProductCard
        const formattedProducts = (results || []).map((product) => {
          // Construire l'URL de l'image
          let imageUrl = "/img/shop01.svg"; // Image par défaut
          if (product.image) {
            imageUrl = product.image.startsWith("http")
              ? product.image
              : `${process.env.NEXT_PUBLIC_API_URL || "http://192.168.8.101:9000"}${product.image}`;
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
          page_size: page_size || 24,
          total_pages: total_pages || 0,
          has_next: has_next || false,
          has_previous: has_previous || false,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des produits:", err);
        setError("Une erreur est survenue lors du chargement des produits.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoutiqueProducts();
  }, [currentPage]);

  const handleToggleCart = (product) => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
    } else {
      addToCart(product, 1);
    }
  };

  // Fonction pour générer les numéros de page à afficher
  const getPageNumbers = () => {
    const totalPages = pagination.total_pages;
    const current = pagination.page;
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page actuelle
    
    if (totalPages <= 7) {
      // Si moins de 7 pages, afficher toutes les pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range = [];
    const rangeWithDots = [];

    // Calculer la plage de pages à afficher (sans la première et dernière)
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    // Ajouter la première page
    rangeWithDots.push(1);
    
    // Ajouter des points de suspension si nécessaire
    if (current - delta > 2) {
      rangeWithDots.push('...');
    }

    // Ajouter les pages de la plage
    rangeWithDots.push(...range);

    // Ajouter des points de suspension si nécessaire
    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }

    // Ajouter la dernière page
    rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber === '...' || pageNumber === pagination.page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`/Boutique?${params.toString()}`);
  };

  return (
    <div>
      <div className={styles.fixedHeader}>
        <Header />
      </div>

      <PageHeader
        title="Boutique"
        backgroundImage="/images/cart-header.jpg"
      />
      <Services />

      <div className={styles.boutiqueContainer}>
        <div className={styles.container}>
          {/* Informations */}
          <div className={styles.boutiqueInfo}>
            <p className={styles.boutiqueTitle}>
              Découvrez tous nos produits
            </p>
          </div>

          {/* Résultats */}
          {loading ? (
            <div className={styles.loading}>
              <p>Chargement des produits...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.noResults}>
              <p>Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Résultats des produits */}
              <div className={styles.productsGridContainer}>
                <div className={styles.resultsCount}>
                  <p>
                    {pagination.count} produit{pagination.count > 1 ? "s" : ""}{" "}
                    disponible{pagination.count > 1 ? "s" : ""}
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
                        router.push(`/Boutique?${params.toString()}`);
                      }}
                      disabled={!pagination.has_previous}
                      className={styles.paginationBtn}
                    >
                      Précédent
                    </button>
                    
                    {/* Numéros de page cliquables */}
                    <div className={styles.pageNumbers}>
                      {getPageNumbers().map((pageNum, index) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${index}`} className={styles.pageDots}>
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`${styles.pageNumber} ${
                              pageNum === pagination.page ? styles.pageNumberActive : ''
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("page", (currentPage + 1).toString());
                        router.push(`/Boutique?${params.toString()}`);
                      }}
                      disabled={!pagination.has_next}
                      className={styles.paginationBtn}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <RedBar />
      <Footer />
    </div>
  );
}
