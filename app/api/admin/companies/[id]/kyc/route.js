import dbConnect from "../../../../../../lib/dbConnect";
import Company from "../../../../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../../lib/auth";

/** PATCH: تایید/رد KYC شرکت (فقط ادمین) */
export async function PATCH(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["admin"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const { id } = params;
  const { status } = await req.json();
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "وضعیت نامعتبر است." }, { status: 400 });
  }

  const company = await Company.findById(id);
  if (!company) return NextResponse.json({ error: "شرکت یافت نشد." }, { status: 404 });

  company.kyc = {
    ...(company.kyc || {}),
    status,
    reviewedAt: new Date(),
    reviewedBy: payload.sub,
  };
  await company.save();

  return NextResponse.json({ success: true });
}
