"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '../../../../context/WishlistContext';
import { useCart } from '../../../../context/CartContext';
import styles from './FlashPromo.module.css';

const FlashPromo = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  // Parser le remaining_time au format "DD-HH-MM-SS"
  const parseRemainingTime = (timeString) => {
    if (!timeString) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const parts = timeString.split('-');
    if (parts.length !== 4) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    return {
      days: parseInt(parts[0], 10) || 0,
      hours: parseInt(parts[1], 10) || 0,
      minutes: parseInt(parts[2], 10) || 0,
      seconds: parseInt(parts[3], 10) || 0,
    };
  };

  // Récupérer le produit flash depuis l'API
  useEffect(() => {
    const fetchFlashProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://127.0.0.1:9000/api/flash-main-product/');
        
        const data = res.data;
        
        if (!data || !data.product_name) {
          setFeaturedProduct(null);
          setLoading(false);
          return;
        }

        // Transformer les données de l'API
        let imageUrl = '/img/shop01.png';
        if (data.product_image) {
          imageUrl = data.product_image.startsWith('http')
            ? data.product_image
            : `http://127.0.0.1:9000${data.product_image}`;
        }

        const product = {
          id: 'flash-main-product',
          name: data.product_name,
          slug: null,
          price: data.compare_at_price ? parseFloat(data.compare_at_price) : parseFloat(data.product_price) || 0, // Prix pendant la promotion (compare_at_price)
          oldPrice: parseFloat(data.product_price) || 0, // Prix avant la promotion (product_price)
          image: imageUrl,
        };

        setFeaturedProduct(product);

        // Initialiser le compte à rebours avec remaining_time
        if (data.remaining_time) {
          const initialTime = parseRemainingTime(data.remaining_time);
          setCountdown(initialTime);
        }
      } catch (error) {
        console.error("Erreur chargement produit flash :", error);
        setFeaturedProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashProduct();
  }, []);

  // Compte à rebours qui se met à jour chaque seconde
  useEffect(() => {
    // Ne lancer le timer que si on a un produit
    if (!featuredProduct) {
      return;
    }

    const updateCountdown = () => {
      setCountdown((prev) => {
        let { days, hours, minutes, seconds } = prev;

        // Si tout est à 0, arrêter
        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        // Décrémenter les secondes
        if (seconds > 0) {
          seconds--;
        } else {
          // Si secondes = 0, décrémenter les minutes
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else {
            // Si minutes = 0, décrémenter les heures
            if (hours > 0) {
              hours--;
              minutes = 59;
              seconds = 59;
            } else {
              // Si heures = 0, décrémenter les jours
              if (days > 0) {
                days--;
                hours = 23;
                minutes = 59;
                seconds = 59;
              } else {
                // Tout est à 0
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    };

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [featuredProduct]);

  const handleToggleCart = (product) => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
    } else {
      addToCart(product, 1);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/shop01.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://127.0.0.1:9000${imagePath}`;
  };

  const getProductLink = (product) => {
    if (product.slug) {
      return `/product/${product.slug}`;
    }
    // Si pas de slug, utiliser le nom du produit pour créer un lien
    return `/product/${product.name?.toLowerCase().replace(/\s+/g, '-')}` || '/products';
  };

  const formatNumber = (num) => {
    return String(num).padStart(2, '0');
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className="text-center py-12">
            <p>Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProduct) {
    return null;
  }

  return (
      <section className={styles.section}>
        <div className={styles.container}>
          {/* PRODUIT PROMO UNIQUE */}
          <div className={styles.leftBox}>
            <h3 className={styles.boxTitle}>EN CE MOMENT</h3>
            <p className={styles.subTitle}>Offre à durée limitée</p>
    
            {/* ⏳ Compte à rebours */}
            <div className={styles.timer}>
              <div className={styles.timerItem}>
                <span className={styles.timerValue}>{formatNumber(countdown.days)}</span>
                <span className={styles.timerLabel}>Jour</span>
              </div>
              <span className={styles.timerSeparator}>:</span>
    
              <div className={styles.timerItem}>
                <span className={styles.timerValue}>{formatNumber(countdown.hours)}</span>
                <span className={styles.timerLabel}>H</span>
              </div>
              <span className={styles.timerSeparator}>:</span>
    
              <div className={styles.timerItem}>
                <span className={styles.timerValue}>{formatNumber(countdown.minutes)}</span>
                <span className={styles.timerLabel}>Min</span>
              </div>
              <span className={styles.timerSeparator}>:</span>
    
              <div className={styles.timerItem}>
                <span className={styles.timerValue}>{formatNumber(countdown.seconds)}</span>
                <span className={styles.timerLabel}>Sec</span>
              </div>
            </div>
    
            {/* 🖼️ Image */}
            <div className={styles.imageWrapper}>
              <img
                src={getImageUrl(featuredProduct.image)}
                alt={featuredProduct.name}
                className={styles.promoImage}
                onError={(e) => {
                  e.target.src = "/img/shop01.png";
                }}
              />
            </div>
    
            {/* 🏷️ Nom */}
            <h4 className={styles.promoName}>{featuredProduct.name}</h4>
    
            {/* 💰 Prix */}
            {featuredProduct.oldPrice && (
              <p className={styles.oldPrice}>
                {featuredProduct.oldPrice
                  .toFixed(0)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
                CFA
              </p>
            )}
    
            <p className={styles.newPrice}>
              {featuredProduct.price
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
              CFA
            </p>
    
            {/* 🛒 CTA */}
            <Link
              href={getProductLink(featuredProduct)}
              className={styles.buyBtn}
            >
              Achetez
            </Link>
          </div>
        </div>
      </section>
    );
    
};

export default FlashPromo;
