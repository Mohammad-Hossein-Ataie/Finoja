import dbConnect from "../../../../lib/dbConnect";
import Course from "../../../../models/Course";
import "../../../../models/Teacher";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

// GET /api/courses/[id]
export async function GET(_req, context) {
  const { params } = await context;            // ✅ مهم
  await dbConnect();

  let payload = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) payload = await verifyJwt(token);
  } catch {}

  const course = await Course.findById(params.id).populate("teacher");
  if (!course) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(course);
}

// PUT /api/courses/[id]
export async function PUT(req, context) {
  const { params } = await context;            // ✅ مهم
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const course = await Course.findById(params.id);
  if (!course) return Response.json({ error: "Not found" }, { status: 404 });

  // اجازهٔ ویرایش
  const canEdit =
    payload.role === "admin" ||
    (payload.role === "teacher" &&
      course.teacher &&
      course.teacher.equals(payload.teacher));

  if (!canEdit) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  // نکته: اگر مایل باشی جلوی تغییر فیلدهای حساس را بگیری، این‌جا whitelisting کن
  const updated = await Course.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  }).populate("teacher");

  return Response.json(updated);
}

// DELETE /api/courses/[id]
export async function DELETE(_req, context) {
  const { params } = await context;            // ✅ مهم
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const course = await Course.findById(params.id);
  if (!course) return Response.json({ error: "Not found" }, { status: 404 });

  const canDelete =
    payload.role === "admin" ||
    (payload.role === "teacher" &&
      course.teacher &&
      course.teacher.equals(payload.teacher));

  if (!canDelete) return Response.json({ error: "Forbidden" }, { status: 403 });

  await Course.findByIdAndDelete(params.id);
  return Response.json({ deleted: true });
}
