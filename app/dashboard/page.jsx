"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHome from "./DashboardHome";
import { useCurrentUser } from "../../lib/useCurrentUser";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/dashboard/courses");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  if (user.role !== "admin") return null;

  return <DashboardHome />;
}
