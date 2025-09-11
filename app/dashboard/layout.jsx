"use client";

import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./sidebar";

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box display="flex" flexDirection={isMobile ? "column" : "row"} minHeight="100vh" bgcolor="#f4f6fa">
      {/* سایدبار؛ خودش داخل فلو فضا رزرو می‌کند */}
      <Sidebar />

      {/* محتوا */}
      <Box component="main" flexGrow={1} minHeight="100vh" sx={{ pb: isMobile ? 8 : 0 }}>
        {children}
      </Box>
    </Box>
  );
}
