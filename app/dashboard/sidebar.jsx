"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";

import { endpoints } from "../../utils/endpoints";
import { useCurrentUser } from "../../lib/useCurrentUser";

const NAV_LINKS = [
  { href: "/dashboard", icon: <DashboardIcon />, label: "داشبورد", roles: ["admin"] },
  { href: "/dashboard/courses", icon: <SchoolIcon />, label: "دوره‌ها", roles: ["admin", "teacher"] },
  { href: "/dashboard/teachers", icon: <PersonIcon />, label: "اساتید", roles: ["admin"] },
  { href: "/dashboard/students", icon: <GroupOutlinedIcon />, label: "یادگیرندگان", roles: ["admin", "teacher"] },
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

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("sm"));
  const isRTL     = theme.direction === "rtl";
  const { user }  = useCurrentUser();

  const links = useMemo(
    () => NAV_LINKS.filter(l => user && l.roles.includes(user.role)),
    [user]
  );

  const handleLogout = async () => {
    try {
      await fetch(endpoints.logout, { method: "POST", credentials: "include" });
    } finally {
      router.push("/login");
    }
  };

  // حالت باز/بسته دسکتاپ
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem("dashboard_sidebar_collapsed") === "1");
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("dashboard_sidebar_collapsed", next ? "1" : "0");
  };

  // تابع تطبیق active — «داشبورد» فقط برابر دقیق
  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  /* موبایل: Bottom Nav */
  if (isMobile) {
    const currentIndex = Math.max(0, links.findIndex(l => isActive(l.href)));
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          insetInlineStart: 0,
          width: "100vw",
          borderTop: `1px solid ${COLORS.divider}`,
          bgcolor: COLORS.bg,
          zIndex: 1300,
        }}
      >
        <BottomNavigation showLabels={false} value={currentIndex} sx={{ bgcolor: "transparent" }}>
          {links.map((item) => (
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

  /* دسکتاپ */
  const WIDTH = collapsed ? 84 : 220;

  return (
    <Box sx={{ width: WIDTH, flexShrink: 0 }}>
      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 0,
          insetInlineStart: 0,   // RTL-safe
          width: WIDTH,
          height: "100vh",
          bgcolor: COLORS.bg,
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
          zIndex: 1200,
          transition: "width .25s",
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

        {links.map((item) => {
          const active = isActive(item.href);
          return (
            <Tooltip key={item.href} title={collapsed ? item.label : ""} placement={isRTL ? "left" : "right"}>
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
          <IconButton onClick={handleLogout} sx={{ color: COLORS.text, mb: 2, alignSelf: "center" }}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
