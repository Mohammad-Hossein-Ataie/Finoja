import { cookies } from "next/headers";
import { verifyJwt } from "../../../lib/jwt";
import dbConnect from "../../../lib/dbConnect";
import Course from "../../../models/Course";
import "../../../models/Teacher"; // برای populate

export async function GET() {
  await dbConnect();
  let payload = null;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) payload = await verifyJwt(token);
  } catch (e) {}

  // admin: همه دوره‌ها
  if (payload && payload.role === "admin") {
    const courses = await Course.find().populate("teacher");
    return Response.json(courses);
  }
  // teacher: فقط دوره‌های خودش
  if (payload && payload.role === "teacher") {
    const courses = await Course.find({ teacher: payload.teacher }).populate("teacher");
    return Response.json(courses);
  }
  // دانش‌آموز/مهمان: همه دوره‌ها
  const courses = await Course.find().populate("teacher");
  return Response.json(courses);
}

export async function POST(req) {
  await dbConnect();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || payload.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const created = await Course.create(body);
  const populated = await Course.findById(created._id).populate("teacher");
  return Response.json(populated);
}
