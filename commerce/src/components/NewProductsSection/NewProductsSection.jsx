"use client";

// NewProductsSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './NewProductsSection.module.css';

const NewProductsSection = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const autoSlideInterval = useRef(null);

  const tabs = [
    { id: 'tab1', label: 'Laptops', category: 'Laptops' },
    { id: 'tab2', label: 'Smartphones', category: 'Smartphones' },
    { id: 'tab3', label: 'Cameras', category: 'Cameras' },
    { id: 'tab4', label: 'Accessories', category: 'Accessories' },
  ];

  // Exemple de données produits - à remplacer par vos vraies données
  const products = {
    tab1: [
      {
        id: 1,
        name: 'Laptop name goes here',
        price: 980.00,
        oldPrice: 990.00,
        image: './img/laptop01.png',
        sale: '-30%',
        new: true,
      },
      // Ajoutez plus de produits ici
    ],
    tab2: [
      {
        id: 2,
        name: 'Smartphone name goes here',
        price: 700.00,
        oldPrice: 800.00,
        image: './img/smartphone01.png',
        sale: '-15%',
        new: true,
      },
    ],
    tab3: [
      {
        id: 3,
        name: 'Camera name goes here',
        price: 500.00,
        oldPrice: 600.00,
        image: './img/camera01.png',
        sale: '-20%',
        new: true,
      },
    ],
    tab4: [
      {
        id: 4,
        name: 'Accessory name goes here',
        price: 50.00,
        oldPrice: 60.00,
        image: './img/accessory01.png',
        sale: '-10%',
        new: true,
      },
    ],
  };

  const currentProducts = products[activeTab] || [];

  // Auto-slide carousel
  useEffect(() => {
    if (currentProducts.length > 0) {
      autoSlideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % currentProducts.length);
      }, 3000);
    }
    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [activeTab, currentProducts.length]);

  // Reset slide when tab changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + currentProducts.length) % currentProducts.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % currentProducts.length);
  };

  const handleAddToCart = (product) => {
    // Logique d'ajout au panier
    console.log('Add to cart:', product);
  };

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
                  {tabs.map((tab) => (
                    <li
                      key={tab.id}
                      className={`${styles.tabNavItem} ${activeTab === tab.id ? styles.active : ''}`}
                    >
                      <button
                        onClick={() => handleTabChange(tab.id)}
                        className={styles.tabNavLink}
                        aria-selected={activeTab === tab.id}
                      >
                        {tab.label}
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
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`${styles.tabPane} ${activeTab === tab.id ? styles.active : ''}`}
                  role="tabpanel"
                  aria-hidden={activeTab !== tab.id}
                >
                  {activeTab === tab.id && (
                    <div className={styles.carouselContainer}>
                      <div className={styles.carouselWrapper} ref={carouselRef}>
                        <div
                          className={styles.carouselTrack}
                          style={{
                            transform: `translateX(-${currentSlide * 100}%)`,
                          }}
                        >
                          {currentProducts.map((product, index) => (
                            <div key={product.id} className={`${styles.product} group`}>
                              <div className={styles.productImg}>
                                <img src={product.image} alt={product.name} />
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
                                <p className={styles.productCategory}>{tab.category}</p>
                                <h3 className={styles.productName}>
                                  <a href="#">{product.name}</a>
                                </h3>
                                <h4 className={styles.productPrice}>
                                  ${product.price.toFixed(2)}{' '}
                                  <del className={styles.productOldPrice}>
                                    ${product.oldPrice.toFixed(2)}
                                  </del>
                                </h4>
                              </div>
                              <div className={styles.addToCart}>
                                <button
                                  className={styles.addToCartBtn}
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <i className="fa fa-shopping-cart"></i> add to cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {currentProducts.length > 1 && (
                        <div className={styles.carouselNav}>
                          <button
                            className={styles.carouselBtn}
                            onClick={handlePrevSlide}
                            aria-label="Previous slide"
                          >
                            <i className="fa fa-chevron-left"></i>
                          </button>
                          <button
                            className={styles.carouselBtn}
                            onClick={handleNextSlide}
                            aria-label="Next slide"
                          >
                            <i className="fa fa-chevron-right"></i>
                          </button>
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
    </section>
  );
};

export default NewProductsSection;