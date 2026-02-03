"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import api from "@/utils/api";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import styles from "./Detail.module.css";
import WhatsAppButton from "./WhatsAppButton";
import ProductTabs from "./ProductTabs";
import Similarproduit from "./Similarproduit";

/* 🔤 Conversion nombre → lettres (FR) */
const numberToWordsFR = (number) => {
  const units = [
    "zéro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];

  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  const convertHundreds = (n) => {
    let result = "";

    if (n >= 100) {
      const h = Math.floor(n / 100);
      result += (h > 1 ? units[h] + " " : "") + "cent";
      n %= 100;
      if (n > 0) result += " ";
    }

    if (n >= 20) {
      const t = Math.floor(n / 10);
      result += tens[t];
      n %= 10;
      if (n > 0) result += "-" + units[n];
    } else if (n > 0) {
      result += units[n];
    }

    return result;
  };

  const convert = (n) => {
    if (n === 0) return units[0];

    let words = "";

    if (n >= 1_000_000) {
      const millions = Math.floor(n / 1_000_000);
      words +=
        millions > 1
          ? convertHundreds(millions) + " millions"
          : "un million";
      n %= 1_000_000;
      if (n > 0) words += " ";
    }

    if (n >= 1000) {
      const thousands = Math.floor(n / 1000);
      words +=
        thousands > 1
          ? convertHundreds(thousands) + " mille"
          : "mille";
      n %= 1000;
      if (n > 0) words += " ";
    }

    if (n > 0) {
      words += convertHundreds(n);
    }

    return words;
  };

  return convert(Math.floor(Number(number) || 0));
};

const Detail = () => {
  const params = useParams();
  const slug = params?.slug;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();

  // Dimensions fixes pour les images
  const MAIN_IMAGE_WIDTH = 400;
  const MAIN_IMAGE_HEIGHT = 400;
  const THUMBNAIL_WIDTH = 80;
  const THUMBNAIL_HEIGHT = 80;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/products/${slug}/`);
        const productData = response.data;

        // Construire l'URL de l'image principale avec dimensions
        let imageUrl = "/img/shop01.png";
        if (productData.image) {
          imageUrl = productData.image.startsWith("http")
            ? productData.image
            : `${process.env.NEXT_PUBLIC_API_URL}${productData.image}`;
        } else if (productData.image_url) {
          imageUrl = productData.image_url;
        }

        // Construire les URLs des images supplémentaires avec dimensions
        const images = [];
        if (productData.images && productData.images.length > 0) {
          productData.images.forEach((img) => {
            if (img.image) {
              const imgUrl = img.image.startsWith("http")
                ? img.image
                : `${process.env.NEXT_PUBLIC_API_URL}${img.image}`;
              images.push({
                url: imgUrl,
                width: MAIN_IMAGE_WIDTH,
                height: MAIN_IMAGE_HEIGHT,
              });
            }
          });
        }

        // Ajouter l'image principale si elle n'est pas dans la liste
        const mainImageObj = {
          url: imageUrl,
          width: MAIN_IMAGE_WIDTH,
          height: MAIN_IMAGE_HEIGHT,
        };
        
        const imageUrls = images.map(img => img.url);
        if (imageUrl && !imageUrls.includes(imageUrl)) {
          images.unshift(mainImageObj);
        }

        setProduct({
          ...productData,
          image: imageUrl,
          allImages: images.length > 0 ? images : [mainImageObj],
        });
      } catch (err) {
        console.error("Erreur lors du chargement du produit:", err);
        setError(
          err.response?.status === 404
            ? "Produit non trouvé"
            : "Erreur lors du chargement du produit"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleToggleCart = () => {
    if (product) {
      if (isInCart(product.id)) {
        removeFromCart(product.id);
      } else {
        addToCart(product, 1);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || "Produit non trouvé"}</p>
        </div>
      </div>
    );
  }

  const discountPercent =
    product.compare_at_price && product.price
      ? Math.round(
          ((product.compare_at_price - product.price) /
            product.compare_at_price) *
            100
        )
      : null;

  const productPriceNumber = parseInt(product.price, 10) || 0;

  return (
    <div>
    <div className={styles.detailContainer}>
      <div className={styles.productDetail}>
        {/* Images Section */}
        <div className={styles.imagesSection}>
          <div className={styles.mainImage}>
            <img
              src={
                typeof product.allImages[selectedImage] === "object"
                  ? product.allImages[selectedImage].url
                  : product.allImages[selectedImage] || product.image
              }
              alt={product.name}
              width={MAIN_IMAGE_WIDTH}
              height={MAIN_IMAGE_HEIGHT}
              style={{
                width: `${MAIN_IMAGE_WIDTH}px`,
                height: `${MAIN_IMAGE_HEIGHT}px`,
                objectFit: "contain",
              }}
              onError={(e) => (e.target.src = "/img/shop01.png")}
            />
          </div>
          {product.allImages.length > 1 && (
            <div className={styles.thumbnailImages}>
              {product.allImages.map((img, index) => {
                const imgUrl =
                  typeof img === "object" ? img.url : img;
                return (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${
                      selectedImage === index ? styles.active : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={THUMBNAIL_WIDTH}
                      height={THUMBNAIL_HEIGHT}
                      style={{
                        width: `${THUMBNAIL_WIDTH}px`,
                        height: `${THUMBNAIL_HEIGHT}px`,
                        objectFit: "cover",
                      }}
                      onError={(e) => (e.target.src = "/img/shop01.png")}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className={styles.productInfo}>
          <div className={styles.category}>
            {product.category || "Non catégorisé"}
          </div>

          <h1 className={styles.productName} style={{ margin: 0, padding: '0' }}>{product.name}</h1>


          <div>
            <p 
              className={styles.currentPrice} 
              style={{ margin: 0, padding: '0' }} // supprime les marges par défaut
            >
              {productPriceNumber.toLocaleString('fr-FR')} CFA
            </p>

            <div style={{ display: 'block', margin: '0', padding: '0' }}>
              {numberToWordsFR(productPriceNumber)} francs CFA
            </div>
          </div>

         

          <div className={styles.whatsappContainer}>
            <WhatsAppButton
              productName={product?.name}
              productImage={product?.image}
              productSlug={slug}
            />
          </div>
          

          {product.shot_description && (
            <div className={styles.shortDescription}>
              <p>{product.shot_description}</p>
            </div>
          )}

    

          <div className={styles.actions}>
            <button
              className={`${styles.wishlistBtn} ${
                isInWishlist(product.id) ? styles.wishlistActive : ""
              }`}
              onClick={handleToggleWishlist}
              aria-label="Ajouter aux favoris"
            >
              <FaHeart />
              <span>
                {isInWishlist(product.id)
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
              </span>
            </button>

            <button
              className={`${styles.cartBtn} ${
                isInCart(product.id) ? styles.removeFromCart : ""
              }`}
              onClick={handleToggleCart}
            >
              <FaShoppingCart />
              <span>
                {isInCart(product.id)
                  ? "Retirer du panier"
                  : "Ajouter au panier"}
              </span>
            </button>
          </div>




        </div>
      </div>

    </div>


    <ProductTabs description={product.description} productId={product.id} productSlug={product.slug} />
    <Similarproduit
      productId={product.id}
      category={product.category}
      categorySlug={product.category_slug}
    />
    </div>
  
  );
};

export default Detail;
