"use client";

import React from "react";
import styles from "./HeaderSearch.module.css";

const HeaderSearch = () => {
  return (
    <div className={styles.col6}>
      <div className={styles.headerSearch}>
        <form>
          <select className={styles.inputSelect}>
            <option value="0">All Categories</option>
            <option value="1">Category 01</option>
            <option value="2">Category 02</option>
          </select>

          <input
            className={styles.input}
            type="text"
            placeholder="Search here"
          />

          <button className={styles.searchBtn} type="submit">
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeaderSearch;
