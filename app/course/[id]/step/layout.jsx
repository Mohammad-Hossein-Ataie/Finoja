// ===============================
// FILE: app/course/[id]/step/layout.jsx
// ===============================
"use client";

import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
// توجه به مسیر نسبی از اینجا تا فولدر components
import StudentSidebar from "../../../../components/StudentSidebar";

export default function CourseStepLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
      <StudentSidebar />
      <Box component="main" flexGrow={1} minHeight="100vh" sx={{ pb: isMobile ? 8 : 0 }}>
        {children}
      </Box>
    </Box>
  );
}
