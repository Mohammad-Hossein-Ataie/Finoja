// app/api/students/applications/route.js
import dbConnect from "../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";
import Application from "../../../../models/Application";
import Job from "../../../../models/Job";

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["student"]); } catch (e) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const apps = await Application.find({ student: payload.sub })
    .sort({ createdAt: -1 })
    .populate({ path: "job", model: Job, populate: { path: "company", select: "name" } })
    .lean();

  const fa = {
    seen: "مشاهده شده",
    under_review: "در حال بررسی",
    pre_approved: "تایید اولیه",
    hired: "جذب شده",
    rejected: "رد شده",
  };

  const data = apps.map(a => ({
    id: a._id,
    status: a.status,
    statusFa: fa[a.status] || a.status,
    withdrawn: !!a.withdrawn,
    jobId: a.job?._id,
    jobTitle: a.job?.title || "",
    companyName: a.job?.company?.name || "",
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  return NextResponse.json({ applications: data });
}
