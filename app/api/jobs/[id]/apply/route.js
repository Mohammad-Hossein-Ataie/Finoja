// app/api/jobs/[id]/apply/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuth, requireRole } from "../../../../../lib/auth";
import Job from "../../../../../models/Job";
import Student from "../../../../../models/Student";
import Application from "../../../../../models/Application";

function hasBuilderResume(rf) {
  if (!rf || typeof rf !== "object") return false;
  const progressed = typeof rf.progress === "number" ? rf.progress >= 50 : false;
  const minimal =
    !!rf?.basic?.name &&
    !!rf?.basic?.family &&
    (!!rf?.basic?.phone || !!rf?.basic?.email);
  return progressed || minimal;
}

export async function POST(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try {
    requireRole(payload, ["student"]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const jobId = params?.id;
  if (!jobId) return NextResponse.json({ error: "شناسه آگهی نامعتبر است" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const resumeChoice = body?.resumeChoice; // "file" | "builder" | undefined

  const job = await Job.findById(jobId).populate("company");
  if (!job || !job.active) {
    return NextResponse.json({ error: "آگهی یافت نشد یا غیرفعال است" }, { status: 404 });
  }

  const student = await Student.findById(payload.sub);
  if (!student) {
    return NextResponse.json({ error: "دانش‌آموز یافت نشد" }, { status: 404 });
  }

  // آیا قبلاً اپلای کرده؟
  const existing = await Application.findOne({ job: job._id, student: student._id });
  if (existing) {
    // ✅ قفل دائمی بعد از انصراف: اجازه اپلای مجدد نمی‌دهیم
    if (existing.withdrawn) {
      return NextResponse.json(
        { error: "شما برای این موقعیت انصراف داده‌اید و دیگر امکان ارسال درخواست ندارید.", errorCode: "WITHDRAWN_LOCKED" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "قبلاً درخواست داده‌اید." }, { status: 409 });
  }

  // وضعیت رزومه‌ها
  const hasFile = !!student.resumeKey;
  const hasBuilder = hasBuilderResume(student.resumeForm);

  // اگر هیچ رزومه‌ای ندارد
  if (!hasFile && !hasBuilder) {
    return NextResponse.json(
      {
        error: "برای ارسال درخواست، باید ابتدا یک رزومه بسازید یا فایل رزومه آپلود کنید.",
        errorCode: "NO_RESUME",
      },
      { status: 400 }
    );
  }

  // اگر هر دو دارد و انتخابی نیامده → از کلاینت بخواه انتخاب کند
  if (!resumeChoice && hasFile && hasBuilder) {
    return NextResponse.json(
      {
        error: "لطفاً نوع رزومه‌ را برای این درخواست انتخاب کنید.",
        errorCode: "CHOOSE_RESUME",
        options: { hasFile, hasBuilder },
      },
      { status: 409 }
    );
  }

  // تعیین نهایی
  let finalChoice = resumeChoice;
  if (!finalChoice) {
    finalChoice = hasFile ? "file" : "builder";
  }

  // اعتبارسنجی انتخاب
  if (finalChoice === "file" && !hasFile) {
    return NextResponse.json(
      { error: "رزومه فایل در پروفایل شما موجود نیست.", errorCode: "NO_FILE" },
      { status: 400 }
    );
  }
  if (finalChoice === "builder" && !hasBuilder) {
    return NextResponse.json(
      { error: "رزومه‌ساز شما کامل نیست یا موجود نیست.", errorCode: "NO_BUILDER" },
      { status: 400 }
    );
  }

  // ساخت رکورد درخواست + اسنپ‌شات رزومه
  const appDoc = new Application({
    job: job._id,
    company: job.company?._id,
    student: student._id,
    status: "under_review",
    statusHistory: [{ status: "under_review", at: new Date() }],
    withdrawn: false,
    resumeKind: finalChoice,
  });

  if (finalChoice === "file") {
    appDoc.resumeFile = {
      key: student.resumeKey,
      name: student.resumeName,
      size: student.resumeSize,
      type: student.resumeType,
      updatedAt: student.resumeUpdatedAt,
    };
  } else if (finalChoice === "builder") {
    // توجه: اسنپ‌شات سبک (همان رزومه فرم فعلی)
    appDoc.resumeFormSnapshot = student.resumeForm ? JSON.parse(JSON.stringify(student.resumeForm)) : {};
  }

  await appDoc.save();

  return NextResponse.json({
    success: true,
    reApplied: false,
    applicationId: appDoc._id.toString(),
  });
}
