import { v4 as uuidv4 } from "uuid";
import * as qiniu from "qiniu";

const QINIU_BUCKET = process.env.QINIU_BUCKET || "ocimages";
const QINIU_DOMAIN =
  process.env.QINIU_DOMAIN || "ti22b7maq.hn-bkt.clouddn.com";

function getMac() {
  const accessKey =
    process.env.QINIU_ACCESS_KEY || "J5p1IAk0bV3AVNfV5yuRSBUgv3IbTnbcN0rQdE2a";
  const secretKey =
    process.env.QINIU_SECRET_KEY || "g9jSa7CyrDYLlYTeYkVyZLOCWju0moOcI67_oDKR";
  return new qiniu.auth.digest.Mac(accessKey, secretKey);
}

function getUploadToken(): string {
  const mac = getMac();
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: QINIU_BUCKET,
    expires: 3600,
  });
  return putPolicy.uploadToken(mac);
}

export async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : ".png";
  const key = `oc-images/${uuidv4()}${ext}`;
  const token = getUploadToken();

  const config = new qiniu.conf.Config();
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  return new Promise((resolve, reject) => {
    formUploader.put(
      token,
      key,
      buffer,
      putExtra,
      (err, _body, info) => {
        if (err) {
          reject(err);
          return;
        }
        if (info.statusCode === 200) {
          const url = QINIU_DOMAIN.startsWith("http")
            ? `${QINIU_DOMAIN}/${key}`
            : `https://${QINIU_DOMAIN}/${key}`;
          resolve(url);
        } else {
          reject(new Error(`Upload failed: ${info.statusCode}`));
        }
      }
    );
  });
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.includes("clouddn.com") && !url.includes("qiniu")) return;

  const mac = getMac();
  const config = new qiniu.conf.Config();
  const bucketManager = new qiniu.rs.BucketManager(mac, config);

  // Extract key from URL
  const key = url.includes("/oc-images/")
    ? url.substring(url.indexOf("/oc-images/") + 1)
    : url.substring(url.lastIndexOf("/") + 1);

  return new Promise((resolve) => {
    bucketManager.delete(QINIU_BUCKET, key, (err) => {
      if (err) console.error("Delete failed:", err);
      resolve();
    });
  });
}
