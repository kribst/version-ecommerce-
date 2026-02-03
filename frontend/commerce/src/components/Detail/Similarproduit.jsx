"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import styles from "./Similarproduit.module.css";

const buildImageUrl = (image) => {
  if (!image) return "/img/shop01.png";
  if (typeof image === "string" && image.startsWith("http")) return image;
  return `${process.env.NEXT_PUBLIC_API_URL}${image}`;
};

const mapProductToCardShape = (p) => {
  const priceNum = parseFloat(p.price) || 0;
  const compare =
    p.compare_at_price ?? p.oldPrice ?? p.compareAtPrice ?? null;
  const oldPriceNum = compare != null ? parseFloat(compare) : null;

  let sale = null;
  if (
    oldPriceNum &&
    oldPriceNum > 0 &&
    priceNum > 0 &&
    oldPriceNum > priceNum
  ) {
    const reduction = ((oldPriceNum - priceNum) / oldPriceNum) * 100;
    sale = `-${Math.round(reduction)}%`;
  }

  const isNew = p.created_at
    ? (new Date() - new Date(p.created_at)) / (1000 * 60 * 60 * 24) < 30
    : false;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: priceNum,
    oldPrice: oldPriceNum,
    image: buildImageUrl(p.image || p.image_url || p.imageUrl),
    sale,
    isNew,
    category:
      p.category?.name ||
      p.category_name ||
      p.category ||
      "Non catégorisé",
  };
};

const normalizeListResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

/**
 * Affiche 6 produits similaires (même catégorie),
 * sinon fallback vers "Autres produits"
 */
const Similarproduit = ({ productId, category, categorySlug }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialExcludedIds, setInitialExcludedIds] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { cart, addToCart, removeFromCart, isInCart } = useCart();

  const categoryName = useMemo(() => {
    if (!category) return null;
    if (typeof category === "object")
      return category.name ?? category.slug ?? category.id ?? null;
    return category;
  }, [category]);

  // Snapshot des produits déjà présents au chargement
  useEffect(() => {
    if (initialExcludedIds !== null) return;

    const ids = new Set([
      ...cart.map((item) => item.id),
      ...wishlist.map((item) => item.id),
    ]);

    setInitialExcludedIds(ids);
  }, [cart, wishlist, initialExcludedIds]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!productId || !categorySlug || initialExcludedIds === null) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/api/search/", {
          params: {
            category: categorySlug,
            page: 1,
            page_size: 20,
          },
        });

        const raw = normalizeListResponse(res.data);

        const mappedSimilar = raw
          .filter((p) => String(p.id) !== String(productId))
          .map(mapProductToCardShape)
          .filter((p) =>
            categoryName ? String(p.category) === String(categoryName) : true
          )
          .filter((p) => !initialExcludedIds.has(p.id));

        let finalItems = mappedSimilar.slice(0, 6);

        // 🔁 Fallback : autres produits
        if (finalItems.length < 6) {
          try {
            const fallbackRes = await api.get("/api/new-products/");
            const { results } = fallbackRes.data || {};

            const allFallback =
              results && Array.isArray(results)
                ? results.flatMap((cat) => cat.products || [])
                : [];

            const mappedFallback = allFallback
              .filter((p) => String(p.id) !== String(productId))
              .map(mapProductToCardShape)
              .filter((p) => !initialExcludedIds.has(p.id))
              .filter(
                (p) =>
                  !finalItems.some(
                    (existing) => String(existing.id) === String(p.id)
                  )
              );

            const needed = 6 - finalItems.length;
            finalItems = [...finalItems, ...mappedFallback.slice(0, needed)];
          } catch (err) {
            console.error("Erreur fallback autres produits :", err);
          }
        }

        // 👉 si AUCUN similaire mais fallback présent
        setIsFallback(mappedSimilar.length === 0 && finalItems.length > 0);
        setItems(finalItems);
      } catch (err) {
        console.error("Erreur produits similaires :", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [productId, categorySlug, categoryName, initialExcludedIds]);

  const handleToggleCart = (product) => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
    } else {
      addToCart(product, 1);
    }
  };

  if (!categorySlug) return null;

  return (
    <section className={styles.section} aria-label="Produits similaires">
      <div className={styles.container}>
        <div className={styles.row}>
          {/* Title */}
          <div className={styles.sectionTitleWrapper}>
            <div className={styles.sectionTitle}>
              <h3 className={styles.title}>
                {isFallback ? "Autres produits" : "Produits similaires"}
              </h3>

              {/* ✅ CHIP MASQUÉ SI isFallback === true */}
              {!isFallback && (
                <div className={styles.sectionNav}>
                  <span className={styles.categoryChip}>
                    {String(categoryName || categorySlug)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className={styles.productsWrapper}>
            {loading ? (
              <div className={styles.state}>Chargement...</div>
            ) : items.length === 0 ? (
              <div className={styles.state}>
                Aucun produit similaire trouvé.
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isInWishlist={isInWishlist(p.id)}
                    onToggleWishlist={() => toggleWishlist(p)}
                    isInCart={isInCart(p.id)}
                    onToggleCart={() => handleToggleCart(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Similarproduit;
