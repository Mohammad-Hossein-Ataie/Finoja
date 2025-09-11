"use client";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StudentSidebar from "../../components/StudentSidebar";

export default function StudentLayout({ children }) {
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
