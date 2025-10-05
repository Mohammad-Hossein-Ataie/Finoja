// app/api/employer/login-otp/route.js
import dbConnect from "../../../../lib/dbConnect";
import OTP from "../../../../models/OTP";
import Employer from "../../../../models/Employer";
import { NextResponse } from "next/server";
import { signJwt } from "../../../../lib/jwt";

function normalizeMobile(m) {
  if (!m) return "";
  const fa2en = s => s.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  let x = fa2en(String(m)).replace(/\D/g, "");
  if (x.startsWith("0098")) x = x.slice(4);
  if (x.startsWith("98")) x = x.slice(2);
  if (!x.startsWith("0")) x = "0" + x;
  return x;
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const step = String(body?.step || "verify");

  // اگر کسی اشتباهاً این endpoint را برای request صدا بزند، خطای دوستانه بدهیم
  if (step === "request") {
    return NextResponse.json(
      { error: "برای دریافت کد از /api/employer/send-otp استفاده کنید." },
      { status: 400 }
    );
  }

  // VERIFY
  const mobile = normalizeMobile(body?.mobile || "");
  const code = String(body?.code || "");
  if (!/^09\d{9}$/.test(mobile) || code.length !== 6) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است." }, { status: 400 });
  }

  const allowedPurposes = ["employer", "employer_login", "employer_register"];
  const otp = await OTP.findOne({ mobile, purpose: { $in: allowedPurposes } })
    .sort({ createdAt: -1 });

  if (!otp || otp.code !== code || (otp.expiresAt && otp.expiresAt < new Date())) {
    return NextResponse.json({ error: "کد تایید نامعتبر/منقضی است." }, { status: 400 });
  }

  const emp = await Employer.findOne({ mobile }).populate("company");
  if (!emp) {
    return NextResponse.json({ error: "حساب کارفرما یافت نشد." }, { status: 404 });
  }

  // مصرف کد
  await OTP.deleteMany({ _id: otp._id });

  const token = await signJwt({ sub: String(emp._id), role: "employer", companyId: String(emp.company?._id) }, "7d");
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
