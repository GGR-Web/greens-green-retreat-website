
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file will be stored.
 * @returns A promise that resolves with the public URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed.");
  }
}
