import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT, // e.g. https://storage.c2.liara.space
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY,
    secretAccessKey: process.env.LIARA_SECRET_KEY,
  },
  forcePathStyle: true,
});
