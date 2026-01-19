import React from "react";
import styles from "./MainHeader.module.css";
import { FaHeart, FaShoppingCart, FaTimes, FaBars, FaArrowCircleRight } from "react-icons/fa";
import HeaderLogo from "./MainHeader/HeaderLogo/HeaderLogo";
import HeaderSearch from "./MainHeader/HeaderSearch/HeaderSearch";
import HeaderWishlist from "./HeaderWishlist/HeaderWishlist";
import HeaderCart from "./HeaderCart/HeaderCart";


const MainHeader = () => {
  return (
    <div id={styles.header}>
      <div className={styles.container}>
        <div className={styles.row}>

          {/* LOGO */}
          <HeaderLogo />
          {/* /LOGO */}

          {/* SEARCH BAR */}
          <HeaderSearch />
          {/* /SEARCH BAR */}

          {/* ACCOUNT */}
          <div className={styles.col3}>
            <div className={styles.headerCtn}>
              {/* Wishlist */}
              <HeaderWishlist />
              {/* /Wishlist */}

              {/* Cart */}
              <HeaderCart />
              {/* /Cart */}

              {/* Menu Toggle */}
              
              {/* /Menu Toggle */}
            </div>
          </div>
          {/* /ACCOUNT */}

        </div>
      </div>
    </div>
  );
};

export default MainHeader;
