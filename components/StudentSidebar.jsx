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

// رنگ‌ها در یک جا
const COLORS = {
  bg: "#2477F3", // پس‌زمینه جدید
  text: "#FFFFFF",
  textDim: "rgba(255,255,255,0.9)",
  divider: "#FFFFFF22",
  hover: "#FFFFFF33",
  activeText: "#66DE93", // رنگ آیتم فعال (هم دسکتاپ هم موبایل)
  activeBg: "#FFFFFF22",
};

export default function StudentSidebar() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ---------- خروج ---------- */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/"; // بازگشت به لندینگ
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
    const currentIndex = NAV_ITEMS.findIndex((n) =>
      pathname.startsWith(n.href)
    );

    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
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
          {NAV_ITEMS.map((item, idx) => (
            <BottomNavigationAction
              key={item.href}
              icon={item.icon}
              component={Link}
              href={item.href}
              sx={{
                minWidth: 0,
                paddingY: 1,
                // رنگ پیش‌فرض آیکن‌ها
                color: COLORS.textDim,
                // وقتی انتخاب می‌شود، به‌جای primary.main (که همون 2477F3 بود) این رنگ اعمال شود
                "&.Mui-selected": {
                  color: COLORS.activeText,
                },
              }}
            />
          ))}

          {/* دکمه خروج */}
          <BottomNavigationAction
            icon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              minWidth: 0,
              paddingY: 1,
              color: COLORS.text,
            }}
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
          bgcolor: COLORS.bg,
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
          zIndex: 1200,
          transition: "width 0.25s",
          overflowY: "auto", // ← اگر آیتم‌ها زیاد شد Scroll داخلی
        }}
      >
        {/* دکمه باز/بستن */}
        <IconButton
          onClick={toggleCollapsed}
          sx={{ color: COLORS.text, alignSelf: "center", mt: 1, mb: 3 }}
        >
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        {/* لینک‌ها */}
        {NAV_ITEMS.map((item) => {
          const active =
            pathname.startsWith(item.href) ||
            (item.href === "/student/courses" &&
              pathname.startsWith("/roadmap"));
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

        {/* دکمه خروج */}
        <Tooltip title="خروج" placement="left">
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
