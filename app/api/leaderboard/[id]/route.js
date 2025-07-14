import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

export async function GET(_req, { params }) {
  await dbConnect();
  const courseId = params.id;
  const limit = Number(_req.nextUrl.searchParams.get("limit") || 20);

  /* unwind → فقط رکوردهای learning مربوط به این دوره */
  const top = await Student.aggregate([
    { $unwind: "$learning" },
    { $match: { "learning.courseId": courseId } },
    {
      $project: {
        _id: 0,
        name: 1,
        family: 1,
        mobile: 1,
        xp: "$learning.xp",
      },
    },
    { $sort: { xp: -1 } },
    { $limit: limit },
  ]);

  return Response.json(top);
}
