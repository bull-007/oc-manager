import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const QINIU_ACCESS_KEY =
  process.env.QINIU_ACCESS_KEY || "J5p1IAk0bV3AVNfV5yuRSBUgv3IbTnbcN0rQdE2a";
const QINIU_SECRET_KEY =
  process.env.QINIU_SECRET_KEY || "g9jSa7CyrDYLlYTeYkVyZLOCWju0moOcI67_oDKR";
const QINIU_BUCKET = process.env.QINIU_BUCKET || "ocimages";
const QINIU_DOMAIN =
  process.env.QINIU_DOMAIN || "ti22b7maq.hn-bkt.clouddn.com";
const QINIU_UPLOAD_URL = "https://up-z2.qiniup.com";

function urlsafeBase64(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getUploadToken(): string {
  const putPolicy = JSON.stringify({
    scope: QINIU_BUCKET,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  });

  const encodedPutPolicy = urlsafeBase64(putPolicy);

  const hmac = crypto.createHmac("sha1", QINIU_SECRET_KEY);
  hmac.update(encodedPutPolicy);
  const sign = hmac.digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${QINIU_ACCESS_KEY}:${sign}:${encodedPutPolicy}`;
}

export async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : ".png";
  const key = `oc-images/${uuidv4()}${ext}`;

  const token = getUploadToken();

  const formData = new FormData();
  formData.append("token", token);
  formData.append("key", key);
  formData.append("file", new Blob([buffer]));

  const response = await fetch(QINIU_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} ${text}`);
  }

  const domain = QINIU_DOMAIN.startsWith("http")
    ? QINIU_DOMAIN
    : `http://${QINIU_DOMAIN}`;
  const qiniuUrl = `${domain}/${key}`;

  // Return proxy URL so images load over HTTPS
  return `/api/images?url=${encodeURIComponent(qiniuUrl)}`;
}

export async function deleteFile(url: string): Promise<void> {
  // deletion via Qiniu API requires similar token, skip for now
}
