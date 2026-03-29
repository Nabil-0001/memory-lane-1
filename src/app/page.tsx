"use client";

import { useMemo } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Hero from "@/components/memory-lane/Hero";
import Timeline from "@/components/memory-lane/Timeline";
import YearNav from "@/components/memory-lane/YearNav";
import AdminPanel from "@/components/memory-lane/AdminPanel";
import AdminTrigger from "@/components/memory-lane/AdminTrigger";
import { useMilestones } from "@/hooks/useMilestones";
import { useAdminMode } from "@/hooks/useAdminMode";
import { getYear } from "@/utils/milestoneUtils";
import styles from "./page.module.css";

export default function HomePage() {
  const {
    milestones,
    isLoading,
    error: syncError,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    clearAllMilestones,
  } = useMilestones();
  const {
    isAdminMode,
    showAdminPanel,
    toggleAdminPanel,
    closeAdminPanel,
    authenticateAdmin,
    logout,
  } = useAdminMode();
  const hasData = milestones.length > 0;
  const years = useMemo(() => {
    const uniqueYears = [
      ...new Set(milestones.map((milestone) => getYear(milestone.date))),
    ];
    return uniqueYears.sort((left, right) => left - right);
  }, [milestones]);

  return (
    <main className={`${styles.main} ${isLoading ? styles.noScroll : ""}`}>
      <Hero isLoading={isLoading} hasData={hasData} />

      {syncError && (
        <div className={styles.syncError}>
          <FaExclamationTriangle aria-hidden="true" />
          <span>{syncError}</span>
        </div>
      )}

      {!isLoading && hasData && (
        <>
          <YearNav years={years} />
          <Timeline
            milestones={milestones}
            isAdminMode={isAdminMode}
            onDelete={deleteMilestone}
          />
        </>
      )}

      <AdminTrigger onTrigger={toggleAdminPanel} isAdminMode={isAdminMode} />

      {showAdminPanel && (
        <AdminPanel
          milestones={milestones}
          onAdd={addMilestone}
          onUpdate={updateMilestone}
          onDelete={deleteMilestone}
          onReset={clearAllMilestones}
          onClose={closeAdminPanel}
          isAuthenticated={isAdminMode}
          onAuthenticate={authenticateAdmin}
          onLogout={logout}
        />
      )}
    </main>
  );
}
