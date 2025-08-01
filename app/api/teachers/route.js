import { cookies } from "next/headers";
import { verifyJwt } from "../../../lib/jwt";
import dbConnect from "../../../lib/dbConnect";
import Teacher from "../../../models/Teacher";
import User from "../../../models/User";

function randomPassword() {
  return Math.random().toString().slice(2, 10); // 8 digits
}

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  // فقط ادمین اجازه دارد
  if (!payload || payload.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teachers = await Teacher.find();
  return Response.json(teachers);
}

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || payload.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const username = body.phone || body.email || body.nationalCode;
  if (!username)
    return Response.json({ error: "Username (phone/email/nationalCode) required" }, { status: 400 });

  // Check existing user or teacher
  const userExists = await User.findOne({ username });
  if (userExists)
    return Response.json({ error: "User already exists with this username" }, { status: 400 });

  const teacherExists = await Teacher.findOne({ $or: [
    { nationalCode: body.nationalCode },
    { phone: body.phone },
    { email: body.email }
  ]});
  if (teacherExists)
    return Response.json({ error: "Teacher already exists" }, { status: 400 });

  // Create Teacher
  const teacher = await Teacher.create(body);

  // Create User for teacher
  const password = randomPassword();
  const user = await User.create({
    username,
    password,
    role: "teacher",
    teacher: teacher._id,
  });

  return Response.json({
    teacher,
    user: { username: user.username, password },
    message: "Teacher and user created",
  });
}
