import dbConnect from "../../../../lib/dbConnect";
import Employer from "../../../../models/Employer";
import Company from "../../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth } from "../../../../lib/auth";

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  if (!payload || payload.role !== "employer") return NextResponse.json(null, { status: 401 });

  const emp = await Employer.findById(payload.sub).lean();
  const company = await Company.findById(payload.companyId).lean();

  return NextResponse.json({
    employer: emp ? { _id: emp._id, name: emp.name, email: emp.email, mobile: emp.mobile, company: payload.companyId } : null,
    company,
  });
}
