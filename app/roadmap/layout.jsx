"use client";

import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StudentSidebar from "../../components/StudentSidebar";  // ← مسیر نسبت به root «app»

export default function RoadmapLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box display="flex" flexDirection={isMobile ? "column" : "row-reverse"}>
      {/* سایدبار دسکتاپ یا Bottom-Nav موبایل */}
      <StudentSidebar />

      {/* محتوای اصلی همهٔ صفحات /roadmap */}
      <Box
        component="main"
        flexGrow={1}
        minHeight="100vh"
        sx={{ pb: isMobile ? 8 : 0 /* فضای پایین برای Bottom-Nav */ }}
      >
        {children}
      </Box>
    </Box>
  );
}
