import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../../../lib/s3";
import dbConnect from "../../../../../lib/dbConnect";
import Student from "../../../../../models/Student";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../../lib/jwt";

export async function DELETE() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || payload.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await Student.findById(payload.sub).select(
    "resumeKey resumeName resumeSize resumeType resumeUpdatedAt"
  );
  if (!student || !student.resumeKey) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    const del = new DeleteObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: student.resumeKey,
    });
    await s3.send(del);
  } catch {}

  student.resumeKey = undefined;
  student.resumeName = undefined;
  student.resumeSize = undefined;
  student.resumeType = undefined;
  student.resumeUpdatedAt = undefined;
  await student.save();

  return Response.json({ success: true });
}
