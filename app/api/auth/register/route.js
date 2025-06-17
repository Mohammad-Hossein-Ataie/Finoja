import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  await dbConnect();
  const { username, password, role, teacherId } = await req.json();
  const exists = await User.findOne({ username });
  if (exists) return Response.json({ error: "Already exists" }, { status: 400 });
  const user = new User({ username, password, role, teacher: teacherId });
  await user.save();
  return Response.json({ success: true });
}
