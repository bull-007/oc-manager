import { v4 as uuidv4 } from "uuid";

const QINIU_ACCESS_KEY =
  process.env.QINIU_ACCESS_KEY || "J5p1IAk0bV3AVNfV5yuRSBUgv3IbTnbcN0rQdE2a";
const QINIU_SECRET_KEY =
  process.env.QINIU_SECRET_KEY || "g9jSa7CyrDYLlYTeYkVyZLOCWju0moOcI67_oDKR";
const QINIU_BUCKET = process.env.QINIU_BUCKET || "ocimages";
const QINIU_DOMAIN =
  process.env.QINIU_DOMAIN || "ti22b7maq.hn-bkt.clouddn.com";
const QINIU_UPLOAD_URL = "https://upload-z2.qiniup.com";

// Simple base64url encode
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate upload token using HMAC-SHA1
async function getUploadToken(): Promise<string> {
  const putPolicy = JSON.stringify({
    scope: QINIU_BUCKET,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  });

  const encodedPutPolicy = base64UrlEncode(putPolicy);

  // HMAC-SHA1 sign using Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(QINIU_SECRET_KEY);
  const messageData = encoder.encode(encodedPutPolicy);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const signBase64 = Buffer.from(signature).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const encodedSign = base64UrlEncode(
    `${QINIU_ACCESS_KEY}:${signBase64}`
  );

  return `${encodedSign}:${encodedPutPolicy}`;
}

export async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : ".png";
  const key = `oc-images/${uuidv4()}${ext}`;

  const token = await getUploadToken();

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
    throw new Error(`Qiniu upload failed: ${response.status} ${text}`);
  }

  const domain = QINIU_DOMAIN.startsWith("http")
    ? QINIU_DOMAIN
    : `https://${QINIU_DOMAIN}`;
  return `${domain}/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.includes("clouddn.com") && !url.includes("qiniu")) return;
  // Deletion not critical for now — skip silently
}
