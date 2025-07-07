import dbConnect from '../../../../lib/dbConnect';
import Student from '../../../../models/Student';

export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();
  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });
  return Response.json({ learning: student.learning || [] });
}

export async function PUT(req) {
  await dbConnect();
  const { mobile, courseId, progress, correct, wrong, finished } = await req.json();
  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  const idx = student.learning.findIndex(l => l.courseId === courseId);
  if (idx !== -1) {
    // ویرایش
    student.learning[idx] = { courseId, progress, correct, wrong, finished };
  } else {
    // افزودن جدید
    student.learning.push({ courseId, progress, correct, wrong, finished });
  }
  await student.save();
  return Response.json({ success: true });
}
