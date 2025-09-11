// app/api/login-student/route.js
import dbConnect from "../../../lib/dbConnect";
import Student from "../../../models/Student";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signJwt } from "../../../lib/jwt";

export async function POST(req) {
  await dbConnect();
  const { mobile, password } = await req.json();

  const student = await Student.findOne({ mobile });
  const invalid =
    !student || !(await bcrypt.compare(password, student.password || ""));
  if (invalid) {
    // پیام عمومی برای جلوگیری از user enumeration
    return NextResponse.json(
      { error: "شماره یا رمز عبور نادرست است." },
      { status: 401 }
    );
  }

  const token = await signJwt(
    { sub: String(student._id), role: "student", mobile: student.mobile },
    "7d"
  );

  const res = NextResponse.json({
    success: true,
    student: { id: student._id, mobile: student.mobile },
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
