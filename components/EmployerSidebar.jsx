// components/EmployerSidebar.jsx
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

import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BusinessIcon from "@mui/icons-material/Business";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";

const NAV_ITEMS = [
  { href: "/company/dashboard", icon: <DashboardIcon />, label: "داشبورد" },
  { href: "/company/profile", icon: <BusinessIcon />, label: "پروفایل شرکت" },
  // نکته: این آیتم برای همه مسیرهای /company/jobs فعال می‌شود (نه فقط /new)
  { href: "/company/jobs/new", icon: <WorkIcon />, label: "ثبت آگهی" },
  { href: "/company/applications", icon: <AssignmentIndIcon />, label: "درخواست‌ها" },
];

const COLORS = {
  // گرادینت مطابق نسخه‌ی قبلی شما
  bgGrad: "linear-gradient(180deg, #1F5BD8 0%, #0A2E5D 100%)",
  text: "#E6F0FF",
  textDim: "rgba(255,255,255,0.9)",
  divider: "#FFFFFF22",
  hover: "#FFFFFF33",
  activeText: "#66DE93",
  activeBg: "#FFFFFF22",
};

export default function EmployerSidebar() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL = theme.direction === "rtl";

  const [collapsed, setCollapsed] = useState(false);

  // خواندن/ثبت وضعیت تاشدن و ست‌کردن CSS متغیرِ پهنا برای لایه‌بندی صفحه‌های شرکت
  useEffect(() => {
    const saved = localStorage.getItem("empSidebarCollapsed") === "1";
    setCollapsed(saved);
  }, []);

  useEffect(() => {
    const width = isMobile ? "0px" : (collapsed ? "84px" : "240px");
    document.documentElement.style.setProperty("--emp-sidebar-w", width);
    localStorage.setItem("empSidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed, isMobile]);

  const toggleCollapsed = () => setCollapsed((s) => !s);

  const handleLogout = async () => {
    try { await fetch("/api/employer/logout", { method: "POST" }); } catch {}
    window.location.href = "/company/login";
  };

  // فعال بودن آیتم‌ها (کمی هوشمند برای مسیرهای تو در تو)
  const isActive = (href) => {
    if (pathname.startsWith(href)) return true;
    // "ثبت آگهی" را برای تمام مسیرهای jobs فعال کن
    if (href === "/company/jobs/new" && pathname.startsWith("/company/jobs")) return true;
    // درخواست‌ها: مسیرهای داخلی مثل /company/jobs/[id]/applications هم شامل شود
    if (href === "/company/applications" && pathname.includes("/applications")) return true;
    return false;
  };

  // موبایل: BottomNavigation
  if (isMobile) {
    const currentIndex = NAV_ITEMS.findIndex((n) => isActive(n.href));
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          insetInlineStart: 0,
          width: "100vw",
          borderTop: `1px solid ${COLORS.divider}`,
          bgcolor: "#1F5BD8", // رنگ ابتدایی گرادینت برای کفی
          zIndex: 1300,
        }}
      >
        <BottomNavigation showLabels={false} value={currentIndex} sx={{ bgcolor: "transparent" }}>
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
              className={isActive(item.href) ? "Mui-selected" : undefined}
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

  // دسکتاپ: سایدبار تاشو
  const WIDTH = collapsed ? 84 : 240;

  return (
    <Box sx={{ width: WIDTH, flexShrink: 0 }}>
      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 0,
          insetInlineStart: 0,
          width: WIDTH,
          height: "100vh",
          background: COLORS.bgGrad,
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
          zIndex: 1200,
          transition: "width 0.25s",
          overflowY: "auto",
          boxShadow: 3,
          p: 1.25,
        }}
      >
        {/* هِدِر */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: "#66DE93", borderRadius: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                پنل کارفرما
              </Typography>
            </Box>
          )}
          <IconButton
            size="small"
            onClick={toggleCollapsed}
            sx={{ color: COLORS.text }}
            aria-label={collapsed ? "باز کردن منو" : "بستن منو"}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Box>

        {/* آیتم‌ها */}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const inner = (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 1.5,
                mx: 1,
                my: 0.75,
                px: collapsed ? 1 : 1.5,
                py: 1.1,
                borderRadius: 2,
                textDecoration: "none",
                color: active ? COLORS.activeText : COLORS.text,
                bgcolor: active ? COLORS.activeBg : "transparent",
                "&:hover": { bgcolor: COLORS.hover },
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background 0.15s",
              }}
            >
              {item.icon}
              {!collapsed && (
                <Typography sx={{ fontSize: 14.5, fontWeight: active ? 800 : 600 }}>
                  {item.label}
                </Typography>
              )}
            </Box>
          );
          return collapsed ? (
            <Tooltip key={item.href} title={item.label} placement={isRTL ? "left" : "right"}>
              <Box component={Link} href={item.href} sx={{ textDecoration: "none" }}>
                {inner}
              </Box>
            </Tooltip>
          ) : (
            <Box key={item.href} component={Link} href={item.href} sx={{ textDecoration: "none" }}>
              {inner}
            </Box>
          );
        })}

        <Box sx={{ flexGrow: 1 }} />

        {/* خروج */}
        <Tooltip title="خروج" placement={isRTL ? "left" : "right"}>
          <IconButton onClick={handleLogout} sx={{ color: COLORS.text, alignSelf: "center", mb: 1.5 }}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
