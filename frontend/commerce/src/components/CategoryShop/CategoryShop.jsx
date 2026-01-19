"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import styles from "./CategoryShop.module.css";

export default function ShopCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("categories");
    if (cached) {
      setCategories(JSON.parse(cached));
      setLoading(false);
    }

    async function fetchCategories() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`
        );
        setCategories(res.data);
        localStorage.setItem("categories", JSON.stringify(res.data));
      } catch (err) {
        console.error("Erreur chargement catégories :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/default.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className="container text-center py-5">
          <p className="text-muted">Chargement des catégories...</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className={styles.section}>
        <div className="container text-center py-5">
          <p className="text-muted">Aucune catégorie disponible</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
        

        {/* Swiper */}
      <div className={styles.container}>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            nextEl: ".next-btn",
            prevEl: ".prev-btn",
          }}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={20}
          slidesPerView={7}
          loop={true}
          speed={700}
          breakpoints={{
            0: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
            1200: { slidesPerView: 7 },
            1400: { slidesPerView: 6 },
            1600: { slidesPerView: 10 },
          }}
          className={styles.swiper}
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat.id}>
              <div className={`${styles.shop} shop`}>
                <div className={`${styles.shopImg} shop-img`}>
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    className="img-fluid"
                    onError={(e) => (e.currentTarget.src = "/img/default.png")}
                  />
                </div>

                <div className={`${styles.shopBody} shop-body`}>
                  <h4 className={styles.catTitle}>
                    <span className={styles.catName} title={cat.name}>
                      {cat.name}
                    </span>
                    <span className={styles.catCollection}>Collection</span>
                  </h4>
        

                  <a
                    href={`/category/${cat.slug}`}
                    className={styles.ctaBtn}
                  >
                    Shop now
                    <i className="fa fa-arrow-circle-right"></i>
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

       
      </div>
       
    </section>
  );
}
