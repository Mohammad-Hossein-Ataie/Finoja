// components/EmployerSidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BusinessIcon from "@mui/icons-material/Business";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

const Item = ({ href, icon, label, active, collapsed }) => {
  const Inner = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 1.2,
        px: collapsed ? 1.2 : 2,
        py: 1.1,
        borderRadius: 2,
        color: active ? "#0A2E5D" : "#E6F0FF",
        textDecoration: "none",
        "&:hover": { bgcolor: "rgba(255,255,255,0.10)" },
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      <Box sx={{ display: "grid", placeItems: "center" }}>{icon}</Box>
      {!collapsed && <Typography sx={{ fontSize: 14, fontWeight: active ? 800 : 600 }}>{label}</Typography>}
    </Box>
  );
  return collapsed ? (
    <Tooltip placement="right" title={label}><Box component={Link} href={href} sx={{ textDecoration: "none" }}>{Inner}</Box></Tooltip>
  ) : (
    <Box component={Link} href={href} sx={{ textDecoration: "none" }}>{Inner}</Box>
  );
};

export default function EmployerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const active = (p) => pathname === p || pathname?.startsWith(p + "/");

  // نگهداری وضعیت در localStorage و قراردادن CSS variable برای layout
  useEffect(() => {
    const saved = localStorage.getItem("empSidebarCollapsed");
    setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("empSidebarCollapsed", collapsed ? "1" : "0");
    const w = collapsed ? "80px" : "260px";
    document.documentElement.style.setProperty("--emp-sidebar-w", w);
  }, [collapsed]);

  const logout = async () => {
    try { await fetch("/api/employer/logout", { method: "POST" }); } catch {}
    location.href = "/company/login";
  };

  return (
    <Box
      sx={{
        width: collapsed ? 80 : 260,
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: "linear-gradient(180deg, #1F5BD8 0%, #0A2E5D 100%)",
        color: "#E6F0FF",
        display: "flex",
        flexDirection: "column",
        p: 1.5,
        boxShadow: 3,
        zIndex: 10,
        transition: "width 180ms ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 32, height: 32, bgcolor: "#66DE93", borderRadius: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>پنل کارفرما</Typography>
          </Box>
        )}
        <IconButton size="small" onClick={() => setCollapsed(s => !s)} sx={{ color: "#E6F0FF" }}>
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Box>

      <Item href="/company/dashboard" icon={<DashboardIcon fontSize="small" />} label="داشبورد" active={active("/company/dashboard")} collapsed={collapsed} />
      <Item href="/company/profile" icon={<BusinessIcon fontSize="small" />} label="پروفایل شرکت" active={active("/company/profile")} collapsed={collapsed} />
      <Item href="/company/jobs/new" icon={<WorkIcon fontSize="small" />} label="ثبت آگهی" active={active("/company/jobs/new")} collapsed={collapsed} />
      <Item href="/company/applications" icon={<AssignmentIndIcon fontSize="small" />} label="درخواست‌ها" active={active("/company/applications")} collapsed={collapsed} />

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="خروج">
        <IconButton onClick={logout} sx={{ color: "#E6F0FF", alignSelf: "center" }}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
