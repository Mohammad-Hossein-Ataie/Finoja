import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const payload = verifyJwt(token);

  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await User.findById(payload.userId).populate("teacher");
  return Response.json({ role: user.role, username: user.username, teacher: user.teacher });
}
