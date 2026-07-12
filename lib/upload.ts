import { v4 as uuidv4 } from "uuid";
import { put, del } from "@vercel/blob";

export async function saveFile(file: File): Promise<string> {
  const ext = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : ".png";
  const key = `oc-images/${uuidv4()}${ext}`;

  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.includes("public.blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch {
    // ignore
  }
}
