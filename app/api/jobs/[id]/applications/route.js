import dbConnect from "../../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../lib/auth";
import Application from "../../../../../models/Application";
import Student from "../../../../../models/Student";
import Job from "../../../../../models/Job";

/** GET: فهرست اپلیکیشن‌های یک آگهی برای کارفرما با فیلترهای رزومه */
export async function GET(req, context) {
  await dbConnect();

  const payload = await getAuth(req);
  try {
    requireRole(payload, ["employer"]);
  } catch (e) {
    return NextResponse.json(
      { error: e.message },
      { status: e.statusCode || 403 }
    );
  }

  const { id } = context.params;
  const job = await Job.findById(id).lean();
  if (!job) {
    return NextResponse.json({ error: "آگهی معتبر نیست" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const includeWithdrawn = searchParams.get("includeWithdrawn") === "1";
  const withdrawnOnly = searchParams.get("withdrawn") === "1";

  const expMin = Number(searchParams.get("expMin") || 0);
  const gender = searchParams.get("gender");
  const city = searchParams.get("city");
  const salary = searchParams.get("salary");
  const degree = searchParams.get("degree");
  const field = searchParams.get("field");
  const finojaCourses = searchParams.getAll("finojaCourse");
  const rFrom = searchParams.get("resumeUpdatedFrom");
  const rTo = searchParams.get("resumeUpdatedTo");

  const withdrawnFilter = withdrawnOnly
    ? true
    : includeWithdrawn
    ? { $in: [true, false] }
    : { $ne: true };
  const apps = await Application.find({
    job: job._id,
    withdrawn: withdrawnFilter,
  })
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

    if (expMin) {
      const years = jobs.reduce(
        (acc, j) => acc + (Number(j.years || 0) || 0),
        0
      );
      if (years < expMin) return false;
    }

    const up = s.resumeForm?.updatedAt
      ? new Date(s.resumeForm.updatedAt)
      : null;
    if (up) {
      if (rFrom && up < new Date(rFrom)) return false;
      if (rTo && up > new Date(rTo)) return false;
    }

    return true;
  });

  // مخفی‌کردن تماس تا وقتی کارفرما نخرد
  const list = filtered.map((a) => {
    const s = a.student;
    const maskedPhone = s.resumeForm?.basic?.phone
      ? s.resumeForm.basic.phone.replace(/\d(?=\d{4})/g, "•")
      : "";
    const maskedEmail = s.resumeForm?.basic?.email
      ? s.resumeForm.basic.email.replace(/^[^@]+/, (m) =>
          "•".repeat(Math.max(1, m.length - 2))
        )
      : "";
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
