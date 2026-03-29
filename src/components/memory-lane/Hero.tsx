"use client";

import { FaBookOpen, FaStickyNote } from "react-icons/fa";
import styles from "./Hero.module.css";

interface HeroProps {
  isLoading?: boolean;
  hasData?: boolean;
}

export default function Hero({ isLoading = false, hasData = true }: HeroProps) {
  const scrollToTimeline = () => {
    const timeline = document.getElementById("timeline");
    if (timeline) {
      timeline.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <FaBookOpen />
        </span>
        <h1 className={styles.title}>My Journal</h1>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <span className={styles.spinner}></span>
            <span className={styles.loadingText}>Loading milestones...</span>
          </div>
        ) : hasData ? (
          <button
            className={styles.scrollHint}
            onClick={scrollToTimeline}
            aria-label="Scroll to timeline"
          >
            <span className={styles.scrollText}>Scroll to begin</span>
            <span className={styles.scrollArrow}>↓</span>
          </button>
        ) : (
          <div className={styles.noDataContainer}>
            <span className={styles.noDataIcon} aria-hidden="true">
              <FaStickyNote />
            </span>
            <p className={styles.noDataText}>No milestones yet...</p>
            <p className={styles.noDataHint}>
              Add your first milestone in admin mode.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
