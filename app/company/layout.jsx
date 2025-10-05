// app/company/layout.jsx
"use client";

import { usePathname } from "next/navigation";
import EmployerSidebar from "../../components/EmployerSidebar";
import { Box } from "@mui/material";
import { useEffect } from "react";

export default function CompanyLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/company/login");
  useEffect(() => {
    // مقدار پیش‌فرض اگر هنوز سایدبار نیاورده باشد
    if (!document.documentElement.style.getPropertyValue("--emp-sidebar-w")) {
      document.documentElement.style.setProperty("--emp-sidebar-w", "260px");
    }
  }, []);

  if (isLogin) return children;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <EmployerSidebar />
      <Box sx={{ flex: 1, p: 2, ml: { md: "var(--emp-sidebar-w, 260px)" }, transition: "margin-left 180ms ease" }}>
        {children}
      </Box>
    </Box>
  );
}
