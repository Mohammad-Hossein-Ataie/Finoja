"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CoursesPanel from "./CoursesPanel";
import { useCurrentUser } from "../../../lib/useCurrentUser";

export default function CoursesPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return <CoursesPanel />;
}
