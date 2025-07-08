import dbConnect from '../../../../lib/dbConnect';
import Student from '../../../../models/Student';

export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();
  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });
  return Response.json({ learning: student.learning || [] });
}

export async function PUT(req) {
  await dbConnect();
  const { mobile, courseId, progress, correct, wrong, finished, wrongByUnit } = await req.json();
  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  const idx = student.learning.findIndex(l => l.courseId === courseId);
  if (idx !== -1) {
    // فقط مقدارهایی که اومدن رو آپدیت کن و فیلدهای قبلی رو نگه دار (در صورت نبود مقدار)
    student.learning[idx] = {
      ...student.learning[idx],
      courseId,
      progress: progress ?? student.learning[idx].progress ?? 0,
      correct: correct ?? student.learning[idx].correct ?? [],
      wrong: wrong ?? student.learning[idx].wrong ?? [],
      finished: finished ?? student.learning[idx].finished ?? false,
      wrongByUnit: wrongByUnit ?? student.learning[idx].wrongByUnit ?? {},
    };
  } else {
    // افزودن جدید
    student.learning.push({
      courseId,
      progress: progress ?? 0,
      correct: correct ?? [],
      wrong: wrong ?? [],
      finished: finished ?? false,
      wrongByUnit: wrongByUnit ?? {},
    });
  }
  await student.save();
  return Response.json({ success: true });
}
