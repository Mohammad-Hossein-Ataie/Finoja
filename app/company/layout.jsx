"use client";
import { usePathname } from "next/navigation";
import EmployerSidebar from "../../components/EmployerSidebar";
import { Box } from "@mui/material";

export default function CompanyLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/company/login");
  if (isLogin) return children;

  return (
    <Box sx={{ display:"flex", minHeight:"100vh" }}>
      <EmployerSidebar />
      <Box sx={{ flex:1, p:2, ml:{ md: "240px" } }}>{children}</Box>
    </Box>
  );
}
