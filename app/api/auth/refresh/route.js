import { cookies } from "next/headers";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST() {
  await dbConnect();
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // (اختیاری) کاربر را مجدد از دیتابیس بگیر برای اطمینان حذف یا تغییر نقش نشده
  const user = await User.findById(payload.userId);
  if (!user) return Response.json({ error: "User deleted" }, { status: 401 });

  const newAccessToken = signAccessToken({
    userId: user._id,
    role: user.role,
    teacher: user.teacher,
  });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Set-Cookie": `token=${newAccessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900;`, // 15 min
      "Content-Type": "application/json",
    },
  });
}
