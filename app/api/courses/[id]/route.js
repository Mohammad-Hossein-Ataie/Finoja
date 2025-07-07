import dbConnect from "../../../../lib/dbConnect";
import Course from "../../../../models/Course";
import "../../../../models/Teacher"; // حتماً اضافه باشه برای populate
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

export async function GET(_req, context) {
  const { params } = await context;
  await dbConnect();

  let payload = null;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) payload = await verifyJwt(token);
  } catch (e) {}

  const course = await Course.findById(params.id).populate("teacher");
  if (!course) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  // خواندن برای همه آزاد است
  return Response.json(course);
}

export async function PUT(req, context) {
  const { params } = await context;
  await dbConnect();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await Course.findById(params.id);
  if (!course) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (
    payload.role === "admin" ||
    (payload.role === "teacher" && course.teacher && course.teacher.equals(payload.teacher))
  ) {
    const body = await req.json();
    const updated = await Course.findByIdAndUpdate(params.id, body, { new: true }).populate("teacher");
    return Response.json(updated);
  }
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function DELETE(_req, context) {
  const { params } = await context;
  await dbConnect();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await Course.findById(params.id);
  if (!course) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (
    payload.role === "admin" ||
    (payload.role === "teacher" && course.teacher && course.teacher.equals(payload.teacher))
  ) {
    await Course.findByIdAndDelete(params.id);
    return Response.json({ deleted: true });
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}
