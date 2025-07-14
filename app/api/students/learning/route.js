import dbConnect from "../../../../lib/dbConnect";
import Student   from "../../../../models/Student";

/* ────────── دریافت وضعیت یادگیری دانش‌آموز ────────── */
export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();

  if (!mobile)
    return Response.json({ error: "Mobile required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student)
    return Response.json({ error: "Student not found" }, { status: 404 });

  return Response.json({ learning: student.learning || [] });
}

/* ────────── ذخیره / به‌روزرسانی یادگیری ────────── */
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
    deltaXp = 0,            // پیش‌فرض صفر، حتی برای توضیح
  } = await req.json();

  const student = await Student.findOne({ mobile });
  if (!student)
    return Response.json({ error: "Student not found" }, { status: 404 });

  /* ───── یافتن یا ایجاد رکورد دوره ───── */
  const idx = student.learning.findIndex((l) => l.courseId === courseId);

  /* ---------- اگر رکورد وجود نداشته باشد ---------- */
  if (idx === -1) {
    student.learning.push({
      courseId,
      progress      : progress      ?? 0,
      correct       : correct       ?? [],
      wrongByUnit   : wrongByUnit   ?? {},
      reviewQueue   : reviewQueue   ?? [],
      wrong         :
        Object.values(wrongByUnit || {}).flat().concat(reviewQueue || []),
      finished      : finished      ?? false,
      xp            : deltaXp,                // فیلد حتماً ساخته می‌شود
    });

    if (deltaXp) {                            // مجموع کل
      student.totalXp = (student.totalXp || 0) + deltaXp;
    }
  }

  /* ---------- اگر رکورد از قبل وجود داشته باشد ---------- */
  else {
    const L = student.learning[idx];

    /* فیلدهای ساده */
    if (progress    !== undefined) L.progress    = progress;
    if (correct     !== undefined) L.correct     = correct;
    if (wrongByUnit !== undefined) L.wrongByUnit = wrongByUnit;
    if (reviewQueue !== undefined) L.reviewQueue = reviewQueue;
    if (finished    !== undefined) L.finished    = finished;

    /* محاسبهٔ آرایهٔ جمعی wrong[] برای سازگاری عقب */
    L.wrong = Object.values(L.wrongByUnit || {}).flat()
                .concat(L.reviewQueue || []);

    /* --------- XP --------- */
    if (L.xp === undefined) L.xp = 0;          // اطمینان از وجود فیلد

    L.xp += deltaXp;                           // جمع بزن (حذف شرط قبلی)

    if (deltaXp) {                             // مجموع کل فقط وقتی >۰ است
      student.totalXp = (student.totalXp || 0) + deltaXp;
    }
  }

  await student.save();
  return Response.json({ success: true });
}
