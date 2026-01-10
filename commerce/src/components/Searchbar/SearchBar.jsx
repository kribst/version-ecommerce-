"use client";

import React from "react";
import styles from "./SearchBar.module.css";


export default function SearchBar() {
  return (
    <div className={styles.searchBar}>
            <select className={styles.categorySelect}>
              <option>All Categories</option>
              <option>Category 01</option>
              <option>Category 02</option>
              <option>Category 03</option>
            </select>
            <div className={styles.searchDivider}></div>
            <input
              type="text"
              placeholder="Search here..."
              className={styles.searchInput}
            />
            <button className={styles.searchButton} type="submit">
              Search
            </button>
    </div>
  );
}
