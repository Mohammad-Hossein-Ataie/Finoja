import dbConnect from "../../../../lib/dbConnect";
import StepIssue from "../../../../models/StepIssue";

export async function POST(req) {
  await dbConnect();
  const { mobile, courseId, globalStepIndex, stepType, reason, message } = await req.json();

  if (!mobile || courseId === undefined || globalStepIndex === undefined) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  await StepIssue.create({
    studentMobile: mobile,
    courseId,
    globalStepIndex,
    stepType: stepType || "",
    reason: reason || "",
    message: message || "",
  });

  return Response.json({ ok: true });
}
