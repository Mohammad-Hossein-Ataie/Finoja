import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Application from "../../../../../models/Application";
import Job from "../../../../../models/Job";
import { getAuth, requireRole } from "../../../../../lib/auth";

export async function POST(req, context) {
  const body = await req.json().catch(() => ({}));
  const resumeChoice = body.resumeChoice;

  await dbConnect();

  const payload = await getAuth(req).catch(() => null);
  try {
    requireRole(payload, ["student"]);
  } catch (e) {
    return NextResponse.json(
      { error: e.message || "Unauthorized" },
      { status: e.statusCode || 401 }
    );
  }

  const { id } = await context.params;
  const studentId = String(payload.studentId || payload.sub || payload._id || "");
  if (!studentId) {
    return NextResponse.json({ error: "شناسه دانش‌آموز یافت نشد" }, { status: 400 });
  }

  // آیا آگهی معتبر است؟
  const job = await Job.findById(id);
  if (!job) {
    return NextResponse.json({ error: "آگهی معتبر نیست" }, { status: 404 });
  }

  // آیا قبلاً اپلای کرده؟
  const existing = await Application.findOne({ job: id, student: studentId });
  if (existing) {
    if (existing.withdrawn) {
      return NextResponse.json(
        { error: "برای این آگهی انصراف داده‌اید و امکان درخواست دوباره نیست." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "قبلاً برای این آگهی درخواست داده‌اید" },
      { status: 409 }
    );
  }

  // بررسی انتخاب رزومه و داده‌های دانش‌آموز
  const Student = (await import("../../../../../models/Student")).default;
  const student = await Student.findById(studentId).lean();
  if (!resumeChoice || !["uploaded", "builder"].includes(resumeChoice)) {
    return NextResponse.json({ error: "انتخاب رزومه نامعتبر است." }, { status: 400 });
  }
  if (resumeChoice === "uploaded" && !student?.resumeKey) {
    return NextResponse.json(
      { error: "ابتدا فایل رزومه خود را در پروفایل یا صفحه رزومه بارگذاری کنید." },
      { status: 400 }
    );
  }

  const app = await Application.create({
    job: id,
    company: job.company,
    student: studentId,
    status: "under_review",
    statusHistory: [{ status: "under_review" }],
    withdrawn: false,
    resumeChoice,
    resumeKey: resumeChoice === "uploaded" ? student?.resumeKey : undefined,
  });

  return NextResponse.json({ ok: true, applicationId: String(app._id) });
}
