"use client";
import { Box } from "@mui/material";
import StudentSidebar from "../../components/StudentSidebar";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function StudentLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box display="flex" flexDirection={isMobile ? "column" : "row-reverse"}>
      {/* سایدبار یا نوار پایینی (داخل کامپوننت) */}
      <StudentSidebar />

      {/* محتوای صفحات */}
      <Box
        component="main"
        flexGrow={1}
        minHeight="100vh"
        sx={{
          pb: isMobile ? 8 : 0, // جا برای Bottom Nav
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
