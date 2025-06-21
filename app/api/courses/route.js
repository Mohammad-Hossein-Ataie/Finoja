import { cookies } from "next/headers";
import { verifyJwt } from "../../../lib/jwt";
import dbConnect from "../../../lib/dbConnect";
import Course from "../../../models/Course";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role === "admin") {
    const courses = await Course.find().populate("teacher");
    return Response.json(courses);
  }

  if (payload.role === "teacher") {
    const courses = await Course.find({ teacher: payload.teacher }).populate("teacher");
    return Response.json(courses);
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const created = await Course.create(body);
  const populated = await Course.findById(created._id).populate("teacher");
  return Response.json(populated);
}
