import styles from "./ConsultBanner.module.css";
import { FaUserAlt } from "react-icons/fa";

export default function ConsultBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.left}>
          <span className={styles.icon}>
            <FaUserAlt />
          </span>
          <div className={styles.textBlock}>
            <span className={styles.smallLabel}>Demandez un RDV</span>
            <h2 className={styles.title}>Obtenez une consultation gratuite</h2>
          </div>
        </div>

        <div className={styles.right}>
          <a href="/contact" className={styles.contactButton}>
            NOUS CONTACTER
          </a>

          <div className={styles.phoneBlock}>
            <span className={styles.phoneLabel}>APPELEZ-NOUS</span>
            <a href="tel:+237653532055" className={styles.phoneNumber}>
              653 532 055
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

