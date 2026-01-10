"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(null);

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

  return (
    <CategoryContext.Provider value={categories}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
