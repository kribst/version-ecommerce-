import Header from "@/components/HEADER/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";
import Link from "next/link";
import { FaPhoneAlt } from "react-icons/fa";
import ConsultBanner from "./ConsultBanner";


const SERVICE_SECTIONS = [
  {
    id: "maintenance",
    title: "Maintenance Informatique",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=960&q=80",
    paragraphs: [
      "Nos services de maintenance informatique gardent vos ordinateurs et serveurs performants au quotidien, grâce à des contrôles réguliers et des mises à jour suivies.",
      "Nous intervenons rapidement en cas de panne, à distance ou sur site, pour limiter les interruptions d’activité et sécuriser vos données sensibles.",
      "Que vous soyez une petite structure ou une entreprise établie, nous adaptons nos contrats de maintenance à vos besoins et à votre budget.",
    ],
    ctaLabel: "NOUS CONTACTER",
  },
  {
    id: "web",
    title: "Développement Web",
    image:
      "https://images.unsplash.com/photo-1649451844931-57e22fc82de3?auto=format&fit=crop&w=960&q=80",
    paragraphs: [
      "Nous concevons des sites web modernes, rapides et responsives qui valorisent votre image de marque et offrent une expérience fluide sur tous les écrans.",
      "Du site vitrine à la boutique en ligne, nous construisons des interfaces centrées sur l’utilisateur, pensées pour convertir vos visiteurs en clients.",
      "Nous vous accompagnons après la mise en ligne avec des évolutions, optimisations et un suivi technique pour garder votre présence digitale toujours à jour.",
    ],
    ctaLabel: "NOUS CONTACTER",
  },
  {
    id: "network",
    title: "Installation Réseau",
    image:
      "https://tyler.com/wp-content/uploads/2023/11/Surf-Services-4th-Sec-Image.jpeg",
    paragraphs: [
      "Nous étudions vos locaux et vos usages pour concevoir une architecture réseau performante, stable et évolutive, en filaire comme en Wi‑Fi.",
      "Du câblage aux équipements actifs, nous installons et configurons chaque élément pour garantir un haut niveau de disponibilité et de sécurité.",
      "Notre équipe reste à vos côtés pour les extensions, optimisations et audits réguliers afin de garder votre infrastructure prête pour vos futurs projets.",
    ],
    ctaLabel: "NOUS CONTACTER",
  },
];

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.fixedHeader}>
        <Header />
      </div>

      {/* Hero / Cover inspiré du bloc WP */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.heroBadge}>Boncomptoir Services</p>
            <h1 className={styles.heroTitle}>Tech Solutions</h1>
            <p className={styles.heroSubtitle}>
              Des solutions intégrées pour votre succès numérique : réseau, web,
              sécurité et maintenance.
            </p>
          </div>
        </div>
      </section>

      <ConsultBanner />

      {/* Sections détaillées pour chaque service */}
      <main>
        {SERVICE_SECTIONS.map((service, index) => (
          <section key={service.id} className={styles.detailSection}>
            <div
              className={`${styles.detailInner} ${
                index % 2 === 1 ? styles.detailReverse : ""
              }`}
            >
              <div className={styles.detailImageCol}>
                <img
                  src={service.image}
                  alt={service.title}
                  className={styles.detailImage}
                />
              </div>
              <div className={styles.detailContentCol}>
                <h2 className={styles.detailTitle}>{service.title}</h2>
                <div className={styles.detailSeparator} />
                {service.paragraphs.map((text, i) => (
                  <p key={i} className={styles.detailText}>
                    {text}
                  </p>
                ))}
                <Link href="/contact" className={styles.detailButton}>
                  {service.ctaLabel}
                </Link>
              </div>
            </div>
          </section>
        ))}

        {/* Citation / couverture finale */}
        <section className={styles.citationSection}>
          <div className={styles.citationOverlay} />
          <div className={styles.citationContent}>
            <p className={styles.citationText}>
              Your tech success is our passion — experience unmatched support and
              expertise with us!
            </p>
          </div>
        </section>
      </main>



      <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Besoin d’un accompagnement ?</h2>
              <p className={styles.ctaSubtitle}>
                Planifions ensemble un audit ou un rendez-vous pour étudier vos besoins
                en réseau, sécurité, vidéosurveillance ou maintenance informatique.
              </p>
            </div>

            <div className={styles.ctaActions}>
              <a href="tel:+237653532055" className={styles.ctaButton}>
                <FaPhoneAlt />
                Demander un rendez-vous
              </a>

              <p className={styles.ctaPhone}>
                Téléphone : <strong>(+237) 653 532 055 / 655 556 620</strong>
              </p>
            </div>
          </div>
        </section>

      <Footer />
    </div>
  );
}
