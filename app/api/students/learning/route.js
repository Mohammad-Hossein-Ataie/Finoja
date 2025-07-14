import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();
  if (!mobile) return Response.json({ error: "Mobile required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  return Response.json({ learning: student.learning || [] });
}

export async function PUT(req) {
  await dbConnect();
  const {
    mobile,
    courseId,
    progress,
    correct,
    wrongByUnit,
    reviewQueue,
    finished,
    deltaXp = 0,
  } = await req.json();

  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  /* ─── پیدا یا ایجاد رکورد یادگیری دوره ─── */
  const idx = student.learning.findIndex((l) => l.courseId === courseId);
  if (idx === -1) {
    student.learning.push({
      courseId,
      progress: progress ?? 0,
      correct: correct ?? [],
      wrongByUnit: wrongByUnit ?? {},
      reviewQueue: reviewQueue ?? [],
      wrong:                        // ← NEW
        Object.values(wrongByUnit || {}).flat().concat(reviewQueue || []),
      finished: finished ?? false,
      xp: deltaXp,
    });
  } else {
    const L = student.learning[idx];

    if (progress !== undefined) L.progress = progress;
    if (correct !== undefined) L.correct = correct;
    if (wrongByUnit !== undefined) L.wrongByUnit = wrongByUnit;
    if (reviewQueue !== undefined) L.reviewQueue = reviewQueue;
    if (finished !== undefined) L.finished = finished;

    /* ←← سازگاری عقب: محاسبهٔ wrong[] بر اساس ساختار جدید */
    L.wrong = Object.values(L.wrongByUnit || {}).flat().concat(L.reviewQueue || []);

    /* XP */
    if (deltaXp) {
      L.xp = (L.xp || 0) + deltaXp;
      student.totalXp = (student.totalXp || 0) + deltaXp;
    }
  }

  await student.save();
  return Response.json({ success: true });
}
