"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
      credentials: "include", // کوکی httpOnly همراه درخواست برود
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
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 12,
        p: 4,
        boxShadow: 2,
        bgcolor: "#fff",
        borderRadius: 3,
      }}
    >
      <Typography fontWeight={700} mb={3}>
        ورود به پنل
      </Typography>

      <TextField
        label="نام کاربری"
        value={form.username}
        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        fullWidth
        margin="dense"
      />

      <TextField
        label="رمز عبور"
        type="password"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        fullWidth
        margin="dense"
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 3 }}>
        ورود
      </Button>
    </Box>
  );
}
