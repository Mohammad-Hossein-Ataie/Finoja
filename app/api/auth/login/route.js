import { cookies } from "next/headers";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { signJwt } from "../../../../lib/jwt";

export async function POST(req) {
  await dbConnect();

  const { username, password } = await req.json();
  const user = await User.findOne({ username }).populate("teacher");

  if (!user || !(await user.comparePassword(password))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signJwt({
    _id: user._id,
    role: user.role,
    teacher: user.teacher?._id,
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json({ ok: true });
}
