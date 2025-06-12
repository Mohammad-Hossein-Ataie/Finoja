"use client";
import Sidebar from "./sidebar";
import { Box } from "@mui/material";

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6fa" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Sidebar />
      </Box>
      <Box sx={{ flex: 1, p: { xs: 1, md: 3 } }}>
        {/* موبایل: سایدبار بالا نمایش داده می‌شود */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Sidebar />
        </Box>
        {children}
      </Box>
    </Box>
  );
}
