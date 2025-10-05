import dbConnect from "../../../../lib/dbConnect";
import Employer from "../../../../models/Employer";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signJwt } from "../../../../lib/jwt";

export async function POST(req) {
  await dbConnect();
  const { mobile, password } = await req.json();
  const emp = await Employer.findOne({ mobile }).populate("company");
  const invalid = !emp || !(await bcrypt.compare(password, emp.password || ""));
  if (invalid) {
    return NextResponse.json({ error: "شماره یا رمز نادرست است." }, { status: 401 });
  }
  const token = await signJwt({ sub: String(emp._id), role: "employer", companyId: String(emp.company?._id) }, "7d");
  const res = NextResponse.json({ success: true, employer: { id: emp._id, companyId: emp.company?._id } });
  res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
