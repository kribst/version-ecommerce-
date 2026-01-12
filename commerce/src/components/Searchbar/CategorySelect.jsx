"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CategorySelect.module.css";


export default function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 1️⃣ Charger depuis le cache
    const cached = localStorage.getItem("categories");
    if (cached) {
      setCategories(JSON.parse(cached));
    }

    // 2️⃣ Re-fetch depuis le backend
    async function fetchCategories() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`
        );
        setCategories(res.data);
        localStorage.setItem("categories", JSON.stringify(res.data));
      } catch (error) {
        console.error("Erreur chargement catégories :", error);
      }
    }

    fetchCategories();
  }, []);

  // Filtrer les catégories pour éviter les doublons avec "All Categories"
  const filteredCategories = categories.filter((category) => {
    if (!category || !category.name) return false;
    const nameLower = category.name.toLowerCase().trim();
    return nameLower !== "all categories" && nameLower !== "allcategories";
  });

  return (
    <select className={styles.categorySelect} value={value} onChange={onChange}>
      <option value="">All Categories</option>
      {filteredCategories.map((category) => (
        <option key={category.id} value={category.slug || category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
