import dbConnect from "../../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";
import Application from "../../../../../models/Application";
import Student from "../../../../../models/Student";
import Job from "../../../../../models/Job";

/** GET: فهرست اپلیکیشن‌های یک آگهی برای کارفرما با فیلترهای رزومه
 * Query:
 *  expMin=2
 *  gender=male|female|other
 *  city=...
 *  salary=... (exact match string)
 *  degree=... (educations.degree)
 *  field=... (educations.field)
 *  finojaCourse=courseId (تکرارپذیر)
 *  resumeUpdatedFrom=YYYY-MM-DD
 *  resumeUpdatedTo=YYYY-MM-DD
 */
export async function GET(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const job = await Job.findById(params.id);
  if (!job || String(job.company) !== String(payload.companyId)) {
    return NextResponse.json({ error: "آگهی معتبر نیست" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const expMin = Number(searchParams.get("expMin") || 0);
  const gender = searchParams.get("gender");
  const city = searchParams.get("city");
  const salary = searchParams.get("salary");
  const degree = searchParams.get("degree");
  const field = searchParams.get("field");
  const finojaCourses = searchParams.getAll("finojaCourse");
  const rFrom = searchParams.get("resumeUpdatedFrom");
  const rTo = searchParams.get("resumeUpdatedTo");

  const apps = await Application.find({ job: job._id, withdrawn: { $ne: true } })
    .populate({ path: "student", model: Student })
    .lean();

  // فیلتر سمت سرور ساده روی student.resumeForm
  const filtered = apps.filter((a) => {
    const s = a.student;
    if (!s) return false;

    const basic = s.resumeForm?.basic || {};
    const educs = s.resumeForm?.educations || [];
    const jobs = s.resumeForm?.jobs || [];

    if (gender && basic.gender !== gender) return false;
    if (city && basic.city !== city) return false;
    if (salary && basic.salaryRange !== salary) return false;
    if (degree && !educs.some((e) => e.degree === degree)) return false;
    if (field && !educs.some((e) => e.field === field)) return false;

    if (finojaCourses.length > 0) {
      // اگر یادگیرنده حداقل یکی از دوره‌های انتخابی را در learning داشته باشد
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

  // مخفی‌کردن تماس تا وقتی کارفرما نخرد
  const list = filtered.map((a) => {
    const s = a.student;
    const maskedPhone = s.resumeForm?.basic?.phone ? s.resumeForm.basic.phone.replace(/\d(?=\d{4})/g, "•") : "";
    const maskedEmail = s.resumeForm?.basic?.email ? s.resumeForm.basic.email.replace(/^[^@]+/, (m)=>"•".repeat(Math.max(1,m.length-2))) : "";
    return {
      applicationId: a._id,
      status: a.status,
      student: {
        _id: s._id,
        name: s.resumeForm?.basic?.name || s.name,
        family: s.resumeForm?.basic?.family || s.family,
        city: s.resumeForm?.basic?.city || "",
        gender: s.resumeForm?.basic?.gender || "",
        updatedAt: s.resumeForm?.updatedAt || s.updatedAt,
        maskedPhone,
        maskedEmail,
        // مهارت‌ها/تحصیلات برای نمایش
        educations: s.resumeForm?.educations || [],
        softwareSkills: s.resumeForm?.softwareSkills || [],
        extraSkills: s.resumeForm?.extraSkills || [],
      },
    };
  });

  return NextResponse.json({ applications: list });
}
