import dbConnect from "../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";
import Application from "../../../../models/Application";
import Job from "../../../../models/Job";

/** GET: فهرست اپلیکیشن‌های شرکت با فیلترها */
export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const { searchParams } = new URL(req.url);
  const jobIds = searchParams.getAll("jobId");
  const status = searchParams.get("status");
  const withdrawn = searchParams.get("withdrawn");
  const q = searchParams.get("q");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const companyJobs = await Job.find({ company: payload.companyId }, { _id: 1, title: 1 }).lean();
  const companyJobIds = new Set(companyJobs.map(j => String(j._id)));

  const filter = {};
  if (jobIds && jobIds.length) {
    filter.job = { $in: jobIds.filter(id => companyJobIds.has(String(id))) };
  } else {
    filter.job = { $in: Array.from(companyJobIds) };
  }
  if (status) filter.status = status;
  if (withdrawn === "true") filter.withdrawn = true;
  if (withdrawn === "false") filter.withdrawn = { $ne: true };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const apps = await Application.find(filter).populate("student job").sort({ createdAt: -1 }).lean();

  const list = apps.map(a => ({
    id: a._id,
    status: a.status,
    withdrawn: !!a.withdrawn,
    withdrawnAt: a.withdrawnAt || null,
    statusHistory: (a.statusHistory || []).map(x => ({ status: x.status, at: x.at })),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    jobId: a.job?._id,
    jobTitle: a.job?.title || "",
    studentId: a.student?._id,
  }));

  return NextResponse.json({ applications: list });
}
