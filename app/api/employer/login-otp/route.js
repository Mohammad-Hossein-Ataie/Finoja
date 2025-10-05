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
  try {
    const { mobile, code } = await req.json();
    const nm = normalizeMobile(mobile);

    const otp = await OTP.findOne({ mobile: nm }).sort({ createdAt: -1 }).lean();
    const now = Date.now();
    const expired = otp?.expiresAt ? now > new Date(otp.expiresAt).getTime() : false;
    if (!otp || otp.code !== String(code) || expired) {
      return NextResponse.json({ error: "کد تایید نادرست یا منقضی است." }, { status: 401 });
    }

    const emp = await Employer.findOne({ mobile: nm }).populate("company").lean();
    if (!emp) return NextResponse.json({ error: "ابتدا ثبت‌نام کنید." }, { status: 404 });

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
  } catch {
    return NextResponse.json({ error: "خطا در ورود با OTP." }, { status: 500 });
  }
}
