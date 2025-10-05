import dbConnect from "../../../lib/dbConnect";
import Job from "../../../models/Job";
import Company from "../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../lib/auth";

/** GET: لیست آگهی‌ها برای کارجو با فیلترها
 *  Query:
 *   q=کلمه_کلیدی
 *   city=تهران
 *   country=ایران
 *   from=2025-09-01
 *   to=2025-09-19
 */
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const country = searchParams.get("country") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = { active: true };
  if (q) where.$text = { $search: q };
  if (city) where["location.city"] = city;
  if (country) where["location.country"] = country;
  if (from || to) {
    where.postedAt = {};
    if (from) where.postedAt.$gte = new Date(from);
    if (to) where.postedAt.$lte = new Date(to);
  }

  const jobs = await Job.find(where).sort({ postedAt: -1 }).populate("company", "name city country");
  return NextResponse.json({ jobs });
}

/** POST: ساخت آگهی توسط کارفرما (فعلاً رایگان) */
export async function POST(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const body = await req.json();
  const {
    title, description, salaryRange, minExpYears, gender, education, fieldOfStudy, requiredSkills, finojaCourseIds,
    location
  } = body;

  if (!title) return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });

  const job = await Job.create({
    company: payload.companyId,
    title, description, salaryRange, minExpYears, gender, education, fieldOfStudy,
    requiredSkills: requiredSkills || [],
    finojaCourseIds: finojaCourseIds || [],
    location: { country: location?.country || "", city: location?.city || "" },
    active: true,
    postedAt: new Date(),
  });

  return NextResponse.json({ success: true, job });
}
