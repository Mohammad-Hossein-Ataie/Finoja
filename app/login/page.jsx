import { cookies } from "next/headers";
import { verifyJwt } from "../../lib/jwt";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";   // کامپوننت کلاینتی جداگانه

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload) {
      redirect("/dashboard");          // توکن معتبر ⇒ مستقیماً داشبورد
    }
  }

  // توکن نبود یا نامعتبر بود ⇒ فرمِ ورود را نمایش می‌دهیم
  return <LoginForm />;
}
