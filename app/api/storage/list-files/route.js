import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "../../../../lib/s3";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || !["admin", "teacher"].includes(payload.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const command = new ListObjectsV2Command({
    Bucket: process.env.LIARA_BUCKET_NAME,
    MaxKeys: 1000,
  });

  const data = await s3.send(command);
  return Response.json({ files: data.Contents || [] });
}
