import dbConnect from "../../../../lib/dbConnect";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";
import Job from "../../../../models/Job";

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const jobs = await Job.find({ company: payload.companyId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ jobs });
}
