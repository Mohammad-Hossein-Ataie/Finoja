import dbConnect from "../../../../lib/dbConnect";
import Company from "../../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer", "admin"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const company = await Company.findById(payload.companyId).lean();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  return NextResponse.json({ kyc: company.kyc });
}

export async function POST(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const { docs } = await req.json(); // [{type, key, name, size}, ...]
  if (!Array.isArray(docs) || !docs.length) {
    return NextResponse.json({ error: "مدارک معتبر نیست" }, { status: 400 });
  }

  const company = await Company.findById(payload.companyId);
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  company.kyc = {
    status: "pending",
    docs,
    reviewedAt: null,
    reviewedBy: null,
  };
  await company.save();

  return NextResponse.json({ success: true });
}
