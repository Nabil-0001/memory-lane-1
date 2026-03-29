"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./YearNav.module.css";

interface YearNavProps {
  years: number[];
}

export default function YearNav({ years }: YearNavProps) {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updateActiveYear = useCallback(() => {
    if (years.length === 0) return;

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollReference = scrollTop + viewportHeight * 0.3;

    const yearPositions: { year: number; top: number }[] = [];

    for (const year of years) {
      const element = document.getElementById(`year-${year}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        yearPositions.push({ year, top: elementTop });
      }
    }

    yearPositions.sort((a, b) => a.top - b.top);

    let currentYear: number | null = null;

    for (let i = 0; i < yearPositions.length; i++) {
      const { year, top } = yearPositions[i];
      const nextTop = yearPositions[i + 1]?.top ?? Infinity;

      if (scrollReference >= top - 150 && scrollReference < nextTop - 150) {
        currentYear = year;
        break;
      }
    }

    if (currentYear === null && yearPositions.length > 0) {
      if (scrollReference < yearPositions[0].top) {
        currentYear = yearPositions[0].year;
      } else {
        currentYear = yearPositions[yearPositions.length - 1].year;
      }
    }

    setActiveYear(currentYear);
  }, [years]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;

      setIsVisible(scrollTop > viewportHeight * 0.8);

      updateActiveYear();
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", throttledScroll);
  }, [updateActiveYear]);

  const scrollToYear = (year: number) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      const offset = 100;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementTop - offset,
        behavior: "smooth",
      });
    }
  };

  if (years.length === 0) return null;

  return (
    <nav
      className={`${styles.yearNav} ${isVisible ? styles.visible : ""}`}
      aria-label="Year navigation"
    >
      <div className={styles.track}>
        {years.map((year) => (
          <button
            key={year}
            className={`${styles.node} ${activeYear === year ? styles.active : ""}`}
            onClick={() => scrollToYear(year)}
            aria-label={`Jump to ${year}`}
            aria-current={activeYear === year ? "true" : undefined}
          >
            <span className={styles.dot} />
            <span className={styles.label}>{year}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
