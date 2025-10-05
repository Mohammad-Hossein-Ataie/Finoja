import dbConnect from "../../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";
import Application from "../../../../../models/Application";
import Student from "../../../../../models/Student";
import Job from "../../../../../models/Job";

/** GET: فهرست اپلیکیشن‌های یک آگهی برای کارفرما با فیلترها */
export async function GET(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const jobId = params.id;
  const { searchParams } = new URL(req.url);

  const filter = { job: jobId };
  const status = searchParams.get("status");
  const withdrawn = searchParams.get("withdrawn");
  const q = searchParams.get("q");
  const city = searchParams.get("city");
  const minExpYears = Number(searchParams.get("minExpYears") || 0);
  const gender = searchParams.get("gender");
  const degree = searchParams.get("degree");
  const field = searchParams.get("field");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (status) filter.status = status;
  if (withdrawn === "true") filter.withdrawn = true;
  if (withdrawn === "false") filter.withdrawn = { $ne: true };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const apps = await Application.find(filter).populate("student").sort({ createdAt: -1 }).lean();

  // فیلترهای مبتنی بر رزومه
  const fits = (a) => {
    const s = a.student || {};
    const basic = s.resumeForm?.basic || {};
    const educations = s.resumeForm?.educations || [];
    const jobs = s.resumeForm?.jobs || [];
    // تخمین سابقه
    const expYears = jobs.reduce((acc, j) => {
      const sy = Number(j.startYear || 0);
      const ey = Number(j.endYear || j.startYear || 0);
      if (!sy) return acc;
      return acc + Math.max(0, (ey || sy) - sy);
    }, 0);

    if (city && (basic.city || "") !== city) return false;
    if (gender && gender !== "any" && (basic.gender || "any") !== gender) return false;
    if (minExpYears && expYears < minExpYears) return false;
    if (degree && !educations.some(e => (e.degree || "") === degree)) return false;
    if (field && !educations.some(e => (e.field || "") === field)) return false;
    if (q) {
      const hay = [
        basic.name, basic.family, basic.email, basic.phone,
        ...(s.resumeForm?.softwareSkills || []),
        ...(s.resumeForm?.extraSkills || []),
      ].join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  };

  const list = apps.filter(fits).map(a => {
    const s = a.student || {};
    const maskedPhone = (s.resumeForm?.basic?.phone || s.mobile || "").replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    const maskedEmail = (s.resumeForm?.basic?.email || s.email || "").replace(/(.).+(@.+)/, "$1***$2");
    return {
      id: a._id,
      status: a.status,
      withdrawn: !!a.withdrawn,
      withdrawnAt: a.withdrawnAt || null,
      statusHistory: (a.statusHistory || []).map(x => ({ status: x.status, at: x.at })),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      studentId: s._id,
      resumeKind: a.resumeKind || "file",
      resumeFile: a.resumeFile || null,
      student: {
        name: s.resumeForm?.basic?.name || s.name || "",
        family: s.resumeForm?.basic?.family || s.family || "",
        city: s.resumeForm?.basic?.city || "",
        gender: s.resumeForm?.basic?.gender || "",
        updatedAt: s.resumeForm?.updatedAt || s.updatedAt,
        maskedPhone,
        maskedEmail,
        educations: s.resumeForm?.educations || [],
        softwareSkills: s.resumeForm?.softwareSkills || [],
        extraSkills: s.resumeForm?.extraSkills || [],
      },
    };
  });

  return NextResponse.json({ applications: list });
}
