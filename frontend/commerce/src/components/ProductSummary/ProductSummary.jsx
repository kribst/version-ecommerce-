"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import styles from "./ProductSummary.module.css";

export default function ProductSummary() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("Ma Selection");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ma-selection/`
        );

        if (res.data.is_active && res.data.results) {
          setProducts(res.data.results || []);
          setTitle(res.data.title || "Ma Selection");
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Erreur chargement Ma Selection :", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/default.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className={styles.outerWrapper}>
        <div className={styles.container}>
          <p className={styles.loading}>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.container}>
        {/* Titre dans la zone blanche */}
        <div className={styles.sectionTitleWrapper}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.title}>{title}</h2>
          </div>
        </div>

        {/* Section rouge avec les produits */}
        <div className={styles.redSection}>
          <div className={styles.productsGrid}>
            {products.map((product) => {
              const productLink = product.slug 
                ? `/product/${product.slug}` 
                : `/product/${product.id}`;
              
              return (
                <div key={product.id} className={styles.productItem}>
                  {/* Carte avec image */}
                  <Link href={productLink} className={styles.productCardLink}>
                    <div className={styles.productCard}>
                      <div className={styles.productImageWrapper}>
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name || "Produit"}
                          onError={(e) =>
                            (e.currentTarget.src = "/img/default.png")
                          }
                        />
                    
                      </div>
                    </div>
                  </Link>

                  {/* Zone de texte rouge */}
                  <div className={styles.productInfo}>
                    {product.name && (
                      <h3 className={styles.productName}>
                        <Link href={productLink} className={styles.productNameLink}>
                          {product.name}
                        </Link>
                      </h3>
                    )}
                    <p className={styles.productPrice}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      </div>
    </div>
  );
}