"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import styles from "./HeroCarousel.module.css";
import api from "@/utils/api";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarouselProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer uniquement les produits actifs, triés par position
        const response = await api.get("/api/product-carousel/", {
          params: {
            active: true,
            ordering: "position"
          }
        });

        // Mapper les données de l'API vers le format attendu
        const mappedSlides = response.data
          .filter((item) => item.product_image) // Ne garder que les items avec une image
          .map((item) => {
            // Construire l'URL de l'image : si c'est déjà une URL complète, l'utiliser telle quelle
            // Sinon, combiner avec l'URL de l'API
            const imageUrl = item.product_image.startsWith('http')
              ? item.product_image
              : `${process.env.NEXT_PUBLIC_API_URL}${item.product_image}`;
            
            return {
              id: item.id,
              image: imageUrl,
              subtitle: item.comment_1 || "SAVE UP TO A $400",
              title: item.product_name || "On Selected Laptops & Desktop Or Smartphone",
              description: item.comment_2 || "Terms and Condition Apply",
              price: item.product_price,
              productId: item.product,
            };
          });

        setSlides(mappedSlides);
      } catch (err) {
        console.error("Erreur lors du chargement du carousel:", err);
        setError(err.message);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselProducts();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change de slide toutes les 5 secondes
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center px-6 md:px-10 py-8 md:py-12 bg-white ${styles.carouselContainer}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du carousel...</p>
        </div>
      </div>
    );
  }

  // Gestion d'erreur
  if (error && slides.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center px-6 md:px-10 py-8 md:py-12 bg-white ${styles.carouselContainer}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Erreur de chargement</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Si aucun slide disponible
  if (slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];

  return (
    <div className={`h-full flex items-center px-6 md:px-10 py-8 md:py-12 bg-white ${styles.carouselContainer}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 w-full">
        {/* Image */}
        <div className={styles.slideImageWrapper}>
            {slide.image.startsWith('http') ? (
              <img
                src={slide.image}
                alt={slide.title}
                className={styles.slideImage}
              />
            ) : (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                className={styles.slideImage}
                priority={currentSlide === 0}
              />
            )}
          </div>


        {/* Content */}
        <div className="order-1 lg:order-2 text-center lg:text-left">
          <p className={`text-sm font-bold tracking-[3px] text-gray-500 mb-4 ${styles.subtitle}`}>
            {slide.subtitle}
          </p>

          <h1 className={`text-3xl md:text-4xl xl:text-5xl font-bold text-gray-700 leading-tight mb-4 ${styles.title}`}>
            {slide.title}
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            {slide.description}
          </p>

          {slide.price && (
            <p className="text-lg font-semibold text-red-600 mb-4">
              ${parseFloat(slide.price).toFixed(2)}
            </p>
          )}

          <button className={`${styles.shopBtn}`}>
            Shop Now
          </button>

          {/* Navigation */}
          {slides.length > 1 && (
            <div className="flex justify-center lg:justify-start gap-4 mt-8 lg:mt-10">
              <button 
                onClick={prevSlide}
                className={styles.navBtn}
                aria-label="Previous slide"
              >
                <FaArrowLeft />
              </button>
              <button 
                onClick={nextSlide}
                className={styles.navBtn}
                aria-label="Next slide"
              >
                <FaArrowRight />
              </button>
            </div>
          )}

          {/* Indicateurs de slides */}
          {slides.length > 1 && (
            <div className="flex justify-center lg:justify-start gap-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? "bg-red-600 w-8" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
