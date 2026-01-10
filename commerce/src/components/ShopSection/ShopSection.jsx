"use client";

import Link from "next/link";
import { FaArrowCircleRight } from "react-icons/fa";

export default function ShopSection() {
  return (
    <section className="py-12">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Shop Card */}
          <div className="relative group overflow-hidden rounded-lg bg-gray-100">
            {/* Image */}
            <img
              src="/img/shop01.png"
              alt="Laptop Collection"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
              <h4 className="text-xl font-semibold leading-tight mb-3">
                Laptop <br /> Collection
              </h4>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-red-400 transition"
              >
                Shop now
                <FaArrowCircleRight className="text-lg" />
              </Link>
            </div>
          </div>

          {/* Duplique ce bloc pour d’autres catégories */}
          
        </div>
      </div>
    </section>
  );
}
