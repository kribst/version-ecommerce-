"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./HeaderSearch.module.css";
import CategorySelect from "./CategorySelect/CategorySelect";


const HeaderSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construire l'URL de recherche avec les paramètres
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append("q", searchQuery.trim());
    }
    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    // Rediriger vers la page de recherche
    const searchUrl = `/Seach${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(searchUrl);
  };

  return (
    <div className={styles.col6}>
      <div className={styles.headerSearch}>
        <form onSubmit={handleSubmit}>
          <CategorySelect 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />

          <input
            className={styles.input}
            type="text"
            placeholder="Recherche rapide"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button className={styles.searchBtn} type="submit">
            Chercher
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeaderSearch;
