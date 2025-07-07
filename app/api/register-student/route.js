// app/api/register-student/route.js
import dbConnect from '../../../lib/dbConnect';
import Student from '../../../models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const { name, family, mobile, email, password } = await req.json();

  // چک شماره تکراری
  const exists = await Student.findOne({ mobile });
  if (exists) {
    return Response.json({ error: 'شماره قبلاً ثبت شده' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const student = await Student.create({
      name, family, mobile, email, password: hashed
    });
    return Response.json({ success: true, id: student._id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
