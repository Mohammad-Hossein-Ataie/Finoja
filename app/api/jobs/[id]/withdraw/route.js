import dbConnect from "../../../../../lib/dbConnect";
import Application from "../../../../../models/Application";
import Job from "../../../../../models/Job";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";

export async function POST(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["student"]); } catch (e) {
    return NextResponse.json({ error: "برای انصراف باید دانش‌آموز باشید." }, { status: 401 });
  }

  const job = await Job.findById(params.id);
  if (!job) return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });

  const app = await Application.findOne({ job: job._id, student: payload.sub });
  if (!app) return NextResponse.json({ error: "درخواستی برای این آگهی ثبت نکرده‌اید." }, { status: 404 });

  if (app.withdrawn) return NextResponse.json({ success: true }); // قبلاً انصراف داده
  app.withdrawn = true;
  await app.save();

  return NextResponse.json({ success: true });
}
