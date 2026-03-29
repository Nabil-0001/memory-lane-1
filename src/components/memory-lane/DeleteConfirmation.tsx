import { FaExclamationTriangle } from "react-icons/fa";
import styles from "./DeleteConfirmation.module.css";

interface DeleteConfirmationProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({
  title,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon} aria-hidden="true">
          <FaExclamationTriangle />
        </div>
        <h3 className={styles.title}>Delete Milestone?</h3>
        <p className={styles.message}>
          Are you sure you want to delete <strong>&ldquo;{title}&rdquo;</strong>
          ? This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
