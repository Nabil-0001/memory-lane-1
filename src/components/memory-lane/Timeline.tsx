"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Milestone } from "@/types/milestone";
import MilestoneCard from "./MilestoneCard";
import YearDivider from "./YearDivider";
import { getYear } from "@/utils/milestoneUtils";
import styles from "./Timeline.module.css";

interface TimelineProps {
  milestones: Milestone[];
  isAdminMode?: boolean;
  onDelete?: (id: string) => void;
}

interface TimelineItem {
  type: "year" | "milestone";
  year?: number;
  milestone?: Milestone;
  index?: number;
}

const MILESTONE_HEIGHT = 800;
const YEAR_DIVIDER_HEIGHT = 80;
const BUFFER_COUNT = 10;

export default function Timeline({
  milestones,
  isAdminMode,
  onDelete,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];
    let lastYear: number | null = null;

    milestones.forEach((milestone, index) => {
      const year = getYear(milestone.date);
      if (year !== lastYear) {
        items.push({ type: "year", year });
        lastYear = year;
      }
      items.push({ type: "milestone", milestone, index });
    });

    return items;
  }, [milestones]);

  const itemPositions = useMemo(() => {
    const positions: { top: number; height: number }[] = [];
    let currentTop = 0;

    timelineItems.forEach((item) => {
      const height =
        item.type === "year" ? YEAR_DIVIDER_HEIGHT : MILESTONE_HEIGHT;
      positions.push({ top: currentTop, height });
      currentTop += height;
    });

    return positions;
  }, [timelineItems]);

  const calculateVisibleRange = useCallback(() => {
    if (typeof window === "undefined" || !containerRef.current) {
      return { start: 0, end: Math.min(10, timelineItems.length - 1) };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerTop = window.scrollY + containerRect.top;
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;

    const relativeScrollTop = Math.max(0, scrollTop - containerTop);
    const relativeScrollBottom = relativeScrollTop + viewportHeight;

    let startIndex = 0;
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i].top + itemPositions[i].height >= relativeScrollTop) {
        startIndex = Math.max(0, i - BUFFER_COUNT);
        break;
      }
    }

    let endIndex = timelineItems.length - 1;
    for (let i = startIndex; i < itemPositions.length; i++) {
      if (itemPositions[i].top > relativeScrollBottom) {
        endIndex = Math.min(timelineItems.length - 1, i + BUFFER_COUNT);
        break;
      }
    }

    return { start: startIndex, end: endIndex };
  }, [timelineItems.length, itemPositions]);

  useEffect(() => {
    const handleScroll = () => {
      const newRange = calculateVisibleRange();
      setVisibleRange((prev) => {
        if (prev.start !== newRange.start || prev.end !== newRange.end) {
          return newRange;
        }
        return prev;
      });
    };

    handleScroll();

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
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [calculateVisibleRange]);

  const isItemVisible = (index: number) => {
    return index >= visibleRange.start && index <= visibleRange.end;
  };

  return (
    <section id="timeline" className={styles.timeline}>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.line} aria-hidden="true" />

        {timelineItems.map((item, itemIndex) => {
          const position = itemPositions[itemIndex];

          if (item.type === "year") {
            if (!isItemVisible(itemIndex)) {
              return (
                <div
                  key={`year-${item.year}`}
                  className={styles.placeholder}
                  style={{ height: position.height }}
                  aria-hidden="true"
                />
              );
            }
            return <YearDivider key={`year-${item.year}`} year={item.year!} />;
          }

          if (!isItemVisible(itemIndex)) {
            return (
              <div
                key={item.milestone!.id}
                className={styles.placeholder}
                style={{ height: position.height }}
                aria-hidden="true"
              />
            );
          }

          return (
            <MilestoneCard
              key={item.milestone!.id}
              milestone={item.milestone!}
              index={item.index!}
              isAdminMode={isAdminMode}
              onDelete={onDelete}
            />
          );
        })}

        {milestones.length === 0 && (
          <div className={styles.emptyState}>
            <p>No milestones yet. Add your first one.</p>
          </div>
        )}

        {milestones.length > 0 && (
          <div className={styles.timelineEnd}>
            <p className={styles.endMessage}>
              You&apos;ve reached the end for now. More chapters ahead.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
