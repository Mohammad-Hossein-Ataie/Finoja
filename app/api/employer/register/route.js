import dbConnect from "../../../../lib/dbConnect";
import Company from "../../../../models/Company";
import Employer from "../../../../models/Employer";
import OTP from "../../../../models/OTP";
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
    const body = await req.json();
    const { companyName, field, country, city, website, employer, otpCode } = body;
    const nm = normalizeMobile(employer?.mobile);

    if (!companyName || !nm || !otpCode) {
      return NextResponse.json({ error: "اطلاعات ناقص است." }, { status: 400 });
    }

    const otp = await OTP.findOne({ mobile: nm }).sort({ createdAt: -1 }).lean();
    const now = Date.now();
    const expired = otp?.expiresAt ? now > new Date(otp.expiresAt).getTime() : false;
    if (!otp || otp.code !== String(otpCode) || expired) {
      return NextResponse.json({ error: "کد تایید نادرست است." }, { status: 401 });
    }

    const exists = await Employer.findOne({ mobile: nm }).lean();
    if (exists) {
      return NextResponse.json({ error: "این موبایل قبلاً ثبت شده است." }, { status: 400 });
    }

    const company = await Company.create({
      name: companyName,
      field: field || "سایر",
      country: country || "ایران",
      city: city || "",
      website: website || "",
      kyc: { status: "none", docs: [] },
      subscription: { plan: "trial", credits: 10 },
    });

    const emp = await Employer.create({
      name: employer?.name || "",
      email: employer?.email || "",
      mobile: nm,
      password: null,
      company: company._id,
    });

    const token = await signJwt({ sub: String(emp._id), role: "employer", companyId: String(company._id) }, "7d");
    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ success: true, companyId: company._id, employerId: emp._id });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "خطا در ثبت‌نام کارفرما." }, { status: 500 });
  }
}
