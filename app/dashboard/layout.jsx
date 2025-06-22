"use client";
import Sidebar from "./sidebar";
import { Box } from "@mui/material";

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6fa" }}>
      {/* Sidebar Fixed */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          zIndex: 100,
          width: 220, // Width of sidebar (adjust if needed)
        }}
      >
        <Sidebar />
      </Box>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 1, md: 3 },
          ml: { md: "220px" }, // Equal to sidebar width
          // width: "100%",
        }}
      >
        {/* Mobile: Show Sidebar on top */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Sidebar />
        </Box>
        {children}
      </Box>
    </Box>
  );
}
