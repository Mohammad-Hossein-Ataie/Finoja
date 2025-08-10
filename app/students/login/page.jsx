// app/students/login/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "../../../lib/jwt";
import AuthStepper from "../../../components/AuthStepperModal";

export const dynamic = "force-dynamic"; // برای قطع کش شدن ریدایرکت براساس کوکی

export default async function StudentsLoginPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (payload?.role === "student") {
    redirect("/student");
  }
  if (payload?.role === "admin" || payload?.role === "teacher") {
    redirect("/dashboard");
  }

  const defaultStep =
    (searchParams?.tab === "signup" || searchParams?.tab === "register") ? 1 : 0;

  return <AuthStepper asPage defaultStep={defaultStep} />;
}
