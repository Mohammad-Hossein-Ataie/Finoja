// app/api/students/applications/route.js
import dbConnect from "../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";
import Application from "../../../../models/Application";

const fa = {
  seen: "دیده‌شده",
  under_review: "در حال بررسی",
  pre_approved: "پیش‌تایید",
  hired: "استخدام",
  rejected: "رد شده",
  withdrawn: "انصراف‌داده",
};

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["student"]); } catch (e) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const apps = await Application.find({ student: payload.sub })
    .sort({ createdAt: -1 })
    .populate({ path: "job", populate: { path: "company" } })
    .lean();

  const data = apps.map(a => ({
    id: a._id,
    status: a.status,
    statusFa: fa[a.status] || a.status,
    withdrawn: !!a.withdrawn,
    withdrawnAt: a.withdrawnAt || null,
    jobId: a.job?._id,
    jobTitle: a.job?.title || "",
    companyId: a.job?.company?._id,
    companyName: a.job?.company?.name || "",
    resumeKind: a.resumeKind || "file",
    resumeFile: a.resumeFile || null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    statusHistory: (a.statusHistory || []).map(s => ({ status: s.status, at: s.at, statusFa: fa[s.status] || s.status })),
  }));

  return NextResponse.json({ applications: data });
}
