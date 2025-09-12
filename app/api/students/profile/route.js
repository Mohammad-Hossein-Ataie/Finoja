import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";
import Course from "../../../../models/Course";

export async function POST(req) {
  await dbConnect();

  const { mobile } = await req.json();
  if (!mobile)
    return Response.json({ error: "Mobile required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student)
    return Response.json({ error: "Student not found" }, { status: 404 });

  const courseIds = (student.learning || []).map((l) => l.courseId);
  const courseDocs = await Course.find({ _id: { $in: courseIds } }).select(
    "_id title"
  );
  const titleMap = courseDocs.reduce((acc, c) => {
    acc[String(c._id)] = c.title;
    return acc;
  }, {});

  const learning = (student.learning || []).map((l) => ({
    courseId: l.courseId,
    title: titleMap[l.courseId] || "دوره نامشخص",
    progress: l.progress ?? 0,
    xp: l.xp ?? 0,
    finished: !!l.finished,
  }));

  const resume = student.resumeKey
    ? {
        key: student.resumeKey,
        name: student.resumeName ?? null,
        size: student.resumeSize ?? null,
        type: student.resumeType ?? null,
        updatedAt: student.resumeUpdatedAt ?? null,
      }
    : null;

  const avatar = student.avatarKey
    ? {
        key: student.avatarKey,
        type: student.avatarType ?? null,
        size: student.avatarSize ?? null,
        updatedAt: student.avatarUpdatedAt ?? null,
      }
    : null;

  return Response.json({
    id: student._id,
    name: student.name,
    family: student.family,
    mobile: student.mobile,
    email: student.email ?? null,
    onboarding: student.onboarding ?? null,
    totalXp: student.totalXp ?? 0,
    createdAt: student.createdAt,
    learning,
    resume,
    avatar,

    // سازگاری عقب:
    resumeKey: student.resumeKey ?? undefined,
    resumeName: student.resumeName ?? undefined,
    resumeSize: student.resumeSize ?? undefined,
    resumeType: student.resumeType ?? undefined,
    resumeUpdatedAt: student.resumeUpdatedAt ?? undefined,

    avatarKey: student.avatarKey ?? undefined,
    avatarType: student.avatarType ?? undefined,
    avatarSize: student.avatarSize ?? undefined,
    avatarUpdatedAt: student.avatarUpdatedAt ?? undefined,
  });
}
