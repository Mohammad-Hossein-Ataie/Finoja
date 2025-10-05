// app/api/jobs/[id]/withdraw/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuth, requireRole } from "../../../../../lib/auth";
import Application from "../../../../../models/Application";
import Job from "../../../../../models/Job";

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

  const job = await Job.findById(jobId);
  if (!job) return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });

  const app = await Application.findOne({ job: job._id, student: payload.sub });
  if (!app) return NextResponse.json({ error: "درخواستی برای انصراف یافت نشد" }, { status: 404 });

  if (app.withdrawn) {
    return NextResponse.json({ error: "پیش‌تر انصراف داده‌اید.", errorCode: "ALREADY_WITHDRAWN" }, { status: 409 });
  }

  app.withdrawn = true;
  // ترجیحاً وضعیت را هم به «rejected» تغییر ندهیم تا لاگ داخلی بماند؛
  // فقط تاریخچه را ثبت می‌کنیم:
  app.statusHistory.push({ status: "rejected", at: new Date() });
  await app.save();

  return NextResponse.json({ success: true });
}
