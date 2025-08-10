// app/api/register-student/route.js
import dbConnect from "../../../lib/dbConnect";
import Student from "../../../models/Student";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signJwt } from "../../../lib/jwt";

export async function POST(req) {
  await dbConnect();
  const { name, family, mobile, email, password } = await req.json();

  const exists = await Student.findOne({ mobile });
  if (exists) {
    return NextResponse.json({ error: "شماره قبلاً ثبت شده" }, { status: 400 });
  }

  if (!/^09\d{9}$/.test(mobile) || !password || password.length < 4) {
    return NextResponse.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const student = await Student.create({
      name,
      family,
      mobile,
      email,
      password: hashed,
    });

    const token = await signJwt(
      { sub: String(student._id), role: "student", mobile: student.mobile },
      "7d"
    );

    const res = NextResponse.json({ success: true, id: student._id });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
