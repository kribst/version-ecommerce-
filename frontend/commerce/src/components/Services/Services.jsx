"use client";

import React from "react";
import styles from "./Services.module.css";
import {
  FaSyncAlt,
  FaTelegramPlane,
  FaLifeRing,
  FaLock,
  FaBlog,
} from "react-icons/fa";

const services = [
  {
    icon: <FaSyncAlt />,
    title: "Retour gratuit",
    desc: "Garantie satisfait ou remboursé de 30 jours !",
  },
  {
    icon: <FaTelegramPlane />,
    title: "Livraison gratuite",
    desc: "Livraison gratuite sur toutes les commandes",
  },
  {
    icon: <FaLifeRing />,
    title: "Assistance 24h/24 et 7j/7",
    desc: "Nous offrons une assistance en ligne 24 heures sur 24.",
  },
  {
    icon: <FaLock />,
    title: "Paiement sécurisé",
    desc: "Nous attachons une grande importance à votre sécurité.",
  },
  {
    icon: <FaBlog />,
    title: "Service en ligne",
    desc: "Retour des produits dans les 30 jours",
  },
];

export default function Services() {
  return (
    <section className={styles.servicesSection}>
      <div className={styles.servicesGrid}>
        {services.map((item, index) => (
          <div key={index} className={styles.serviceBox}>
            <div className={styles.serviceContent}>
              <span className={styles.icon}>{item.icon}</span>
              <div>
                <h6 className={styles.title}>{item.title}</h6>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
