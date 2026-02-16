"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaShoppingCart, FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./HeroPromo.module.css";
import api from "@/utils/api";

export default function HeroPromo() {
  const [promos, setPromos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Détecter le navigateur pour ajuster la largeur
  const getWidthForBrowser = () => {
    if (typeof navigator === "undefined") return "122%"; // fallback SSR
    const ua = navigator.userAgent;
    if (/Edg/.test(ua)) return "119.5%"; // Edge
    if (/Chrome/.test(ua)) return "122%"; // Chrome
    return "122%"; // Valeur par défaut
  };

  // Charger les promotions
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/featured-promotions/", {
          params: { limit: 10 },
        });

        const data = response.data || [];

        const mapped = data
          .filter((item) => item.product_image)
          .map((item) => {
            const imageUrl = item.product_image.startsWith("http")
              ? item.product_image
              : `${process.env.NEXT_PUBLIC_API_URL}${item.product_image}`;
            return {
              id: item.id,
              product_name: item.product_name,
              product_slug: item.product_slug,
              original_price: item.original_price,
              promo_price: item.promo_price,
              discount_percent: item.discount_percent,
              label: item.label,
              product_image: imageUrl,
            };
          });

        setPromos(mapped);
      } catch (err) {
        console.error("Erreur chargement promotions :", err);
        setError("Impossible de charger les promotions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [promos.length]);

  const next = () => {
    if (promos.length > 0) setCurrent((prev) => (prev + 1) % promos.length);
  };

  const prev = () => {
    if (promos.length > 0)
      setCurrent((prev) => (prev - 1 + promos.length) % promos.length);
  };

  if (loading) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${styles.promoContainer}`} style={{ background: '#F5F5F5' }}>
        <div className="text-white small">Chargement des offres...</div>
      </div>
    );
  }

  if (error || promos.length === 0) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${styles.promoContainer}`} style={{ background: '#F5F5F5' }}>
        <div className="text-white small px-3 text-center">
          Aucune promotion en vedette pour le moment.
        </div>
      </div>
    );
  }

  const promo = promos[current];

  return (
    <div className={`position-relative w-100 h-100 ${styles.promoContainer}`} style={{ background: '#F5F5F5' }}>
      {/* Image produit */}
      <img
        src={promo.product_image}
        alt={promo.product_name}
        loading="lazy"
        className={styles.promoImage}
      />

      {/* Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.1) 100%)'
        }}
      />

      {/* Badges */}
      <div className="position-absolute" style={{ top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', zIndex: 2 }}>
        <span className={styles.saveBadge}>
          -{promo.discount_percent}%
        </span>
        {promo.label && (
          <span className={styles.offerBadge}>
            {promo.label}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className={styles.contentWrapper} style={{ zIndex: 2 }}>
        <span className="small text-uppercase opacity-75" style={{ letterSpacing: '0.3em', display: 'block', marginBottom: '7.5rem', fontWeight: 700, color: '#D10024', fontSize: '20px' }}>
          Promotion
        </span>

        <h3 className="h5 fw-bold mb-2 text-white" style={{ lineHeight: '1.4', letterSpacing: '-0.02em' }}>
          {promo.product_name}
        </h3>

        <div className="mb-3 d-flex align-items-center justify-content-center gap-2">
          <del className="opacity-60 small text-white">
            {Number(promo.original_price).toLocaleString()} FCFA
          </del>
          <span className="text-warning fw-bold" style={{ fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
            {Number(promo.promo_price).toLocaleString()} FCFA
          </span>
        </div>

        <div className="d-flex justify-content-center mb-3">
          <Link
            href={`/product/${promo.product_slug}`}
            className={styles.cartBtn}
          >
            <FaShoppingCart />
            Voir l'offre
          </Link>
        </div>

        {/* Navigation */}
        {promos.length > 1 && (
          <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
            <button
              onClick={prev}
              className={styles.navBtnPromo}
              aria-label="Promotion précédente"
            >
              <FaChevronUp />
            </button>

            <div className="d-flex gap-1">
              {promos.map((p, index) => (
                <span
                  key={p.id}
                  style={{
                    width: index === current ? '24px' : '8px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: index === current ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.3s ease',
                    display: 'block'
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className={styles.navBtnPromo}
              aria-label="Promotion suivante"
            >
              <FaChevronDown />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
