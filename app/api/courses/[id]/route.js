import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";

export async function GET(_req, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await Course.findById(params.id).populate("teacher");
  if (!course) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (
    payload.role === "admin" ||
    (payload.role === "teacher" && course.teacher && course.teacher.equals(payload.teacher))
  ) {
    return Response.json(course);
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function PUT(request, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const course = await Course.findById(params.id);

  if (
    payload.role === "admin" ||
    (payload.role === "teacher" && course.teacher && course.teacher.equals(payload.teacher))
  ) {
    const updated = await Course.findByIdAndUpdate(params.id, body, { new: true }).populate("teacher");
    return Response.json(updated);
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function DELETE(_req, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await Course.findById(params.id);

  if (
    payload.role === "admin" ||
    (payload.role === "teacher" && course.teacher && course.teacher.equals(payload.teacher))
  ) {
    await Course.findByIdAndDelete(params.id);
    return Response.json({ deleted: true });
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}
