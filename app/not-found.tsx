import Link from "next/link";
import styles from "@/components/home/home.module.css";

export default function NotFound() {
  return (
    <div className={styles.root}>
      <main className={styles.fallback}>
        <p className={styles.data}>404</p>
        <h1 className={styles.h1}>
          <span className={styles.h1Lead}>This page does not exist.</span>
          <span className={styles.h1Follow}>
            The link may be mistyped, or the page has moved.
          </span>
        </h1>
        <Link className={styles.btnSecondary} href="/">
          Back to the home page
        </Link>
      </main>
    </div>
  );
}
