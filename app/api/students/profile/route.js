// ======================= app/api/students/profile/route.js =======================
import dbConnect from "../../../../lib/dbConnect";
import Student   from "../../../../models/Student";
import Course    from "../../../../models/Course";

/**
 *  🔹  مسیر:  /api/students/profile
 *  توضیح:   یک بار با شمارهٔ همراه فراخوانی می‌شود و پروفایل کامل دانشجو
 *           به‌همراه عنوان دوره‌ها و XP هر دوره برمی‌گردد.
 */
export async function POST(req) {
  await dbConnect();

  const { mobile } = await req.json();
  if (!mobile)
    return Response.json({ error: "Mobile required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student)
    return Response.json({ error: "Student not found" }, { status: 404 });

  /* ---------- نگاشت عنوان دوره ---------- */
  const courseIds = student.learning.map((l) => l.courseId);
  const courseDocs = await Course.find({ _id: { $in: courseIds } }).select("_id title");
  const titleMap = courseDocs.reduce((acc, c) => {
    acc[String(c._id)] = c.title;
    return acc;
  }, {});

  const learning = (student.learning || []).map((l) => ({
    courseId : l.courseId,
    title    : titleMap[l.courseId] || "دوره نامشخص",
    progress : l.progress ?? 0,
    xp       : l.xp       ?? 0,
    finished : !!l.finished,
  }));

  return Response.json({
    id         : student._id,
    name       : student.name,
    family     : student.family,
    mobile     : student.mobile,
    email      : student.email ?? null,
    onboarding : student.onboarding ?? null,
    totalXp    : student.totalXp ?? 0,
    createdAt  : student.createdAt,
    learning,
  });
}
