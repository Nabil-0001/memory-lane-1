"use client";

import { useState, useRef } from "react";
import { FaCamera, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { Milestone, MilestoneFormData } from "@/types/milestone";
import {
  parseImagePaths,
  imagesToString,
  validateMilestone,
} from "@/utils/milestoneUtils";
import {
  uploadImage,
  isStorageConfigured,
  getImageFilename,
} from "@/utils/gcsStorage";
import styles from "./MilestoneForm.module.css";

interface MilestoneFormProps {
  milestone?: Milestone;
  onSubmit: (data: MilestoneFormData) => void;
  onCancel: () => void;
}

export default function MilestoneForm({
  milestone,
  onSubmit,
  onCancel,
}: MilestoneFormProps) {
  const [title, setTitle] = useState(milestone?.title || "");
  const [date, setDate] = useState(milestone?.date || "");
  const [description, setDescription] = useState(milestone?.description || "");
  const [images, setImages] = useState(
    milestone?.images ? imagesToString(milestone.images) : "",
  );
  const [tags, setTags] = useState(milestone?.tags?.join(", ") || "");
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: MilestoneFormData = {
      title: title.trim(),
      date,
      description: description.trim(),
      images: parseImagePaths(images),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };

    const validationErrors = validateMilestone(data);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(data);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isStorageConfigured()) {
      setErrors([
        "Firebase Storage is not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in your environment.",
      ]);
      return;
    }

    setUploading(true);
    setErrors([]);
    const uploadedUrls: string[] = [];
    const uploadErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);

      if (!file.type.startsWith("image/")) {
        uploadErrors.push(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        uploadErrors.push(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const result = await uploadImage(file);
      if ("error" in result) {
        uploadErrors.push(`${file.name}: ${result.error}`);
      } else {
        uploadedUrls.push(result.url);
      }
    }

    setUploading(false);
    setUploadProgress("");

    if (uploadErrors.length > 0) {
      setErrors(uploadErrors);
    }

    if (uploadedUrls.length > 0) {
      const currentImages = images.trim();
      const newImages = currentImages
        ? `${currentImages}, ${uploadedUrls.join(", ")}`
        : uploadedUrls.join(", ");
      setImages(newImages);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const imageList = parseImagePaths(images);
    const updatedImages = imageList.filter(
      (_, index) => index !== indexToRemove,
    );
    setImages(imagesToString(updatedImages));
  };

  const currentImages = parseImagePaths(images);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errors.length > 0 && (
        <div className={styles.errors}>
          {errors.map((error, index) => (
            <p key={index} className={styles.error}>
              {error}
            </p>
          ))}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Test Entry 01"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="date" className={styles.label}>
          Date *
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Capture what happened and why it mattered..."
          className={styles.textarea}
          rows={4}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Images</label>

        <div className={styles.uploadSection}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`${styles.uploadButton} ${uploading ? styles.uploadingButton : ""}`}
          >
            {uploading ? (
              <>
                <span className={styles.spinner}></span>
                {uploadProgress || "Uploading..."}
              </>
            ) : (
              <>
                <FaCamera aria-hidden="true" />
                <span>Upload Images</span>
              </>
            )}
          </label>
          {!isStorageConfigured() && (
            <p className={styles.warning}>
              <FaExclamationTriangle aria-hidden="true" />
              <span>Storage not configured - uploads disabled</span>
            </p>
          )}
        </div>

        {currentImages.length > 0 && (
          <div className={styles.imagePreviews}>
            {currentImages.map((img, index) => (
              <div key={index} className={styles.imagePreview}>
                <span className={styles.imageName} title={img}>
                  {getImageFilename(img)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className={styles.removeImageButton}
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          id="images"
          type="text"
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="Or enter image paths manually: photo1.jpg, photo2.jpg"
          className={styles.input}
        />
        <p className={styles.hint}>
          Upload images or enter filenames/URLs manually (comma-separated)
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="tags" className={styles.label}>
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="firsts, travel, celebrations"
          className={styles.input}
        />
        <p className={styles.hint}>Comma-separated tags for categorization</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={uploading}
        >
          {milestone ? "Save Changes" : "Add Milestone"}
        </button>
      </div>
    </form>
  );
}
