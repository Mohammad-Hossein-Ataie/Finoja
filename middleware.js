import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const now = Math.floor(Date.now() / 1000);

    if (now - payload.iat > 10 * 60) {
      // Remove iat/exp from payload, create new JWT
      const { iat, exp, ...rest } = payload;
      const newToken = await new SignJWT(rest)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(new TextEncoder().encode(JWT_SECRET));

      // دست‌ساز رشته کوکی:
      const cookieString = [
        `token=${newToken}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        "Max-Age=900",
        process.env.NODE_ENV === "production" ? "Secure" : ""
      ].filter(Boolean).join("; ");

      const res = NextResponse.next();
      res.headers.set("Set-Cookie", cookieString);
      return res;
    }
  } catch (err) {
    // اگر JWT خراب یا منقضی شده باشه...
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
