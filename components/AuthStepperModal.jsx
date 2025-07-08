"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Lock,
  Login,
  PersonAdd,
  Close,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const steps = [
  { label: "ورود", icon: <Login /> },
  { label: "ثبت‌نام", icon: <PersonAdd /> },
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
  maxWidth: "90vw",
  minHeight: 420,
  border: "2px solid #D2E7FF",
};

export default function AuthStepperModal({ open, onClose, defaultStep = 0 }) {
  const [activeStep, setActiveStep] = useState(defaultStep);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    name: "",
    family: "",
    mobile: "",
    password: "",
    confirm: "",
    email: "",
  });
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // هر بار مدال باز شد یا defaultStep تغییر کرد، اکتیو تب رو ریست کن
  useEffect(() => {
    if (open) {
      setActiveStep(defaultStep);
      setStepIndex(0);
      setAlert("");
    }
  }, [open, defaultStep]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert("");
    const res = await fetch("/api/login-student", {
      method: "POST",
      body: JSON.stringify({
        mobile: form.mobile,
        password: form.password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      localStorage.setItem("student_mobile", form.mobile);
      const checkProfile = await fetch("/api/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const profile = await checkProfile.json();
      setAlert("ورود موفق! در حال انتقال...");
      setTimeout(() => {
        onClose?.();
        if (profile.onboarding) {
          router.replace("/roadmap");
        } else {
          router.replace("/onboarding");
        }
      }, 1000);
    } else {
      setAlert("شماره یا رمز عبور اشتباه است");
    }
  };

  const handleRegisterNext = (e) => {
    e?.preventDefault?.();
    setAlert("");
    if (stepIndex === 0 && (!form.name || !form.family)) {
      setAlert("نام و نام خانوادگی الزامی است");
      return;
    }
    if (stepIndex === 1 && !/^09\d{9}$/.test(form.mobile)) {
      setAlert("شماره موبایل معتبر وارد کنید");
      return;
    }
    if (
      stepIndex === 2 &&
      (form.password.length < 4 || form.password !== form.confirm)
    ) {
      setAlert("رمز باید حداقل ۴ کاراکتر باشد و با تکرار آن یکسان باشد.");
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  const handleRegisterBack = () => setStepIndex(stepIndex - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert("");
    const checkRes = await fetch("/api/check-user", {
      method: "POST",
      body: JSON.stringify({ mobile: form.mobile }),
      headers: { "Content-Type": "application/json" },
    });
    if (checkRes.ok) {
      const { exists } = await checkRes.json();
      if (exists) {
        setAlert("این شماره قبلاً ثبت شده، وارد شوید.");
        setActiveStep(0);
        setLoading(false);
        return;
      }
    }
    const res = await fetch("/api/register-student", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        family: form.family,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setAlert("ثبت نام با موفقیت انجام شد! در حال انتقال...");
      localStorage.setItem("student_mobile", form.mobile);
      setTimeout(() => {
        onClose?.();
        router.replace("/onboarding");
      }, 1200);
    } else {
      const err = await res.json();
      setAlert(err.error || "خطا در ثبت نام");
    }
  };

  const renderRegisterStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <Box>
            <TextField
              name="name"
              label="نام"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 24 }}
            />
            <TextField
              name="family"
              label="نام خانوادگی"
              fullWidth
              margin="normal"
              value={form.family}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 24 }}
            />
          </Box>
        );
      case 1:
        return (
          <TextField
            name="mobile"
            label="شماره موبایل"
            fullWidth
            margin="normal"
            value={form.mobile}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "mobile",
                  value: e.target.value.replace(/\D/g, "").slice(0, 11),
                },
              })
            }
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 11,
            }}
            required
          />
        );
      case 2:
        return (
          <Box>
            <TextField
              name="password"
              label="رمز عبور"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="confirm"
              label="تکرار رمز عبور"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </Box>
        );
      case 3:
        return (
          <TextField
            name="email"
            label="ایمیل (اختیاری)"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <IconButton
          sx={{ position: "absolute", right: 16, top: 16 }}
          onClick={onClose}
        >
          <Close />
        </IconButton>
        {alert && (
          <Alert
            severity={alert.includes("موفق") ? "success" : "error"}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {alert}
          </Alert>
        )}
        {activeStep === 0 ? (
          <form onSubmit={handleLogin}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#2477F3",
              }}
            >
              <Lock sx={{ fontSize: 24 }} /> ورود به حساب کاربری
            </Typography>
            <TextField
              name="mobile"
              label="شماره موبایل"
              fullWidth
              margin="normal"
              value={form.mobile}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 11),
                }))
              }
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: 11,
              }}
              required
            />
            <TextField
              name="password"
              label="رمز عبور"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                height: 48,
                fontWeight: "bold",
                fontSize: 16,
                bgcolor: "#2477F3",
                "&:hover": {
                  bgcolor: "#1A56DB",
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "ورود"}
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{
                mt: 2,
                fontWeight: "bold",
                color: "#2477F3",
              }}
              onClick={() => {
                setActiveStep(1);
                setStepIndex(0);
                setAlert("");
              }}
            >
              ثبت‌نام دانش‌آموز جدید
            </Button>
          </form>
        ) : (
          <form onSubmit={stepIndex < 3 ? handleRegisterNext : handleRegister}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#66DE93",
              }}
            >
              <PersonAdd sx={{ fontSize: 24 }} /> ثبت‌نام دانش‌آموز جدید
            </Typography>
            {renderRegisterStep()}
            <Box display="flex" gap={2} sx={{ mt: 4 }}>
              {stepIndex > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleRegisterBack}
                  sx={{ flex: 1, borderColor: "#2477F3", color: "#2477F3" }}
                >
                  بازگشت
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                sx={{
                  flex: 2,
                  height: 48,
                  fontWeight: "bold",
                  bgcolor: "#66DE93",
                  color: "#1A2233",
                  "&:hover": {
                    bgcolor: "#4dca80",
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : stepIndex < 3 ? (
                  "مرحله بعد"
                ) : (
                  "ثبت‌نام نهایی"
                )}
              </Button>
            </Box>
            <Button
              fullWidth
              variant="text"
              sx={{
                mt: 2,
                fontWeight: "bold",
                color: "#2477F3",
              }}
              onClick={() => {
                setActiveStep(0);
                setStepIndex(0);
                setAlert("");
              }}
            >
              بازگشت به ورود
            </Button>
          </form>
        )}
      </Box>
    </Modal>
  );
}
