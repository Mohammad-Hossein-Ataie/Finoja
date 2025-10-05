// app/api/students/resume-presence/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";
import { getAuth, requireRole } from "../../../../lib/auth";

function hasBuilderResume(rf) {
  if (!rf || typeof rf !== "object") return false;
  const progressed = typeof rf.progress === "number" ? rf.progress >= 50 : false;
  const minimal =
    !!rf?.basic?.name &&
    !!rf?.basic?.family &&
    (!!rf?.basic?.phone || !!rf?.basic?.email);
  return progressed || minimal;
}

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try {
    requireRole(payload, ["student"]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const student = await Student.findById(payload.sub).lean();
  if (!student) {
    return NextResponse.json({ error: "دانش‌آموز یافت نشد" }, { status: 404 });
  }

  const hasFile = !!student.resumeKey;
  const hasBuilder = hasBuilderResume(student.resumeForm);

  let defaultChoice = null;
  if (hasFile && !hasBuilder) defaultChoice = "file";
  else if (!hasFile && hasBuilder) defaultChoice = "builder";

  return NextResponse.json({ hasFile, hasBuilder, defaultChoice });
}
