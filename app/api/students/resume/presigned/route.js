import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../../../../lib/s3";
import dbConnect from "../../../../../lib/dbConnect";
import Student from "../../../../../models/Student";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../../lib/jwt";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;
  if (!payload || payload.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await Student.findById(payload.sub).select("resumeKey");
  if (!student || !student.resumeKey) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }

  const cmd = new GetObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: student.resumeKey,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 10 }); // 10 دقیقه

  return Response.json({ url });
}
