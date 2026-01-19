"use client";

// NewProductsSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
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
            let imageUrl = '/img/shop01.png'; // Image par défaut
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
              new: isNew,
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

  // Construire l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/shop01.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  // Construire le lien vers le produit
  const getProductLink = (product) => {
    if (product.slug) {
      return `/product/${product.slug}`;
    }
    return `/product/${product.id}`;
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
                          <div key={product.id} className={`${styles.product} group`}>
                            <div className={styles.productImg}>
                              <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name}
                                onError={(e) => {
                                  e.target.src = "/img/shop01.png";
                                }}
                              />
                              <button
                                className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.wishlistActive : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(product);
                                }}
                                aria-label={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                                title={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                              >
                                <FaHeart className={styles.wishlistIcon} />
                              </button>
                              <div className={styles.productLabel}>
                                {product.sale && (
                                  <span className={styles.sale}>{product.sale}</span>
                                )}
                                {product.new && (
                                  <span className={styles.new}>NEW</span>
                                )}
                              </div>
                            </div>
                            <div className={styles.productBody}>
                              <p className={styles.productCategory}>{product.category || category.name}</p>
                              <h3 className={styles.productName}>
                                <Link href={getProductLink(product)}>{product.name}</Link>
                              </h3>
                              <h4 className={styles.productPrice}>
                                {product.price.toFixed(2)}{' '} CFA
                                {product.oldPrice && (
                                  <del className={styles.productOldPrice}>
                                    {product.oldPrice.toFixed(2)} CFA
                                  </del>
                                )}
                              </h4>
                            </div>
                            <div className={styles.addToCart}>
                              <button
                                className={`${styles.addToCartBtn} ${isInCart(product.id) ? styles.removeFromCartBtn : ''}`}
                                onClick={() => handleToggleCart(product)}
                              >
                                <i className={`fa ${isInCart(product.id) ? 'fa-times' : 'fa-shopping-cart'}`}></i>{' '}
                                {isInCart(product.id) ? 'remove from cart' : 'add to cart'}
                              </button>
                            </div>
                          </div>
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
      </div>

{/* Bouton aligné à droite */}
<div className={styles.visitBtnWrapper}>
  <Link href="/autre-page" className={styles.visitBtn}>
    Visitez tout le comptoir
  </Link>
</div>



    </section>
  );
};

export default NewProductsSection;