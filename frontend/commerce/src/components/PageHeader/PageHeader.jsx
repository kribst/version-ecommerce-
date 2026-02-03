import styles from "./PageHeader.module.css";

export default function PageHeader({ title, backgroundImage }) {
  return (
    <div
      className={styles.pageHeader}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
