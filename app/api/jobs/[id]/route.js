import dbConnect from "../../../../lib/dbConnect";
import Job from "../../../../models/Job";
import { NextResponse } from "next/server";

export async function GET(_req, ctx) {
  const { id } = await ctx.params;           // ✅ باید await شود
  await dbConnect();
  try {
    const job = await Job.findById(id).populate("company", "name field city country website");
    if (!job) return NextResponse.json({ error: "آگهی یافت نشد" }, { status: 404 });
    return NextResponse.json({ job });
  } catch {
    return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
  }
}
