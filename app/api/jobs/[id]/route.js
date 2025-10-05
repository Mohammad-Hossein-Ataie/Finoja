import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Job from "../../../../models/Job";
import Application from "../../../../models/Application";
import Course from "../../../../models/Course";            // ← NEW
import { getAuth } from "../../../../lib/auth";

export async function GET(req, context) {
  await dbConnect();

  const { id } = await context.params;

  const job = await Job.findById(id)
    .populate("company", "name field city country website")
    .lean();

  if (!job) {
    return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });
  }

  // وضعیت اپلیکیشن کاربر (اگر دانش‌آموز لاگین باشد)
  let myApplication = null;
  try {
    const payload = await getAuth(req);
    const role = payload?.role || payload?.type;
    const studentId = String(payload?.studentId || payload?.sub || payload?._id || "");
    if (role === "student" && studentId) {
      const app = await Application.findOne({ job: id, student: studentId })
        .select("status withdrawn")
        .lean();
      if (app) {
        myApplication = {
          id: String(app._id),
          status: app.status,
          withdrawn: !!app.withdrawn,
        };
      }
    }
  } catch {}

  // فقط عنوان دوره‌های اشاره‌شده در آگهی
  let courseRefs = [];
  if (Array.isArray(job.finojaCourseIds) && job.finojaCourseIds.length) {
    const courses = await Course.find({ _id: { $in: job.finojaCourseIds } })
      .select("title")
      .lean();
    courseRefs = courses.map(c => ({ _id: String(c._id), title: c.title }));
  }

  return NextResponse.json({ job, myApplication, courseRefs });
}
