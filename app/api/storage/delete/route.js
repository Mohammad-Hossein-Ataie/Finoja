import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../../lib/s3";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

export async function DELETE(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || !["admin", "teacher"].includes(payload.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key } = await req.json();
  if (!key) return Response.json({ error: "key required" }, { status: 400 });

  const command = new DeleteObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: key,
  });

  await s3.send(command);
  return Response.json({ message: "deleted" });
}
