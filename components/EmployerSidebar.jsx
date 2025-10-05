"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import LogoutIcon from "@mui/icons-material/Logout";

const Item = ({ href, icon, label, active }) => (
  <Box component={Link} href={href}
    sx={{
      display:"flex", alignItems:"center", gap:1.5,
      px:2, py:1.2, borderRadius:2, color: active ? "#66DE93" : "#fff",
      textDecoration:"none", "&:hover": { background:"#ffffff22" }
    }}>
    {icon}
    <Typography fontWeight="bold">{label}</Typography>
  </Box>
);

export default function EmployerSidebar() {
  const pathname = usePathname();
  const active = (p) => pathname?.startsWith(p);

  const logout = async ()=>{
    await fetch("/api/employer/logout", { method:"POST" });
    window.location.href = "/company/login";
  };

  return (
    <Box sx={{
      width:240, flexShrink:0, position:"fixed", left:0, top:0, bottom:0,
      background:"#1f5bd8", color:"#fff", display:"flex", flexDirection:"column", p:2
    }}>
      <Typography variant="h6" sx={{ fontWeight:"bold", mb:2 }}>پنل کارفرما</Typography>
      <Item href="/company/dashboard" icon={<DashboardIcon />} label="داشبورد" active={active("/company/dashboard")} />
      <Item href="/company/dashboard#post" icon={<WorkIcon />} label="ثبت آگهی" active={false} />
      <Item href="/company/dashboard#myjobs" icon={<WorkIcon />} label="آگهی‌های من" active={false} />
      <Box sx={{ flexGrow:1 }} />
      <Box onClick={logout} sx={{ cursor:"pointer" }}>
        <Item href="#" icon={<LogoutIcon />} label="خروج" active={false} />
      </Box>
    </Box>
  );
}
