"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "@/components/home/home.module.css";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.root}>
      <main className={styles.fallback}>
        <p className={styles.data}>Error</p>
        <h1 className={styles.h1}>
          <span className={styles.h1Lead}>Something broke on this page.</span>
          <span className={styles.h1Follow}>Trying again usually fixes it.</span>
        </h1>
        <div className={`${styles.actions} ${styles.actionsLeft}`}>
          <button type="button" className={styles.btnSecondary} onClick={reset}>
            Try again
          </button>
          <Link className={styles.btnSecondary} href="/">
            Back to the home page
          </Link>
        </div>
      </main>
    </div>
  );
}
