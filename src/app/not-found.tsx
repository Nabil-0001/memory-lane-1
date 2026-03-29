"use client";

import { FaCompass } from "react-icons/fa";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <FaCompass />
        </span>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.subtitle}>
          This page doesn&apos;t exist, or it hasn&apos;t been written yet.
        </p>
        <Link href="/" className={styles.homeLink}>
          <span className={styles.arrow}>←</span>
          Back to My Journal
        </Link>
      </div>
    </main>
  );
}
