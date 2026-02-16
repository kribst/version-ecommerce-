"use client";

// NewProductsSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../ProductCard';
import styles from './NewProductsSection.module.css';

const NewProductsSection = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  // Récupérer les catégories et produits depuis le nouvel endpoint optimisé
  // Cet endpoint retourne directement les catégories limitées avec leurs produits récents
  // Les limites sont configurées dans l'admin Django (ParametrePage)
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/new-products/`
        );
        
        const { results, category_limit, products_limit } = res.data || {};
        
        if (!results || results.length === 0) {
          setCategories([]);
          setProductsByCategory({});
          setLoading(false);
          return;
        }

        // Transformer les données de l'API
        const categoriesData = [];
        const productsMap = {};

        results.forEach((categoryData) => {
          const category = {
            id: categoryData.id,
            name: categoryData.name,
            slug: categoryData.slug,
          };
          categoriesData.push(category);

          // Mapper les produits au format attendu
          productsMap[category.id] = (categoryData.products || []).map((product) => {
            // Construire l'URL de l'image
            let imageUrl = '/img/shop01.svg'; // Image par défaut
            if (product.image) {
              imageUrl = product.image.startsWith('http')
                ? product.image
                : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`;
            } else if (product.image_url) {
              imageUrl = product.image_url;
            }

            // Calculer le pourcentage de réduction si compare_at_price existe
            let salePercent = null;
            if (product.compare_at_price && product.price) {
              const reduction = ((parseFloat(product.compare_at_price) - parseFloat(product.price)) / parseFloat(product.compare_at_price)) * 100;
              salePercent = `-${Math.round(reduction)}%`;
            }

            // Vérifier si le produit est récent (créé dans les 30 derniers jours)
            const isNew = product.created_at ? 
              (new Date() - new Date(product.created_at)) / (1000 * 60 * 60 * 24) < 30 : 
              false;

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: parseFloat(product.price) || 0,
              oldPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
              image: imageUrl,
              sale: salePercent,
              isNew: isNew,
              category: product.category || category.name,
            };
          });
        });

        setCategories(categoriesData);
        setProductsByCategory(productsMap);
        
        // Définir la première catégorie comme active par défaut
        if (categoriesData.length > 0) {
          setActiveTab((prev) => prev || categoriesData[0].id);
        }
      } catch (error) {
        console.error("Erreur chargement nouveaux produits :", error);
        setCategories([]);
        setProductsByCategory({});
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  const currentProducts = activeTab ? (productsByCategory[activeTab] || []) : [];

  const handleTabChange = (categoryId) => {
    setActiveTab(categoryId);
  };

  const handleToggleCart = (product) => {
    // Ajouter ou retirer le produit du panier selon son état actuel
    if (isInCart(product.id)) {
      removeFromCart(product.id);
      console.log('Produit retiré du panier:', product);
    } else {
      addToCart(product, 1);
      console.log('Produit ajouté au panier:', product);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.sectionTitleWrapper}>
              <div className="text-center py-12">
                <p className={styles.title}>Chargement des nouveaux produits...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.sectionTitleWrapper}>
              <div className="text-center py-12">
                <p className={styles.title}>Aucune catégorie disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.row}>
          {/* Section Title */}
          <div className={styles.sectionTitleWrapper}>
            <div className={styles.sectionTitle}>
              <h3 className={styles.title}>New Products</h3>
              <div className={styles.sectionNav}>
                <ul className={styles.tabNav}>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className={`${styles.tabNavItem} ${activeTab === category.id ? styles.active : ''}`}
                    >
                      <button
                        onClick={() => handleTabChange(category.id)}
                        className={styles.tabNavLink}
                        aria-selected={activeTab === category.id}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Products Tab & Carousel */}
          <div className={styles.productsWrapper}>
            <div className={styles.productsTabs}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`${styles.tabPane} ${activeTab === category.id ? styles.active : ''}`}
                  role="tabpanel"
                  aria-hidden={activeTab !== category.id}
                >
                  {activeTab === category.id && (
                    <div className={styles.productsGrid}>
                      {currentProducts.length > 0 ? (
                        currentProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isInWishlist={isInWishlist(product.id)}
                            onToggleWishlist={() => toggleWishlist(product)}
                            isInCart={isInCart(product.id)}
                            onToggleCart={() => handleToggleCart(product)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12" style={{ gridColumn: '1 / -1' }}>
                          <p>Aucun produit récent dans cette catégorie</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

{/* Bouton aligné à droite */}
<div className={styles.visitBtnWrapper}>
  <Link href="/autre-page" className={styles.visitBtn}>
    Visitez tout le comptoir
  </Link>
</div>


      </div>
    </section>
  );
};

export default NewProductsSection;