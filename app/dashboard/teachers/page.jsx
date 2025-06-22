"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TeachersPageContent from "./TeachersPageContent"; // کل کامپوننت مدیریت اساتید (زیر همین فایل)
import { useCurrentUser } from "../../../lib/useCurrentUser";

export default function TeachersPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/dashboard/courses");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  if (user.role !== "admin") return null;

  return <TeachersPageContent />;
}
