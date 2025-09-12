import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../../../lib/s3";
import dbConnect from "../../../../../lib/dbConnect";
import Student from "../../../../../models/Student";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../../lib/jwt";

export async function POST(req) {
  await dbConnect();

  // احراز هویت دانش‌آموز
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || payload.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await Student.findById(payload.sub);
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return Response.json({ error: "file is required" }, { status: 400 });

  // محدودیت‌های پایه (امنیتی/کیفی)
  const ALLOWED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX = 10 * 1024 * 1024; // 10MB

  const ct = file.type || "application/octet-stream";
  if (!ALLOWED.includes(ct)) {
    return Response.json({ error: "نوع فایل مجاز نیست. فقط PDF/DOC/DOCX" }, { status: 400 });
  }
  if (typeof file.size === "number" && file.size > MAX) {
    return Response.json({ error: "حجم فایل بیش از حد مجاز است (حداکثر ۱۰ مگابایت)" }, { status: 400 });
  }

  // ساخت کلید امن
  const safeName = (file.name || "resume").replace(/\s+/g, "-");
  const key = `resumes/${student._id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // آپلود
  const put = new PutObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: ct,
  });
  await s3.send(put);

  // اگر رزومه قدیمی داشته، حذفش کن (نظافت)
  if (student.resumeKey) {
    try {
      const del = new DeleteObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: student.resumeKey,
      });
      await s3.send(del);
    } catch {}
  }

  // ثبت در DB
  student.resumeKey = key;
  student.resumeName = file.name || "resume";
  student.resumeType = ct;
  student.resumeSize = typeof file.size === "number" ? file.size : undefined;
  student.resumeUpdatedAt = new Date();
  await student.save();

  return Response.json({
    success: true,
    key,
    name: student.resumeName,
    size: student.resumeSize,
    type: student.resumeType,
    updatedAt: student.resumeUpdatedAt,
  });
}
