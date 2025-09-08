import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../../../lib/s3";

export async function POST(req) {
  const { key } = await req.json();
  if (!key) return Response.json({ error: "key is required" }, { status: 400 });

  const command = new GetObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1h
  return Response.json({ url });
}
