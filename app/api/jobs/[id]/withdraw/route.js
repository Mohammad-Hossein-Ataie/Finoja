// app/api/jobs/[id]/withdraw/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuth, requireRole } from "../../../../../lib/auth";
import Application from "../../../../../models/Application";

export async function POST(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["student"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const jobId = params.id;
  const app = await Application.findOne({ job: jobId, student: payload.sub });
  if (!app) return NextResponse.json({ error: "درخواستی برای انصراف یافت نشد" }, { status: 404 });
  if (app.withdrawn) {
    return NextResponse.json({ error: "پیش‌تر انصراف داده‌اید.", errorCode: "ALREADY_WITHDRAWN" }, { status: 409 });
  }

  app.withdrawn = true;
  app.withdrawnAt = new Date();
  app.statusHistory = app.statusHistory || [];
  app.statusHistory.push({ status: "withdrawn", at: app.withdrawnAt });
  await app.save();

  return NextResponse.json({ success: true, withdrawnAt: app.withdrawnAt });
}
