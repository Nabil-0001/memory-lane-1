"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import { Milestone } from "@/types/milestone";
import { formatDate } from "@/utils/milestoneUtils";
import { getImageUrl } from "@/utils/gcsStorage";
import DeleteConfirmation from "./DeleteConfirmation";
import styles from "./MilestoneCard.module.css";

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  isAdminMode?: boolean;
  onDelete?: (id: string) => void;
}

function ImageWithSkeleton({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <button
      className={styles.imageWrapper}
      onClick={onClick}
      aria-label={`View ${alt} full size`}
    >
      {!isLoaded && <div className={styles.skeleton} />}

      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={`${styles.image} ${isLoaded ? styles.imageLoaded : styles.imageLoading}`}
        unoptimized={
          src.includes("firebasestorage.googleapis.com") ||
          src.includes("storage.googleapis.com")
        }
        onLoad={() => setIsLoaded(true)}
      />
    </button>
  );
}

export default function MilestoneCard({
  milestone,
  index,
  isAdminMode,
  onDelete,
}: MilestoneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(milestone.id);
      setShowDeleteConfirm(false);
    }
  };

  const openModal = (imageUrl: string) => {
    setModalImage(imageUrl);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalImage(null);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalImage) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalImage]);

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${isEven ? styles.left : styles.right} ${isVisible ? styles.visible : ""}`}
      style={{ "--delay": `${index * 0.1}s` } as React.CSSProperties}
    >
      <div className={styles.dot} aria-hidden="true" />

      <div className={styles.content}>
        <time className={styles.date}>{formatDate(milestone.date)}</time>
        <h2 className={styles.title}>{milestone.title}</h2>
        <p className={styles.description}>{milestone.description}</p>

        {milestone.images.length > 0 && (
          <div className={styles.gallery}>
            {milestone.images.map((image, imgIndex) => {
              const imageUrl = getImageUrl(image);
              return (
                <ImageWithSkeleton
                  key={imgIndex}
                  src={imageUrl}
                  alt={`${milestone.title} - Photo ${imgIndex + 1}`}
                  onClick={() => openModal(imageUrl)}
                />
              );
            })}
          </div>
        )}

        {milestone.tags && milestone.tags.length > 0 && (
          <div className={styles.tags}>
            {milestone.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {isAdminMode && (
          <div className={styles.adminActions}>
            <button
              className={styles.deleteButton}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmation
          title={milestone.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {modalImage && (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Full size image"
        >
          <button
            className={styles.modalClose}
            onClick={closeModal}
            aria-label="Close image"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={modalImage}
              alt="Full size view"
              fill
              sizes="100vw"
              className={styles.modalImage}
              unoptimized={
                modalImage.includes("firebasestorage.googleapis.com") ||
                modalImage.includes("storage.googleapis.com")
              }
              priority
            />
          </div>
        </div>
      )}
    </article>
  );
}
