// app/api/employer/register/route.js
import dbConnect from "../../../../lib/dbConnect";
import Company from "../../../../models/Company";
import Employer from "../../../../models/Employer";
import OTP from "../../../../models/OTP";
import bcrypt from "bcryptjs";
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
  const raw = await req.json().catch(() => ({}));

  // دو شکل ورودی را پشتیبانی کنیم:
  const companyPayload = raw.company
    ? raw.company
    : { name: raw.companyName, field: raw.field, country: raw.country, city: raw.city, website: raw.website };

  const employerPayload = raw.employer || raw.owner || {};
  const otpCode = String(raw.otpCode || "");
  const password = raw.password ? String(raw.password) : null;

  const mobile = normalizeMobile(employerPayload?.mobile);
  if (!companyPayload?.name || !/^09\d{9}$/.test(mobile) || otpCode.length !== 6) {
    return NextResponse.json({ error: "اطلاعات ناقص/نامعتبر است." }, { status: 400 });
    }

  // OTP: employer_register یا employer (سازگاری عقب)
  const otp = await OTP.findOne({ mobile, purpose: { $in: ["employer_register", "employer"] } })
    .sort({ createdAt: -1 });
  if (!otp || otp.code !== otpCode || (otp.expiresAt && otp.expiresAt < new Date())) {
    return NextResponse.json({ error: "کد تایید نامعتبر/منقضی است." }, { status: 400 });
  }
  await OTP.deleteMany({ _id: otp._id });

  // ایجاد شرکت
  const company = await Company.create({
    name: companyPayload.name,
    field: companyPayload.field || "",
    country: companyPayload.country || "",
    city: companyPayload.city || "",
    website: companyPayload.website || "",
    // Company.js پیش‌فرض kyc.status = "none" دارد؛ همان را می‌گذاریم
  });

  // ایجاد کارفرما
  let hashed = null;
  if (password) hashed = await bcrypt.hash(password, 10);

  const emp = await Employer.create({
    name: employerPayload.name || "",
    email: employerPayload.email || "",
    mobile,
    password: hashed, // می‌تواند null بماند (ورود OTP)
    company: company._id,
  });

  // ورود
  const token = await signJwt({ sub: String(emp._id), role: "employer", companyId: String(company._id) }, "7d");
  const res = NextResponse.json({ success: true, companyId: company._id, employerId: emp._id });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set("token", token, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
