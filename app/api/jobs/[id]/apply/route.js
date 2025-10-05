import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Application from "../../../../../models/Application";
import Job from "../../../../../models/Job";
import { getAuth, requireRole } from "../../../../../lib/auth";

export async function POST(req, context) {
  await dbConnect();

  const payload = await getAuth(req).catch(() => null);
  try { requireRole(payload, ["student"]); }
  catch (e) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.statusCode || 401 });
  }

  const { id } = await context.params; // ← important
  const studentId = String(payload.studentId || payload.sub || payload._id || "");
  if (!studentId) {
    return NextResponse.json({ error: "شناسه دانش‌آموز یافت نشد" }, { status: 400 });
  }

  const job = await Job.findById(id).lean();
  if (!job || !job.active) {
    return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });
  }

  let app = await Application.findOne({ job: id, student: studentId });

  if (app) {
    if (app.withdrawn) {
      app.withdrawn = false;
      app.status = "under_review";
      app.statusHistory.push({ status: "under_review", at: new Date() });
      await app.save();
      return NextResponse.json({ ok: true, reApplied: true });
    }
    return NextResponse.json({ error: "قبلاً برای این آگهی درخواست داده‌اید" }, { status: 409 });
  }

  app = await Application.create({
    job: id,
    company: job.company,
    student: studentId,
    status: "under_review",
    statusHistory: [{ status: "under_review" }],
    withdrawn: false,
  });

  return NextResponse.json({ ok: true, applicationId: String(app._id) });
}
