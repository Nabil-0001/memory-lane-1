import { FaCog } from "react-icons/fa";
import styles from "./AdminTrigger.module.css";

interface AdminTriggerProps {
  onTrigger: () => void;
  isAdminMode: boolean;
}

export default function AdminTrigger({
  onTrigger,
  isAdminMode,
}: AdminTriggerProps) {
  return (
    <button
      className={`${styles.trigger} ${isAdminMode ? styles.active : ""}`}
      onClick={onTrigger}
      aria-label="Toggle admin panel"
      title="Press 'a' three times or click to open admin panel"
    >
      <FaCog aria-hidden="true" />
    </button>
  );
}
