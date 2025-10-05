import dbConnect from "../../../../../lib/dbConnect";
import Application from "../../../../../models/Application";
import Job from "../../../../../models/Job";
import Student from "../../../../../models/Student";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";
import { renderStatusEmail, sendEmail } from "../../../../../lib/email";

export async function PATCH(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const { status, reason } = await req.json(); // status ∈ ['seen','under_review','pre_approved','hired','rejected']
  const app = await Application.findById(params.id).populate(["job", "student"]);
  if (!app) return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });

  if (String(app.company) !== String(payload.companyId)) {
    return NextResponse.json({ error: "اجازه تغییر وضعیت ندارید." }, { status: 403 });
  }

  app.status = status;
  app.statusHistory.push({ status, at: new Date() });
  await app.save();

  // ایمیل به دانش‌آموز
  const student = app.student;
  const email = student?.resumeForm?.basic?.email || student?.email;
  if (email) {
    const { subject, html } = renderStatusEmail({
      name: student?.resumeForm?.basic?.name || student?.name || "",
      jobTitle: app.job?.title || "",
      companyName: (await Job.findById(app.job?._id).populate("company"))?.company?.name || "",
      status,
      reason,
    });
    try { await sendEmail(email, subject, html); } catch (e) { /* ایمیل اختیاری است */ }
  }

  return NextResponse.json({ success: true });
}
