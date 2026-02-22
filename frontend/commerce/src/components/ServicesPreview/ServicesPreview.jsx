import React from "react";
import styles from "./ServicesPreview.module.css";
import Link from "next/link";

const SERVICES = [
  {
    id: "network",
    title: "Audit et câblage réseau",
    image:
      "/service/audit_et_cable.jpg",
  },
  {
    id: "surveillance",
    title: "Vidéo surveillance",
    image:
      "/service/video.jpg",
  },
  {
    id: "maintenance",
    title: "Maintenance informatique",
    image:
      "/service/samsung.jpg",
  },
  {
    id: "Application",
    title: "Développement d'application",
    image:
      "/service/code.jpg",
  },
];

export default function ServicesPreview() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionTitleWrapper}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.title}>Djocomptoir, c'est aussi des services</h2>
          </div>
        </div>
        <div className={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              href="/Services"
              className={styles.serviceCard}
            >
              <div className={styles.serviceImageWrapper}>
                <img
                  src={service.image}
                  alt={service.title}
                  className={styles.serviceImage}
                />
              </div>
              <p className={styles.serviceTitle}>{service.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
