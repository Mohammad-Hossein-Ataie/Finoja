import { cookies } from "next/headers";
import { verifyJwt } from "../../../lib/jwt";
import dbConnect from "../../../lib/dbConnect";
import Student from "../../../models/Student";
import User from "../../../models/User";

function randomPassword() {
  return Math.random().toString().slice(2, 10); // 8 digits
}

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || (payload.role !== "admin" && payload.role !== "teacher"))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const students = await Student.find();
  return Response.json(students);
}

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  // اجازه بده admin و teacher بتواند دانش‌آموز بسازد
  if (!payload || (payload.role !== "admin" && payload.role !== "teacher"))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const username = body.phone || body.email || body.nationalCode;
  if (!username)
    return Response.json({ error: "Username (phone/email/nationalCode) required" }, { status: 400 });

  // Check existing user or student
  const userExists = await User.findOne({ username });
  if (userExists)
    return Response.json({ error: "User already exists with this username" }, { status: 400 });

  const studentExists = await Student.findOne({ $or: [
    { nationalCode: body.nationalCode },
    { phone: body.phone },
    { email: body.email }
  ]});
  if (studentExists)
    return Response.json({ error: "Student already exists" }, { status: 400 });

  // Create Student
  const student = await Student.create({ name, family, mobile, email, password: hashed });

  // Create User for student
  const password = randomPassword();
  const user = await User.create({
    username,
    password,
    role: "student",
    student: student._id,
  });

  return Response.json({
    student,
    user: { username: user.username, password },
    message: "Student and user created",
  });
}
