import styles from "./YearDivider.module.css";

interface YearDividerProps {
  year: number;
}

export default function YearDivider({ year }: YearDividerProps) {
  return (
    <div id={`year-${year}`} className={styles.divider}>
      <span className={styles.year}>{year}</span>
    </div>
  );
}
