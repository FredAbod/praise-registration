import { v2 as cloudinary } from "cloudinary";

function configure() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return cloudinary;
}

/** Upload a receipt image buffer to Cloudinary; returns secure URL. */
export async function uploadReceipt(
  buffer: Buffer,
  registrationId: string,
  mimeType: string
): Promise<string> {
  const cld = configure();
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const result = await cld.uploader.upload(dataUri, {
    folder: "youth-retreat/receipts",
    public_id: registrationId,
    overwrite: true,
    resource_type: "image",
  });

  return result.secure_url;
}
