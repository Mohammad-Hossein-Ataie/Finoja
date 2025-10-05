import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Application from "../../../../../models/Application";
import { getAuth, requireRole } from "../../../../../lib/auth";

export async function POST(req, context) {
  await dbConnect();

  const payload = await getAuth(req).catch(() => null);
  try { requireRole(payload, ["student"]); }
  catch (e) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.statusCode || 401 });
  }

  const { id } = await context.params;
  const studentId = String(payload.studentId || payload.sub || payload._id || "");
  if (!studentId) {
    return NextResponse.json({ error: "شناسه دانش‌آموز یافت نشد" }, { status: 400 });
  }

  const app = await Application.findOne({ job: id, student: studentId });
  if (!app) return NextResponse.json({ error: "برای این آگهی درخواستی ندارید" }, { status: 404 });
  if (app.withdrawn) return NextResponse.json({ error: "قبلاً انصراف داده‌اید" }, { status: 409 });

  app.withdrawn = true;
  await app.save();

  return NextResponse.json({ ok: true });
}
