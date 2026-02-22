"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import styles from "./HeroCarousel.module.css";
import api from "@/utils/api";

export default function HeroCarousel() {
  const router = useRouter();
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
      <div className={`d-flex align-items-center justify-content-center ${styles.carouselContainer}`}>
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-danger mb-3" role="status" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-secondary small">Chargement du carousel...</p>
        </div>
      </div>
    );
  }

  // Gestion d'erreur
  if (error && slides.length === 0) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${styles.carouselContainer}`}>
        <div className="text-center">
          <p className="text-danger mb-2 small">Erreur de chargement</p>
          <p className="text-secondary small">{error}</p>
        </div>
      </div>
    );
  }

  // Si aucun slide disponible
  if (slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];

  const handleShopNow = () => {
    if (!slide) return;
    const target = slide.slug || slide.productId || slide.id;
    if (target) {
      router.push(`/product/${target}`);
    }
  };

  return (
    <div className={`d-flex align-items-center ${styles.carouselContainer}`}>
      <div className="row w-100 align-items-center g-3 g-md-4">
        {/* Image */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center">
          <div className={styles.slideImageWrapper}>
            <img
              src={slide.image}
              alt={slide.title}
              className={styles.slideImage}
              loading="lazy"
              width="450"
              height="320"
            />
          </div>

          {/* Navigation */}
          {slides.length > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button 
                onClick={prevSlide}
                className={styles.navBtnPromo}
                aria-label="Previous slide"
              >
                <FaArrowLeft />
              </button>
              <button 
                onClick={nextSlide}
                className={styles.navBtnPromo}
                aria-label="Next slide"
              >
                <FaArrowRight />
              </button>
            </div>
          )}

          {/* Indicateurs de slides */}
          {slides.length > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={styles.dotBtn}
                  style={{
                    width: index === currentSlide ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: index === currentSlide ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>


        {/* Content */}
        <div className="col-12 col-md-6 text-center text-md-start">
          <p className={`small fw-bold mb-2 mb-md-3 ${styles.subtitle}`}>
            {slide.subtitle}
          </p>

          <h1 className={`h3 h2-md h1-lg fw-bold mb-2 mb-md-3 ${styles.title}`}>
            {slide.title}
          </h1>

          <p className={`small mb-3 mb-md-4 ${styles.description}`}>
            {slide.description}
          </p>

          {slide.price && (
            <p className="h5 fw-bold text-warning mb-3 mb-md-4">
              {slide.price.toLocaleString('fr-FR')} CFA
            </p>
          )}
          
          <button className={styles.shopBtn} onClick={handleShopNow}>
          Achetez dès maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
