import dbConnect from '../../../lib/dbConnect';
import Student from '../../../models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const { mobile, password } = await req.json();
  const student = await Student.findOne({ mobile });
  if (!student) {
    return Response.json({ error: 'Not found' }, { status: 401 });
  }
  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    return Response.json({ error: 'Wrong password' }, { status: 401 });
  }
  // اگر خواستی JWT یا session اضافه کن
  return Response.json({ success: true, student: { id: student._id, mobile: student.mobile } });
}
