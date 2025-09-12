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

  const student = await Student.findById(payload.sub).select("avatarKey avatarUpdatedAt");
  if (!student || !student.avatarKey) {
    return Response.json({ error: "Avatar not found" }, { status: 404 });
  }

  const cmd = new GetObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: student.avatarKey,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 10 });

  // cache-busting با updatedAt برای <img>
  const finalUrl = student.avatarUpdatedAt ? `${url}&t=${student.avatarUpdatedAt.getTime()}` : url;

  return Response.json({ url: finalUrl });
}
