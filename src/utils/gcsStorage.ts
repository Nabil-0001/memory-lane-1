import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export const FIREBASE_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";

export const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o`;

export function isStorageConfigured(): boolean {
  return Boolean(FIREBASE_STORAGE_BUCKET);
}

export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (!STORAGE_BASE_URL) {
    const cleanPath = imagePath.replace(/^\/+/, "").replace(/^images\//, "");
    return `/images/${cleanPath}`;
  }

  const cleanPath = imagePath.replace(/^\/+/, "").replace(/^images\//, "");

  const encodedPath = encodeURIComponent(cleanPath);

  return `${STORAGE_BASE_URL}/${encodedPath}?alt=media`;
}

export function getImageFilename(path: string): string {
  if (path.includes("firebasestorage.googleapis.com")) {
    const match = path.match(/\/o\/([^?]+)/);
    if (match) {
      return decodeURIComponent(match[1]).split("/").pop() || path;
    }
  }
  return path.split("/").pop() || path;
}

export function isHeicFile(file: File): boolean {
  const heicTypes = [
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
  ];
  const heicExtensions = [".heic", ".heif"];

  return (
    heicTypes.includes(file.type.toLowerCase()) ||
    heicExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  console.log("[Image] Converting HEIC to JPEG:", file.name);

  try {
    const heic2any = (await import("heic2any")).default;

    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });

    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    const newFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    const convertedFile = new File([blob], newFileName, { type: "image/jpeg" });

    console.log(
      `[Image] Converted ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) -> ${newFileName} (${(convertedFile.size / 1024 / 1024).toFixed(2)}MB)`,
    );

    return convertedFile;
  } catch (error) {
    console.error("Failed to convert HEIC:", error);
    throw new Error(`Failed to convert HEIC file: ${file.name}`);
  }
}

export async function compressImage(
  file: File,
  maxSizeMB: number = 2,
): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const maxDim = 1920;
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });
            console.log(
              `[Compress] Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
            );
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85,
      );
    };

    img.onerror = () =>
      reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(file);
  });
}

export async function processImageFile(file: File): Promise<File> {
  let processedFile = file;

  if (isHeicFile(file)) {
    processedFile = await convertHeicToJpeg(file);
  }

  if (processedFile.size > 2 * 1024 * 1024) {
    processedFile = await compressImage(processedFile);
  }

  return processedFile;
}

export async function uploadImage(
  file: File,
  folder: string = "memory-lane",
): Promise<{ url: string; path: string } | { error: string }> {
  if (!isStorageConfigured()) {
    return { error: "Firebase Storage is not configured." };
  }

  try {
    const processedFile = await processImageFile(file);

    const timestamp = Date.now();
    const sanitizedName = processedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = folder
      ? `${folder}/${timestamp}-${sanitizedName}`
      : `${timestamp}-${sanitizedName}`;

    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, processedFile, {
      contentType: processedFile.type,
    });

    const url = await getDownloadURL(storageRef);

    return { url, path };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}
