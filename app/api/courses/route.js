import { cookies } from "next/headers";
import { verifyJwt } from "../../../lib/jwt";
import dbConnect from "../../../lib/dbConnect";
import Course from "../../../models/Course";
import "../../../models/Teacher"; // برای populate

export async function GET(req) {
  await dbConnect();

  // تعیین نقش کاربر از روی کوکی (اختیاری)
  let payload = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) payload = await verifyJwt(token);
  } catch {}

  const url = req?.url ? new URL(req.url) : null;
  const wantSummary = url?.searchParams?.get("summary") === "1";

  // admin: همه دوره‌ها (پیش‌فرض کامل؛ مگر اینکه summary=1 بخواهد)
  if (payload && payload.role === "admin") {
    if (wantSummary) {
      const raw = await Course.find()
        .select("title description teacher sections.units.steps")
        .populate("teacher", "name email phone expertise")
        .lean();

      const compact = raw.map((c) => ({
        _id: c._id,
        title: c.title,
        description: c.description,
        teacher: c.teacher,
        stats: {
          totalSteps:
            c.sections?.reduce(
              (acc, s) =>
                acc +
                (s.units?.reduce(
                  (uAcc, u) => uAcc + (u.steps ? u.steps.length : 0),
                  0
                ) || 0),
              0
            ) || 0,
        },
      }));
      return Response.json(compact);
    }

    const courses = await Course.find().populate("teacher");
    return Response.json(courses);
  }

  // teacher: فقط دوره‌های خودش (مثل بالا)
  if (payload && payload.role === "teacher") {
    if (wantSummary) {
      const raw = await Course.find({ teacher: payload.teacher })
        .select("title description teacher sections.units.steps")
        .populate("teacher", "name email phone expertise")
        .lean();

      const compact = raw.map((c) => ({
        _id: c._id,
        title: c.title,
        description: c.description,
        teacher: c.teacher,
        stats: {
          totalSteps:
            c.sections?.reduce(
              (acc, s) =>
                acc +
                (s.units?.reduce(
                  (uAcc, u) => uAcc + (u.steps ? u.steps.length : 0),
                  0
                ) || 0),
              0
            ) || 0,
        },
      }));
      return Response.json(compact);
    }

    const courses = await Course.find({ teacher: payload.teacher }).populate("teacher");
    return Response.json(courses);
  }

  // یادگیرنده/مهمان
  if (wantSummary) {
    const raw = await Course.find()
      .select("title description teacher sections.units.steps")
      .populate("teacher", "name email phone expertise")
      .lean();

    const compact = raw.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      teacher: c.teacher,
      stats: {
        totalSteps:
          c.sections?.reduce(
            (acc, s) =>
              acc +
              (s.units?.reduce(
                (uAcc, u) => uAcc + (u.steps ? u.steps.length : 0),
                0
              ) || 0),
            0
          ) || 0,
      },
    }));
    return Response.json(compact);
  }

  // پیش‌فرض قبلی (سازگاری کامل)
  const courses = await Course.find().populate("teacher");
  return Response.json(courses);
}

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
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
