import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../../../lib/s3";
import dbConnect from "../../../../../lib/dbConnect";
import Student from "../../../../../models/Student";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../../lib/jwt";

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || payload.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await Student.findById(payload.sub);
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  const fd = await req.formData();
  const file = fd.get("file");
  if (!file) return Response.json({ error: "file is required" }, { status: 400 });

  const MAX = 5 * 1024 * 1024; // 5MB
  const ALLOWED = ["image/jpeg","image/png","image/webp"];
  const ct = file.type || "application/octet-stream";
  if (!ALLOWED.includes(ct)) {
    return Response.json({ error: "فقط JPG/PNG/WEBP مجاز است." }, { status: 400 });
  }
  if (typeof file.size === "number" && file.size > MAX) {
    return Response.json({ error: "حداکثر ۵ مگابایت." }, { status: 400 });
  }

  const safeName = (file.name || "avatar").replace(/\s+/g, "-");
  const key = `avatars/${student._id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;

  const buf = Buffer.from(await file.arrayBuffer());
  await s3.send(new PutObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: key,
    Body: buf,
    ContentType: ct,
    CacheControl: "public, max-age=31536000, immutable"
  }));

  // حذف آواتار قبلی
  if (student.avatarKey) {
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: student.avatarKey,
      }));
    } catch {}
  }

  student.avatarKey = key;
  student.avatarType = ct;
  student.avatarSize = typeof file.size === "number" ? file.size : undefined;
  student.avatarUpdatedAt = new Date();
  await student.save();

  return Response.json({
    success: true,
    key,
    type: student.avatarType,
    size: student.avatarSize,
    updatedAt: student.avatarUpdatedAt,
  });
}
