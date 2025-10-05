import dbConnect from "../../../lib/dbConnect";
import Job from "../../../models/Job";
import Company from "../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../lib/auth";

/** GET: لیست آگهی‌ها برای کارجو با فیلترها */
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter = { active: true };
  if (q) filter.$text = { $search: q };
  if (city) filter["location.city"] = city;
  if (country) filter["location.country"] = country;
  if (from || to) {
    filter.postedAt = {};
    if (from) filter.postedAt.$gte = new Date(from);
    if (to) filter.postedAt.$lte = new Date(to);
  }

  const jobs = await Job.find(filter).populate("company").sort({ postedAt: -1 }).lean();

  const items = jobs.map(j => ({
    _id: j._id,
    title: j.title,
    description: j.description,
    salaryRange: j.salaryRange,
    minExpYears: j.minExpYears,
    gender: j.gender,
    education: j.education,
    fieldOfStudy: j.fieldOfStudy,
    requiredSkills: j.requiredSkills || [],
    finojaCourseIds: j.finojaCourseIds || [],
    location: j.location || {},
    active: j.active,
    postedAt: j.postedAt,
    company: { _id: j.company?._id, name: j.company?.name || "" },
  }));

  return NextResponse.json({ jobs: items });
}

/** POST: ایجاد آگهی توسط کارفرما - فقط در صورت KYC تایید شده */
export async function POST(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: "ابتدا به عنوان کارفرما وارد شوید." }, { status: 401 });
  }

  // بررسی وضعیت KYC شرکت
  const company = await Company.findById(payload.companyId);
  if (!company) return NextResponse.json({ error: "شرکت یافت نشد." }, { status: 404 });
  if (company.kyc?.status !== "approved") {
    return NextResponse.json({ error: "حساب شرکت هنوز احراز هویت نشده است. پس از تایید KYC می‌توانید آگهی ثبت کنید." }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, description, salaryRange, minExpYears,
    gender, education, fieldOfStudy,
    requiredSkills, finojaCourseIds,
    location,
  } = body || {};

  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });
  }

  const job = await Job.create({
    company: payload.companyId,
    title: String(title).trim(),
    description: description || "",
    salaryRange: salaryRange || "",
    minExpYears: Number(minExpYears || 0),
    gender: gender || "any",
    education: education || "",
    fieldOfStudy: fieldOfStudy || "",
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    finojaCourseIds: Array.isArray(finojaCourseIds) ? finojaCourseIds : [],
    location: { country: location?.country || "", city: location?.city || "" },
    active: true,
    postedAt: new Date(),
  });

  return NextResponse.json({ success: true, job });
}
