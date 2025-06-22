"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      // بعد از لاگین باید نقش را از API بگیری!
      const user = await fetch("/api/auth/me", { credentials: "include" }).then(
        (r) => r.json()
      );
      if (user.role === "admin") {
        router.replace("/dashboard");
      } else if (user.role === "teacher") {
        router.replace("/dashboard/courses");
      } else if (user.role === "student") {
        router.replace("/dashboard/student");
      } else {
        router.replace("/login");
      }
      return;
    } else {
      const { error } = await res.json();
      setError(error || "ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید.");
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "linear-gradient(120deg,#f8fafc 60%,#e3e8f1 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          minWidth: { xs: 320, sm: 390 },
          bgcolor: "#fff",
          boxShadow: "0 8px 32px 0 rgba(34, 51, 84, 0.10)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            mb: 2,
            textAlign: "center",
            width: "100%",
            letterSpacing: 2,
            userSelect: "none",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              color: "#223354",
              letterSpacing: 3,
              fontFamily: "inherit",
              mb: 0.5,
              fontSize: 28,
            }}
          >
            ورود به سامانه فینوجا
          </Typography>
          <Typography color="text.secondary" fontWeight={600} sx={{ fontSize: 15 }}>
            لطفاً نام کاربری و رمز عبور خود را وارد کنید
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="نام کاربری"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            fullWidth
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon color="primary" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontWeight: 700, fontSize: 18 },
            }}
            variant="outlined"
            autoComplete="username"
            disabled={submitting}
            required
          />

          <TextField
            label="رمز عبور"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            fullWidth
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    tabIndex={-1}
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontWeight: 700, fontSize: 18 },
            }}
            variant="outlined"
            autoComplete="current-password"
            disabled={submitting}
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            endIcon={submitting ? <CircularProgress color="inherit" size={22} /> : <LoginIcon />}
            sx={{
              mt: 3,
              fontWeight: 900,
              fontSize: 18,
              borderRadius: 3,
              boxShadow: 3,
              minHeight: 50,
              background: "linear-gradient(90deg, #223354 20%, #121B25 100%)",
              transition: "background 0.4s",
              "&:hover": {
                background: "linear-gradient(90deg, #121B25 0%, #223354 100%)",
              },
            }}
            disabled={submitting}
          >
            {submitting ? "در حال ورود..." : "ورود"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
