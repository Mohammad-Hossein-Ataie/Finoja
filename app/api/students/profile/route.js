import dbConnect from '../../../../lib/dbConnect';
import Student from '../../../../models/Student';

export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();
  if (!mobile) return Response.json({ error: "Mobile required" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  // فقط اطلاعات مورد نیاز رو برگردون
  return Response.json({
    onboarding: student.onboarding || null,
    id: student._id,
    name: student.name,
    family: student.family,
    mobile: student.mobile
  });
}
