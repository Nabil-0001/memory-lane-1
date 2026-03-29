"use client";

import { useState } from "react";
import {
  FaCog,
  FaEdit,
  FaExclamationTriangle,
  FaLock,
  FaSignOutAlt,
  FaPlus,
  FaRedo,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { Milestone, MilestoneFormData } from "@/types/milestone";
import MilestoneForm from "./MilestoneForm";
import styles from "./AdminPanel.module.css";

interface AdminPanelProps {
  milestones: Milestone[];
  onAdd: (data: MilestoneFormData) => Promise<unknown>;
  onUpdate: (id: string, data: Partial<MilestoneFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReset: () => Promise<void>;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthenticate: (email: string, password: string) => Promise<string | null>;
  onLogout: () => Promise<void>;
}

export default function AdminPanel({
  milestones,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
  onClose,
  isAuthenticated,
  onAuthenticate,
  onLogout,
}: AdminPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const error = await onAuthenticate(email, password);
    if (!error) {
      setPasswordError("");
      setPassword("");
    } else {
      setPasswordError(error);
    }
    setIsAuthenticating(false);
  };

  const handleAddNew = (data: MilestoneFormData) => {
    void onAdd(data);
    setIsAddingNew(false);
  };

  const handleUpdate = (data: MilestoneFormData) => {
    if (editingMilestone) {
      void onUpdate(editingMilestone.id, data);
      setEditingMilestone(null);
    }
  };

  const handleReset = () => {
    void onReset();
    setShowResetConfirm(false);
  };

  const handleLogout = async () => {
    await onLogout();
    setPassword("");
    setPasswordError("");
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close admin panel"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <h2 className={styles.title}>
            <FaLock className={styles.titleIcon} aria-hidden="true" />
            <span>Admin Access</span>
          </h2>
          <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className={styles.passwordInput}
                autoComplete="email"
                autoFocus
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={styles.passwordInput}
                autoComplete="current-password"
              />
            </div>
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Signing in..." : "Sign in as admin"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (editingMilestone || isAddingNew) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close admin panel"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <h2 className={styles.title}>
            {isAddingNew ? (
              <>
                <FaPlus className={styles.titleIcon} aria-hidden="true" />
                <span>Add New Milestone</span>
              </>
            ) : (
              <>
                <FaEdit className={styles.titleIcon} aria-hidden="true" />
                <span>Edit Milestone</span>
              </>
            )}
          </h2>
          <MilestoneForm
            milestone={editingMilestone || undefined}
            onSubmit={isAddingNew ? handleAddNew : handleUpdate}
            onCancel={() => {
              setEditingMilestone(null);
              setIsAddingNew(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close admin panel"
        >
          <FaTimes aria-hidden="true" />
        </button>
        <h2 className={styles.title}>
          <FaCog className={styles.titleIcon} aria-hidden="true" />
          <span>Admin Panel</span>
        </h2>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={() => void handleLogout()}
          >
            <FaSignOutAlt className={styles.buttonIcon} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
          <button
            className={styles.addButton}
            onClick={() => setIsAddingNew(true)}
          >
            <FaPlus className={styles.buttonIcon} aria-hidden="true" />
            <span>Add New Milestone</span>
          </button>
        </div>

        <div className={styles.milestoneList}>
          <h3 className={styles.listTitle}>Milestones ({milestones.length})</h3>
          {milestones.map((milestone) => (
            <div key={milestone.id} className={styles.milestoneItem}>
              <div className={styles.milestoneInfo}>
                <span className={styles.milestoneName}>{milestone.title}</span>
                <span className={styles.milestoneDate}>{milestone.date}</span>
              </div>
              <div className={styles.milestoneActions}>
                <button
                  onClick={() => setEditingMilestone(milestone)}
                  className={styles.editButton}
                  aria-label="Edit milestone"
                >
                  <FaEdit aria-hidden="true" />
                </button>
                <button
                  onClick={() => void onDelete(milestone.id)}
                  className={styles.deleteButton}
                  aria-label="Delete milestone"
                >
                  <FaTrash aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.dangerZone}>
          <h3 className={styles.dangerTitle}>
            <FaExclamationTriangle
              className={styles.titleIcon}
              aria-hidden="true"
            />
            <span>Danger Zone</span>
          </h3>
          {showResetConfirm ? (
            <div className={styles.confirmReset}>
              <p>Reset all milestones to defaults?</p>
              <div className={styles.confirmButtons}>
                <button onClick={handleReset} className={styles.confirmYes}>
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={styles.confirmNo}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className={styles.resetButton}
            >
              <FaRedo className={styles.buttonIcon} aria-hidden="true" />
              <span>Reset to Defaults</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
