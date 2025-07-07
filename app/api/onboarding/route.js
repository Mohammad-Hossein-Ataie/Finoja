import dbConnect from '../../../lib/dbConnect';
import Student from '../../../models/Student';

export async function POST(req) {
  await dbConnect();
  const data = await req.json();

  const { mobile, ...answers } = data;
  if (!mobile) {
    return Response.json({ error: "Mobile required" }, { status: 400 });
  }

  // تست برای دیباگ: قبل و بعد مقدار student
  const student = await Student.findOne({ mobile });
  if (!student) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  // مقداردهی
  student.onboarding = answers;
  await student.save();

  return Response.json({ success: true });
}
