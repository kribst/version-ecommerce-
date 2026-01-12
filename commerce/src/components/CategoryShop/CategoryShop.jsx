"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaArrowCircleRight, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import styles from "./CategoryShop.module.css";

export default function CategoryShop() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const carouselRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  useEffect(() => {
    // 1️⃣ Charger depuis le cache
    const cached = localStorage.getItem("categories");
    if (cached) {
      const cachedCategories = JSON.parse(cached);
      setCategories(cachedCategories);
      setLoading(false);
    }

    // 2️⃣ Re-fetch depuis le backend
    async function fetchCategories() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`
        );
        setCategories(res.data);
        localStorage.setItem("categories", JSON.stringify(res.data));
      } catch (error) {
        console.error("Erreur chargement catégories :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Construire l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/shop01.png"; // Image par défaut
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  // Construire le lien vers la catégorie
  const getCategoryLink = (category) => {
    if (category.slug) {
      return `/shop/${category.slug}`;
    }
    return `/shop/${category.id}`;
  };

  // Navigation du carousel
  const itemsToShow = 6; // Nombre d'éléments visibles
  const maxIndex = Math.max(0, categories.length - itemsToShow);

  const nextSlide = () => {
    if (categories.length <= itemsToShow) return; // Pas de défilement si moins d'éléments que itemsToShow
    setCurrentIndex((prev) => {
      return prev >= maxIndex ? 0 : prev + 1;
    });
    // Arrêter le défilement automatique et démarrer le timer d'inactivité
    setIsAutoScrollPaused(true);
    resetInactivityTimer();
  };

  const prevSlide = () => {
    if (categories.length <= itemsToShow) return; // Pas de défilement si moins d'éléments que itemsToShow
    setCurrentIndex((prev) => {
      return prev <= 0 ? maxIndex : prev - 1;
    });
    // Arrêter le défilement automatique et démarrer le timer d'inactivité
    setIsAutoScrollPaused(true);
    resetInactivityTimer();
  };

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = () => {
    // Nettoyer le timer précédent s'il existe
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Démarrer un nouveau timer de 5 secondes
    inactivityTimerRef.current = setTimeout(() => {
      setIsAutoScrollPaused(false);
    }, 5000); // 5 secondes
  };

  // Auto-scroll toutes les 2 secondes (seulement si pas en pause)
  useEffect(() => {
    if (categories.length <= itemsToShow) return; // Pas d'auto-scroll si moins d'éléments que itemsToShow
    if (isAutoScrollPaused) return; // Ne pas démarrer si en pause
    
    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const newMaxIndex = Math.max(0, categories.length - itemsToShow);
        return prev >= newMaxIndex ? 0 : prev + 1;
      });
    }, 2000); // 2 secondes

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [categories.length, itemsToShow, isAutoScrollPaused]); // Dépendances pour recalculer quand les catégories changent ou l'état de pause change

  // Nettoyer les timers lors du démontage du composant
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className={`section pt-8 pb-8 ${styles.section}`}>
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des catégories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className={`section pt-8 pb-8 ${styles.section}`}>
        <div className="container max-w-7xl mx-auto px-4">
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Aucune catégorie disponible</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`section pt-8 pb-8 ${styles.section}`}>
      {/* Container */}
      <div className="container max-w-7xl mx-auto px-4">
        {/* Row */}
        <div className="row">
          {/* Products tab & slick */}
          <div className="col-md-12">
            <div className="row">
              <div className="products-tabs w-full">
                {/* Tab */}
                <div 
                  id="tab1" 
                  className={`tab-pane fade ${activeTab === "tab1" ? "in active" : ""}`}
                >
                  
                  <div className={`products-slick ${styles.productsSlick}`} ref={carouselRef}>
                    {/* Carousel Container */}
                    <div className={styles.carouselWrapper}>
                      <div 
                        className={styles.carouselTrack}
                        style={{
                          transform: `translateX(calc(-${currentIndex} * ((100% - 80px) / ${itemsToShow} + 16px)))`
                        }}
                      >
                        {categories.map((category) => (
                          <div key={category.id} className={`shop product ${styles.shop}`}>
                            <div className={`product-img shop-img ${styles.shopImg}`}>
                              <img 
                                src={getImageUrl(category.image)} 
                                alt={`${category.name} Collection`}
                                className="w-full h-64 object-cover"
                                onError={(e) => {
                                  e.target.src = "/img/shop01.png"; // Image de fallback
                                }}
                              />
                            </div>
                            <div className={`shop-body ${styles.shopBody}`}>
                              <h4 className="text-white text-xl font-bold mb-3">
                                {category.name}
                                <br />
                                <span className="text-lg font-normal">Collection</span>
                              </h4>
                              <Link 
                                href={getCategoryLink(category)} 
                                className={`cta-btn ${styles.ctaBtn}`}
                              >
                                Shop now <FaArrowCircleRight className="inline-block ml-2" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>


{/* Navigation buttons */}
<div className={`products-slick-nav ${styles.productsSlickNav}`}>
                    <button 
                      onClick={prevSlide}
                      className={`${styles.navButton} ${styles.navButtonLeft}`}
                      aria-label="Previous"
                    >
                      <FaArrowLeft size={14} />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className={`${styles.navButton} ${styles.navButtonRight}`}
                      aria-label="Next"
                    >
                      <FaArrowRight size={14} />
                    </button>
                  </div>





                </div>
                {/* /tab */}
              </div>
            </div>
          </div>
          {/* /Products tab & slick */}
        </div>
        {/* /row */}
      </div>
      {/* /container */}
    </section>
  );
}