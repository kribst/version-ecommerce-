"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaShoppingCart, FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./HeroBanner.module.css";
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
      <div
        className={`relative h-[420px] flex items-center justify-center bg-gray-900/5 ${styles.promoContainer}`}
      >
        <div className="text-gray-500 text-sm">Chargement des offres...</div>
      </div>
    );
  }

  if (error || promos.length === 0) {
    return (
      <div
        className={`relative h-[420px] flex items-center justify-center bg-gray-900/5 ${styles.promoContainer}`}
      >
        <div className="text-gray-500 text-sm px-4 text-center">
          Aucune promotion en vedette pour le moment.
        </div>
      </div>
    );
  }

  const promo = promos[current];

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${styles.promoContainer}`}
      style={{
        width: getWidthForBrowser(),
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Image produit */}
      <img
        src={promo.product_image}
        alt={promo.product_name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/10" />

      {/* Badges */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <span className={`${styles.saveBadge} bg-white/10 backdrop-blur`}>
          -{promo.discount_percent}%
        </span>
        {promo.label && (
          <span className={`${styles.offerBadge} bg-orange-500/90`}>
            {promo.label}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-4 w-full">
        <span
            className="text-[11px] tracking-[0.25em] opacity-80 uppercase"
            style={{ position: 'relative', top: '-300px' }} // remonte le texte de 8px
          >
            Promotion
          </span>


        <h3 className="text-lg md:text-xl font-semibold mt-2 mb-2 line-clamp-2" 
        style={{ position: 'relative', top: '-150px' }} 
        >
          {promo.product_name}
        </h3>

        <div className="mb-4 flex items-center justify-center gap-2"
        style={{ position: 'relative', top: '-100px' }}
        >
          <del className="opacity-60 text-sm">
            {Number(promo.original_price).toLocaleString()} FCFA
          </del>
          <span className="text-orange-300 font-semibold text-base">
            {Number(promo.promo_price).toLocaleString()} FCFA
          </span>
        </div>

        <div className="flex justify-center gap-3"
        style={{ position: 'relative', top: '-100px' }}>
          <Link
            href={`/products/${promo.product_slug}`}
            className={`${styles.cartBtn} bg-white/90 text-gray-900 hover:bg-white`}
          >
            <FaShoppingCart />
            Voir l’offre
          </Link>
        </div>

        {/* Navigation */}
        {promos.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4"
          style={{ position: 'relative', top: '-50px' }}>
            <button
              onClick={prev}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-xs transition"
              aria-label="Promotion précédente"
            >
              <FaChevronUp />
            </button>

            <div className="flex gap-1">
              {promos.map((p, index) => (
                <span
                  key={p.id}
                  className={`h-1.5 rounded-full transition-all ${
                    index === current ? "w-6 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-xs transition"
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
