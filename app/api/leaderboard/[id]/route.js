import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

export async function GET(req, { params }) {
  await dbConnect();
  const courseId = params.id;
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);

  const top = await Student.aggregate([
    { $unwind: "$learning" },
    { $match: { "learning.courseId": courseId } },
    {
      $project: {
        _id: 0,
        name: 1,
        family: 1,
        mobile: 1,
        xp: { $ifNull: ["$learning.xp", 0] },   // ← پیش‌فرض صفر
      },
    },
    { $sort: { xp: -1 } },
    { $limit: limit },
  ]);

  return Response.json(top);
}
