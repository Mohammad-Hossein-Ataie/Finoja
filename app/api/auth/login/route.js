import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();
    const { username, password } = await req.json();
    const user = await User.findOne({ username });
    if (!user) return Response.json({ error: "User not found" }, { status: 401 });
    const isValid = await user.comparePassword(password);
    if (!isValid) return Response.json({ error: "Invalid password" }, { status: 401 });

    const payload = { userId: user._id.toString(), role: user.role };
    const token = await signJwt(payload, "15m");

    // 👇 کوکی را اینجا ست کن (بدون نیاز به import خارجی!)
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
