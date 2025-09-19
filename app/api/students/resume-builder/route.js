// app/api/students/resume-builder/route.js
import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");
    if (!mobile) return Response.json({ error: "mobile is required" }, { status: 400 });
    const stu = await Student.findOne({ mobile }).lean();
    if (!stu) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ resumeForm: stu.resumeForm || {} }, { status: 200 });
  } catch (e) {
    return Response.json({ error: "server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { mobile, resumeForm } = body || {};
    if (!mobile) return Response.json({ error: "mobile is required" }, { status: 400 });

    // محاسبه درصد پیشرفت خیلی ساده:
    const steps = ["basic", "educations", "jobs", "languages", "softwareSkills", "extraSkills"];
    let done = 0;
    if (resumeForm?.basic?.name && resumeForm?.basic?.family) done++;
    if ((resumeForm?.educations || []).length) done++;
    if ((resumeForm?.jobs || []).length) done++;
    if ((resumeForm?.languages || []).length) done++;
    if ((resumeForm?.softwareSkills || []).length) done++;
    if ((resumeForm?.extraSkills || []).length) done++;
    const progress = Math.min(100, Math.round((done / steps.length) * 100));

    const updated = await Student.findOneAndUpdate(
      { mobile },
      { $set: { resumeForm: { ...(resumeForm || {}), progress, updatedAt: new Date() } } },
      { new: true }
    ).lean();

    if (!updated) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ok: true, progress: updated.resumeForm?.progress || 0 });
  } catch (e) {
    return Response.json({ error: "server error" }, { status: 500 });
  }
}
