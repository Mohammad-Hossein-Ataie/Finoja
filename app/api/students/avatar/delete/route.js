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

  const student = await Student.findById(payload.sub).select("avatarKey");
  if (!student || !student.avatarKey) {
    return Response.json({ error: "Avatar not found" }, { status: 404 });
  }

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: student.avatarKey,
    }));
  } catch {}

  student.avatarKey = undefined;
  student.avatarType = undefined;
  student.avatarSize = undefined;
  student.avatarUpdatedAt = undefined;
  await student.save();

  return Response.json({ success: true });
}
