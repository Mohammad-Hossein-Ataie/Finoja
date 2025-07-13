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

export default function StudentSidebar() {
  const pathname = usePathname();
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ---------- خروج ---------- */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";   // بازگشت به لندینگ
  };

  /* ---------- وضعیت باز / بسته برای دسکتاپ ---------- */
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar_collapsed") === "1");
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
  };

  /* ╔══════════════════════╗
     ║   نسخه موبایل (Bottom Nav)  ║
     ╚══════════════════════╝ */
  if (isMobile) {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "100vw",
          borderTop: "1px solid #ffffff22",
          bgcolor: "#0F1923",
          zIndex: 1300,
        }}
      >
        <BottomNavigation
          showLabels={false}
          value={NAV_ITEMS.findIndex((n) => pathname.startsWith(n.href))}
          sx={{ bgcolor: "transparent" }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.href}
              icon={item.icon}
              component={Link}
              href={item.href}
              sx={{
                color: pathname.startsWith(item.href) ? "#66DE93" : "#FFF",
                minWidth: 0,
                paddingY: 1,
              }}
            />
          ))}

          {/* دکمه خروج */}
          <BottomNavigationAction
            icon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ color: "#FFF", minWidth: 0, paddingY: 1 }}
          />
        </BottomNavigation>
      </Box>
    );
  }

  /* ╔══════════════════════╗
     ║  نسخه دسکتاپ (Sidebar) ║
     ╚══════════════════════╝ */

  const WIDTH = collapsed ? 84 : 220;

  return (
    /* ظرفی که در جریان لِـی‌اوت شرکت می‌کند  */
    <Box
      sx={{
        width: WIDTH,
        flexShrink: 0,
      }}
    >
      {/* سایدبار «واقعی» که فیکس می‌شود  */}
      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: WIDTH,
          height: "100vh",
          bgcolor: "#0F1923",
          color: "#FFF",
          display: "flex",
          flexDirection: "column",
          zIndex: 1200,
          transition: "width 0.25s",
          overflowY: "auto",        // ← اگر آیتم‌ها زیاد شد Scroll داخلی
        }}
      >
        {/* دکمه باز/بستن */}
        <IconButton
          onClick={toggleCollapsed}
          sx={{ color: "#FFF", alignSelf: "center", mt: 1, mb: 3 }}
        >
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        {/* لینک‌ها */}
        {NAV_ITEMS.map((item) => {
          const active =
            pathname.startsWith(item.href) ||
            (item.href === "/student/courses" && pathname.startsWith("/roadmap"));
          return (
            <Tooltip
              key={item.href}
              title={collapsed ? item.label : ""}
              placement="left"
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
                  color: active ? "#66DE93" : "#FFF",
                  bgcolor: active ? "#FFFFFF22" : "transparent",
                  "&:hover": { bgcolor: "#FFFFFF33" },
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

        {/* دکمه خروج */}
        <Tooltip title="خروج" placement="left">
          <IconButton
            onClick={handleLogout}
            sx={{ color: "#FFF", mb: 2, alignSelf: "center" }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
