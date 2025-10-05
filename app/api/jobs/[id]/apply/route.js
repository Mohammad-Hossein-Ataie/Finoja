import dbConnect from "../../../../../lib/dbConnect";
import Job from "../../../../../models/Job";
import Application from "../../../../../models/Application";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";

export async function POST(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["student"]); } catch (e) {
    return NextResponse.json({ error: "برای اپلای باید وارد حساب دانش‌آموز شوید." }, { status: 401 });
  }

  try {
    const job = await Job.findById(params.id);
    if (!job || !job.active) return NextResponse.json({ error: "آگهی معتبر نیست" }, { status: 404 });

    const existing = await Application.findOne({ job: job._id, student: payload.sub });
    if (existing) return NextResponse.json({ error: "قبلاً برای این موقعیت اقدام کرده‌اید." }, { status: 400 });

    const app = await Application.create({
      job: job._id,
      company: job.company,
      student: payload.sub,
      status: "under_review",
      statusHistory: [{ status: "under_review", at: new Date() }],
    });

    return NextResponse.json({ success: true, applicationId: app._id });
  } catch (err) {
    // هندل ایمن برای unique index (اپلای همزمان/دوبار کلیک)
    if (err?.code === 11000) {
      return NextResponse.json({ error: "قبلاً برای این موقعیت اقدام کرده‌اید." }, { status: 400 });
    }
    return NextResponse.json({ error: "خطای غیرمنتظره در ثبت درخواست." }, { status: 500 });
  }
}
