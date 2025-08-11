import dbConnect from "../../../../lib/dbConnect";
import UnitFeedback from "../../../../models/UnitFeedback";

export async function POST(req) {
  await dbConnect();
  const { mobile, courseId, sectionIdx, unitIdx, rating, comment } = await req.json();

  if (!mobile || rating === undefined || courseId === undefined || sectionIdx === undefined || unitIdx === undefined) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  await UnitFeedback.create({
    studentMobile: mobile,
    courseId,
    sectionIdx,
    unitIdx,
    rating,
    comment: comment || "",
  });

  return Response.json({ ok: true });
}
