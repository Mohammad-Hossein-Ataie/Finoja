"use client";
import { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  Typography,
  Divider,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { endpoints } from "@/utils/endpoints";

const navLinks = [
  { href: "/dashboard", icon: <DashboardIcon />, label: "داشبورد" },
  { href: "/dashboard/courses", icon: <SchoolIcon />, label: "دوره‌ها" },
  { href: "/dashboard/teachers", icon: <PersonIcon />, label: "اساتید" },
];

export default function Sidebar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  /* ---------- خروج ---------- */
  const handleLogout = async () => {
    try {
      await fetch(endpoints.logout, {
        method: "POST",
        credentials: "include",   // کوکی httpOnly ارسال شود
      });
    } finally {
      router.push("/login");
    }
  };

  /* ---------- محتوای اصلی سایدبار ---------- */
  const SidebarContent = (
    <Box
      sx={{
        width: 220,
        height: { xs: "100vh", md: "100%" },
        bgcolor: "#23272f",
        color: "#fff",
        p: 2,
        direction: "rtl",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={900}
        mb={2}
        sx={{ textAlign: "center", letterSpacing: 2, fontFamily: "inherit" }}
      >
        فیـــنــوجـا
      </Typography>

      <Divider sx={{ bgcolor: "#444", mb: 1 }} />

      <List sx={{ mt: 2, flexGrow: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.href} disablePadding>
            <Link
              href={link.href}
              style={{ width: "100%", display: "block", textDecoration: "none" }}
            >
              <ListItemButton
                selected={pathname === link.href}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: pathname === link.href ? "#121B25" : "inherit",
                  color: "#fff",
                  justifyContent: "flex-end",
                  "& .MuiListItemIcon-root": { minWidth: "32px", ml: 1 },
                  px: 2,
                }}
              >
                <ListItemText
                  primary={link.label}
                  sx={{
                    textAlign: "right",
                    fontWeight: pathname === link.href ? 900 : 500,
                  }}
                />
                <ListItemIcon sx={{ color: "#bbb", minWidth: 0, ml: 0.5 }}>
                  {link.icon}
                </ListItemIcon>
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      {/* دکمه خروج پایین سایدبار */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ bgcolor: "#444", mb: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "error.main",
              justifyContent: "flex-end",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              "& .MuiListItemIcon-root": { minWidth: "32px", ml: 1 },
              px: 2,
            }}
          >
            <ListItemText
              primary="خروج"
              sx={{ textAlign: "right", fontWeight: 700 }}
            />
            <ListItemIcon sx={{ color: "error.main", minWidth: 0, ml: 0.5 }}>
              <LogoutIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  /* ---------- موبایل ---------- */
  if (isMobile) {
    return (
      <>
        {/* نوار بالای موبایل */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#23272f",
            color: "#fff",
            px: 2,
            py: 1.2,
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <Typography
            fontWeight={900}
            sx={{
              fontSize: 20,
              letterSpacing: 2,
              fontFamily: "inherit",
              flex: 1,
              textAlign: "center",
            }}
          >
            فیـــنــوجـا
          </Typography>
          <IconButton onClick={() => setOpen(true)} sx={{ color: "#fff", ml: 1 }}>
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* دراور راست به چپ */}
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: "#23272f",
              color: "#fff",
              width: 240,
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
              boxShadow: 8,
              direction: "rtl",
            },
          }}
          ModalProps={{ keepMounted: true, disableScrollLock: false }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              pb: 0,
            }}
          >
            <Typography fontWeight={900} sx={{ fontSize: 18, letterSpacing: 2 }}>
              منو
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </Box>
          {SidebarContent}
        </Drawer>
      </>
    );
  }

  /* ---------- دسکتاپ ---------- */
  return (
    <Box
      sx={{
        minHeight: "100vh",
        boxShadow: 3,
        bgcolor: "#23272f",
        color: "#fff",
        direction: "rtl",
      }}
    >
      {SidebarContent}
    </Box>
  );
}
