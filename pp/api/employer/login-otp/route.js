import dbConnect from "../../../../lib/dbConnect";
import OTP from "../../../../models/OTP";
import Employer from "../../../../models/Employer";
import { NextResponse } from "next/server";
import { signJwt } from "../../../../lib/jwt";

export async function POST(req) {
  await dbConnect();
  const { mobile, code } = await req.json();
  if (!mobile || !code) return NextResponse.json({ error: "اطلاعات ناقص است." }, { status: 400 });

  const rec = await OTP.findOne({ mobile, purpose: "employer" }).sort({ createdAt: -1 });
  if (!rec || rec.code !== code) return NextResponse.json({ error: "کد نادرست است." }, { status: 401 });

  const emp = await Employer.findOne({ mobile }).populate("company");
  if (!emp) return NextResponse.json({ error: "ابتدا ثبت‌نام کنید." }, { status: 404 });

  const token = await signJwt({ sub: String(emp._id), role: "employer", companyId: String(emp.company?._id) }, "7d");
  const res = NextResponse.json({ success: true, employer: { id: emp._id, companyId: emp.company?._id } });
  res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60*60*24*7 });
  return res;
}
