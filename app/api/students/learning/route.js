import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

/* ────────── دریافت وضعیت یادگیری دانش‌آموز ────────── */
export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();

  if (!mobile)
    return Response.json({ error: "Mobile required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student)
    return Response.json({ error: "Student not found" }, { status: 404 });

  // همان ساختار: لیست کامل learning را برمی‌گردانیم
  return Response.json({ learning: student.learning || [] });
}

/* ────────── ذخیره / به‌روزرسانی یادگیری ────────── */
export async function PUT(req) {
  await dbConnect();

  const body = await req.json();
  const {
    mobile,
    courseId,

    // قدیمی‌ها
    progress,
    correct,
    wrongByUnit,
    reviewQueue,
    finished,

    // جدیدها (شناسه‌محور)
    doneIds,
    correctIds,
    wrongByUnitIds,
    reviewQueueIds,
    carryOverIds,
    cursorStepId,

    // XP
    deltaXp = 0,
  } = body || {};

  if (!mobile || !courseId)
    return Response.json({ error: "mobile & courseId required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student)
    return Response.json({ error: "Student not found" }, { status: 404 });

  // یافتن رکورد دوره
  const idx = student.learning.findIndex((l) => l.courseId === courseId);

  // اگر وجود ندارد → بساز
  if (idx === -1) {
    const newRec = {
      courseId,
      // قدیمی
      progress      : progress      ?? 0,
      correct       : correct       ?? [],
      wrongByUnit   : wrongByUnit   ?? {},
      reviewQueue   : reviewQueue   ?? [],
      finished      : !!finished,
      xp            : deltaXp || 0,

      // جدید
      doneIds         : doneIds         ?? [],
      correctIds      : correctIds      ?? [],
      wrongByUnitIds  : wrongByUnitIds  ?? {},
      reviewQueueIds  : reviewQueueIds  ?? [],
      carryOverIds    : carryOverIds    ?? [],
      cursorStepId    : cursorStepId    ?? undefined,
    };

    // wrong (قدیمی) را اگر داده شد، جمع بزن
    newRec.wrong = Object.values(newRec.wrongByUnit || {}).flat()
      .concat(newRec.reviewQueue || []);

    student.learning.push(newRec);
    if (deltaXp) student.totalXp = (student.totalXp || 0) + deltaXp;

    await student.save();
    return Response.json({ success: true });
  }

  // اگر رکورد قبلی وجود داشت → به‌روزرسانی
  const L = student.learning[idx];

  // ─── قدیمی‌ها
  if (progress    !== undefined) L.progress    = progress;
  if (correct     !== undefined) L.correct     = Array.isArray(correct) ? correct : L.correct;
  if (wrongByUnit !== undefined) L.wrongByUnit = wrongByUnit || {};
  if (reviewQueue !== undefined) L.reviewQueue = Array.isArray(reviewQueue) ? reviewQueue : [];
  if (finished    !== undefined) L.finished    = !!finished;

  // سازگاری قدیمی: wrong (flat) = wrongByUnit ∪ reviewQueue
  L.wrong = Object.values(L.wrongByUnit || {}).flat()
    .concat(L.reviewQueue || []);

  // ─── جدیدها
  if (Array.isArray(doneIds))        L.doneIds        = doneIds;
  if (Array.isArray(correctIds))     L.correctIds     = correctIds;
  if (wrongByUnitIds !== undefined)  L.wrongByUnitIds = wrongByUnitIds || {};
  if (Array.isArray(reviewQueueIds)) L.reviewQueueIds = reviewQueueIds;
  if (Array.isArray(carryOverIds))   L.carryOverIds   = carryOverIds;
  if (cursorStepId !== undefined)    L.cursorStepId   = cursorStepId || undefined;

  // XP
  if (typeof L.xp !== "number") L.xp = 0;
  if (deltaXp) {
    L.xp += deltaXp;
    student.totalXp = (student.totalXp || 0) + deltaXp;
  }

  await student.save();
  return Response.json({ success: true });
}
