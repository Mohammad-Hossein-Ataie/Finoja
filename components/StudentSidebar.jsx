// components/StudentSidebar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";

const NAV_ITEMS = [
  { href: "/student/courses", icon: <HomeIcon />, label: "دوره‌ها" },
  { href: "/student/best", icon: <EmojiEventsIcon />, label: "بهترین‌ها" },
  { href: "/student/profile", icon: <PersonIcon />, label: "پروفایل" },
];

const COLORS = {
  bg: "#2477F3",
  text: "#FFFFFF",
  textDim: "rgba(255,255,255,0.9)",
  divider: "#FFFFFF22",
  hover: "#FFFFFF33",
  activeText: "#66DE93",
  activeBg: "#FFFFFF22",
};

export default function StudentSidebar() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL = theme.direction === "rtl";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar_collapsed") === "1");
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
  };

  // موبایل
  if (isMobile) {
    const currentIndex = NAV_ITEMS.findIndex((n) =>
      pathname.startsWith(n.href)
    );
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          insetInlineStart: 0, // ← به‌جای right/left
          width: "100vw",
          borderTop: `1px solid ${COLORS.divider}`,
          bgcolor: COLORS.bg,
          zIndex: 1300,
        }}
      >
        <BottomNavigation
          showLabels={false}
          value={currentIndex}
          sx={{ bgcolor: "transparent" }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.href}
              icon={item.icon}
              component={Link}
              href={item.href}
              sx={{
                minWidth: 0,
                paddingY: 1,
                color: COLORS.textDim,
                "&.Mui-selected": { color: COLORS.activeText },
              }}
            />
          ))}
          <BottomNavigationAction
            icon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ minWidth: 0, paddingY: 1, color: COLORS.text }}
          />
        </BottomNavigation>
      </Box>
    );
  }

  // دسکتاپ
  const WIDTH = collapsed ? 84 : 220;

  return (
    <Box sx={{ width: WIDTH, flexShrink: 0 }}>
      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 0,
          insetInlineStart: 0, // ← فقط همین کافی‌ست (RTL/LTR خودکار)
          width: WIDTH,
          height: "100vh",
          bgcolor: COLORS.bg,
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
          zIndex: 1200,
          transition: "width 0.25s",
          overflowY: "auto",
        }}
      >
        <IconButton
          onClick={toggleCollapsed}
          sx={{ color: COLORS.text, alignSelf: "center", mt: 1, mb: 3 }}
          aria-label={collapsed ? "باز کردن منو" : "بستن منو"}
        >
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        {NAV_ITEMS.map((item) => {
          const active =
            pathname.startsWith(item.href) ||
            (item.href === "/student/courses" &&
              pathname.startsWith("/roadmap"));
          return (
            <Tooltip
              key={item.href}
              title={collapsed ? item.label : ""}
              placement={isRTL ? "left" : "right"}
            >
              <Box
                component={Link}
                href={item.href}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mx: 2,
                  my: 1,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  textDecoration: "none",
                  color: active ? COLORS.activeText : COLORS.text,
                  bgcolor: active ? COLORS.activeBg : "transparent",
                  "&:hover": { bgcolor: COLORS.hover },
                }}
              >
                {item.icon}
                {!collapsed && (
                  <Typography fontSize={15} fontWeight="bold">
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}

        <Box flexGrow={1} />

        <Tooltip title="خروج" placement={isRTL ? "left" : "right"}>
          <IconButton
            onClick={handleLogout}
            sx={{ color: COLORS.text, mb: 2, alignSelf: "center" }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
