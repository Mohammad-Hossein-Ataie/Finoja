import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

/**
 * GET /api/leaderboard/:id?limit=20&page=1&rankOf=09xxxxxxxxx
 * - برمی‌گرداند: لیست {name,family,mobile,xp,avatarKey,avatarUrl}
 * - اگر rankOf داده شود: { me: { xp, rank } } هم برمی‌گردد.
 */
export async function GET(req, { params }) {
  await dbConnect();
  const courseId = params.id;

  const url = new URL(req.url);
  const limit = Math.max(5, Math.min(100, Number(url.searchParams.get("limit") || 20)));
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const rankOf = url.searchParams.get("rankOf") || null;

  // آدرس عمومی S3 (پابلیک) برای ساخت URL آواتار
  const PUBLIC_BASE =
    process.env.LIARA_PUBLIC_BASE ||
    `${process.env.LIARA_ENDPOINT?.replace(/\/+$/, "")}/${process.env.LIARA_BUCKET_NAME}`;

  // لیست صفحه‌بندی‌شده
  const list = await Student.aggregate([
    { $unwind: "$learning" },
    { $match: { "learning.courseId": courseId } },
    {
      $project: {
        _id: 0,
        name: 1,
        family: 1,
        mobile: 1,
        xp: { $ifNull: ["$learning.xp", 0] },
        avatarKey: "$avatarKey",
      },
    },
    { $sort: { xp: -1, name: 1, family: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  // total count برای صفحه‌بندی (نمایش شماره صفحه)
  const totalCountAgg = await Student.aggregate([
    { $unwind: "$learning" },
    { $match: { "learning.courseId": courseId } },
    { $count: "cnt" },
  ]);
  const total = totalCountAgg?.[0]?.cnt || 0;

  // تبدیل avatarKey به URL
  const leaders = list.map((s) => ({
    ...s,
    avatarUrl: s.avatarKey ? `${PUBLIC_BASE}/${s.avatarKey}` : null,
  }));

  const result = { leaders, page, limit, total };

  // محاسبه رتبه/XP کاربر خاص (بدون کشیدن کل جدول)
  if (rankOf) {
    // xp کاربر
    const meAgg = await Student.aggregate([
      { $match: { mobile: rankOf } },
      { $unwind: "$learning" },
      { $match: { "learning.courseId": courseId } },
      { $project: { _id: 0, xp: { $ifNull: ["$learning.xp", 0] } } },
      { $limit: 1 },
    ]);
    const meXp = meAgg?.[0]?.xp ?? 0;

    // تعداد کسانی که XP بیشتری دارند
    const higherAgg = await Student.aggregate([
      { $unwind: "$learning" },
      { $match: { "learning.courseId": courseId } },
      { $project: { _id: 0, xp: { $ifNull: ["$learning.xp", 0] } } },
      { $match: { xp: { $gt: meXp } } },
      { $count: "cnt" },
    ]);
    const higher = higherAgg?.[0]?.cnt || 0;
    result.me = { xp: meXp, rank: higher + 1 };
  }

  return Response.json(result);
}
