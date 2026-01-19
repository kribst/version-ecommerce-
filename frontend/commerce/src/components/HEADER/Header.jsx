import React from "react";
import styles from "./Header.module.css";
import TopHeader from "./Topheader/TopHeader";
import MainHeader from "./MainHeader/MainHeader";
import RedBar from "../RedBar/RedBar";

const Header = () => {
  return (
    <header className={styles.header}>
      <TopHeader />
      <MainHeader />
      <RedBar />
    </header>
  );
};

export default Header;
