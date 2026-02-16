"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import ProductCard from '../../ProductCard';
import styles from './Limite.module.css';

export default function Limite() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  // Récupérer exclusivement les produits secondaires
  useEffect(() => {
    const fetchFlashProducts = async () => {
      try {
        setLoading(true);
        
        // Récupérer uniquement les produits secondaires
        const secondaryRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/flash-secondary-products/`
        );

        // Traiter uniquement les produits secondaires
        if (secondaryRes.data && Array.isArray(secondaryRes.data)) {
          const secondaryProducts = secondaryRes.data.map((product, index) => {
            // Construire l'URL de l'image
            let imageUrl = '/img/shop01.svg';
            if (product.product_image) {
              imageUrl = product.product_image.startsWith('http')
                ? product.product_image
                : `${process.env.NEXT_PUBLIC_API_URL}${product.product_image}`;
            }

            return {
              id: product.id || `secondary-${index}`,
              name: product.product_name,
              slug: product.slug || null,
              price: parseFloat(product.product_price) || 0,
              oldPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
              image: imageUrl,
              sale: null, // Les produits flash peuvent avoir une réduction, mais elle n'est pas dans l'API actuelle
              isNew: false,
              category: 'Flash Promotion',
            };
          });
          setProducts(secondaryProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Erreur chargement produits flash secondaires :", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashProducts();
  }, []);

  const handleToggleCart = (product) => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
    } else {
      addToCart(product, 1);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Aucun produit flash disponible</p>
      </div>
    );
  }

  return (
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
  );
}
