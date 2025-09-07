import dbConnect from "../../../../lib/dbConnect";
import UnitFeedback from "../../../../models/UnitFeedback";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { mobile, courseId, sectionIdx, unitIdx, rating, comment } = await req.json();

    if (
      !mobile ||
      rating === undefined ||
      courseId === undefined ||
      sectionIdx === undefined ||
      unitIdx === undefined
    ) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    await UnitFeedback.create({
      studentMobile: String(mobile),
      courseId,
      sectionIdx,
      unitIdx,
      rating,
      comment: comment || "",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/feedback/unit error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
