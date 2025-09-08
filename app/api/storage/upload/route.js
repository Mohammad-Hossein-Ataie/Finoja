import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../../lib/s3";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

export async function POST(req) {
  // فقط ادمین/استاد اجازه آپلود
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || !["admin", "teacher"].includes(payload.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return Response.json({ error: "file is required" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ct = file.type || "application/octet-stream";
  const isVideo = ct.startsWith("video/");
  const isAudio = ct.startsWith("audio/");
  const prefix = isVideo ? "videos" : isAudio ? "audios" : "files";
  const safeName = (file.name || "file").replace(/\s+/g, "-");
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: ct,
  });

  await s3.send(command);
  return Response.json({ key });
}
