// src/lib/firebase-upload.ts
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { firebaseApp } from "./firebaseClient"; // Ensure firebaseClient exports firebaseApp
import type { User } from "firebase/auth"; // Import User type for authContext.user.uid

// Exported interfaces remain the same as defined in your file-utils.ts (implicitly, if you moved them)
// Or, if defined here directly:
export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Uploads a single file to Firebase Storage.
 * @param file The File object to upload.
 * @param userId The UID of the authenticated user (for storage path and security rules).
 * @param onSingleFileProgress Optional callback for progress updates (0-100).
 * @returns A Promise that resolves with the UploadResult (download URL, file info).
 */
export async function uploadFileToFirebase(
  file: File,
  userId: string,
  onSingleFileProgress?: (progress: number) => void
): Promise<UploadResult> {
  const storage = getStorage(firebaseApp); // Get the Firebase Storage instance
  // Define the storage path: notes_attachments/{userId}/{timestamp_filename}
  const storageRef = ref(
    storage,
    `notes_attachments/${userId}/${Date.now()}_${file.name}`
  );

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculate progress for the current file
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onSingleFileProgress?.(progress); // Call optional progress callback
      },
      (error) => {
        // Handle upload failure
        console.error(
          "Firebase Storage Upload Error for file:",
          file.name,
          error
        );
        reject(error); // Reject the promise on error
      },
      async () => {
        // On successful completion, get the download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
        } catch (error) {
          console.error(
            "Error getting download URL for file:",
            file.name,
            error
          );
          reject(error); // Reject if getting URL fails
        }
      }
    );
  });
}

/**
 * Uploads an array of files sequentially to Firebase Storage.
 * @param files An array of File objects to upload.
 * @param userId The UID of the authenticated user.
 * @param onProgress Optional callback for overall progress (files completed / total files).
 * @returns A Promise that resolves with an array of UploadResults for all successfully uploaded files.
 */
export async function uploadMultipleFiles(
  files: File[],
  userId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const totalFiles = files.length;
  let filesCompleted = 0;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    try {
      // Pass a dummy onSingleFileProgress as NoteBox uses overall file count progress
      const result = await uploadFileToFirebase(file, userId);
      results.push(result);
      filesCompleted++;
      onProgress?.(filesCompleted, totalFiles); // Update progress after each file completes
    } catch (error) {
      // If an individual file upload fails, log the error and re-throw to indicate overall failure.
      // You could modify this to continue and return partial results if desired.
      console.error(
        `Overall upload failed: File ${file.name} failed to upload.`,
        error
      );
      throw error; // Re-throw to propagate the failure to the caller (NoteBox)
    }
  }

  return results;
}
