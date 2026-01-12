"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./SearchBar.module.css";
import CategorySelect from "./CategorySelect";


export default function SearchBar() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <div className={styles.categoryWrapper}>
        <CategorySelect />
      </div>
      <div className={styles.searchDivider}></div>
      <input
        type="text"
        placeholder="Enter your search key..."
        className={styles.searchInput}
      />
      <button className={styles.searchButton} type="submit">
        <FaSearch className={styles.searchIcon} />
        <span className={styles.searchText}>Search</span>
      </button>
    </form>
  );
}
