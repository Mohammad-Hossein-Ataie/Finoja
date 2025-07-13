import dbConnect from '../../../lib/dbConnect';
import Student from '../../../models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const { mobile, password } = await req.json();
  if (!/^09\d{9}$/.test(mobile) || !password || password.length < 4)
    return Response.json({ error: "اطلاعات معتبر نیست" }, { status: 400 });

  const student = await Student.findOne({ mobile });
  if (!student) {
    return Response.json({ error: "کاربری با این شماره وجود ندارد" }, { status: 404 });
  }
  const hashed = await bcrypt.hash(password, 10);
  student.password = hashed;
  await student.save();
  return Response.json({ success: true });
}
