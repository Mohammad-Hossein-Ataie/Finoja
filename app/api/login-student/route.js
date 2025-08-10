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
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  // ساخت JWT برای دانشجو
  const token = await signJwt(
    { sub: String(student._id), role: "student", mobile: student.mobile },
    "7d" // اعتبار ۷ روز
  );

  const res = NextResponse.json({
    success: true,
    student: { id: student._id, mobile: student.mobile },
  });

  // ست کردن کوکی HttpOnly
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7days
  });

  return res;
}
