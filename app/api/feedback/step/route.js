import dbConnect from "../../../../lib/dbConnect";
import StepIssue from "../../../../models/StepIssue";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { mobile, courseId, globalStepIndex, stepType, reason, message } = await req.json();

    if (!mobile || courseId === undefined || globalStepIndex === undefined) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    await StepIssue.create({
      studentMobile: String(mobile),
      courseId,
      globalStepIndex,
      stepType: stepType || "",
      reason: reason || "",
      message: message || "",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/feedback/step error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
