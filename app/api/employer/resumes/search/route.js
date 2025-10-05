import dbConnect from "../../../../../lib/dbConnect";
import Student from "../../../../../models/Student";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";

/** GET Query:
 *  gender=...
 *  city=...
 *  salary=...
 *  degree=...
 *  field=...
 *  finojaCourse=courseId (multi)
 *  resumeUpdatedFrom / resumeUpdatedTo
 *  expMin=number
 */
export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender");
  const city = searchParams.get("city");
  const salary = searchParams.get("salary");
  const degree = searchParams.get("degree");
  const field = searchParams.get("field");
  const finojaCourses = searchParams.getAll("finojaCourse");
  const rFrom = searchParams.get("resumeUpdatedFrom");
  const rTo = searchParams.get("resumeUpdatedTo");
  const expMin = Number(searchParams.get("expMin") || 0);

  // فیلتر ساده
  let students = await Student.find({}).lean();

  students = students.filter((s) => {
    const basic = s.resumeForm?.basic || {};
    const educs = s.resumeForm?.educations || [];
    const jobs = s.resumeForm?.jobs || [];

    if (gender && basic.gender !== gender) return false;
    if (city && basic.city !== city) return false;
    if (salary && basic.salaryRange !== salary) return false;
    if (degree && !educs.some((e) => e.degree === degree)) return false;
    if (field && !educs.some((e) => e.field === field)) return false;

    if (finojaCourses.length > 0) {
      const hasCourse = (s.learning || []).some((l) => finojaCourses.includes(String(l.courseId)));
      if (!hasCourse) return false;
    }

    if (expMin > 0) {
      let years = 0;
      for (const j of jobs) {
        if (j.startYear) {
          const endYear = j.current ? new Date().getFullYear() : (j.endYear || j.startYear);
          years += Math.max(0, endYear - j.startYear);
        }
      }
      if (years < expMin) return false;
    }

    if (rFrom || rTo) {
      const up = s.resumeForm?.updatedAt ? new Date(s.resumeForm.updatedAt) : null;
      if (!up) return false;
      if (rFrom && up < new Date(rFrom)) return false;
      if (rTo && up > new Date(rTo)) return false;
    }

    return true;
  });

  // بازگشت بدون اطلاعات تماس
  const list = students.map((s) => ({
    _id: s._id,
    name: s.resumeForm?.basic?.name || s.name,
    family: s.resumeForm?.basic?.family || s.family,
    city: s.resumeForm?.basic?.city || "",
    gender: s.resumeForm?.basic?.gender || "",
    updatedAt: s.resumeForm?.updatedAt || s.updatedAt,
    educations: s.resumeForm?.educations || [],
    softwareSkills: s.resumeForm?.softwareSkills || [],
    extraSkills: s.resumeForm?.extraSkills || [],
    maskedPhone: (s.resumeForm?.basic?.phone || s.mobile || "").replace(/\d(?=\d{4})/g, "•"),
    maskedEmail: (s.resumeForm?.basic?.email || s.email || "").replace(/^[^@]+/, (m)=>"•".repeat(Math.max(1,m.length-2))),
  }));

  return NextResponse.json({ results: list });
}
