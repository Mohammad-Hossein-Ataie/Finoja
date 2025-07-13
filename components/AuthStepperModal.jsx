"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
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
  const [activeStep, setActiveStep] = useState(defaultStep); // 0:login  1:register
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

  // بخش ریست پسورد
  const [forgotStep, setForgotStep] = useState(null);
  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPass, setForgotPass] = useState({ password: "", confirm: "" });

  // بخش ثبت‌نام جدید (OTP)
  const [registerStep, setRegisterStep] = useState(0); // 0:mobile, 1:otp, 2:form
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (open) {
      setActiveStep(defaultStep);
      setAlert("");
      setForgotStep(null);
      setForgotMobile("");
      setForgotOtp("");
      setForgotPass({ password: "", confirm: "" });
      setRegisterStep(0);
      setRegisterMobile("");
      setRegisterOtp("");
      setOtpVerified(false);
      setForm({
        name: "",
        family: "",
        mobile: "",
        password: "",
        confirm: "",
        email: "",
      });
    }
  }, [open, defaultStep]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Login
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
      setAlert("ورود موفق! در حال انتقال...");
      setTimeout(() => {
        onClose?.();
        router.replace("/roadmap");
      }, 1200);
    } else {
      setAlert("شماره یا رمز عبور اشتباه است");
    }
  };

  // ثبت‌نام OTP
  const handleRegisterSendOtp = async () => {
    setLoading(true);
    setAlert("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobile: registerMobile, type: "register" }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setRegisterStep(1);
      setAlert("کد تایید ارسال شد");
    } else {
      setAlert("خطا در ارسال کد!");
    }
  };

  const handleRegisterVerifyOtp = async () => {
    setLoading(true);
    setAlert("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        mobile: registerMobile,
        code: registerOtp,
        type: "register",
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setRegisterStep(2);
      setOtpVerified(true);
      setForm((f) => ({ ...f, mobile: registerMobile }));
      setAlert("");
    } else {
      setAlert("کد اشتباه یا منقضی شده!");
    }
  };

  const handleRegisterForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert("");
    const checkRes = await fetch("/api/check-user", {
      method: "POST",
      body: JSON.stringify({ mobile: registerMobile }),
      headers: { "Content-Type": "application/json" },
    });
    if (checkRes.ok) {
      const { exists } = await checkRes.json();
      if (exists) {
        setAlert("این شماره قبلاً ثبت شده است.");
        setLoading(false);
        return;
      }
    }
    if (form.password.length < 4 || form.password !== form.confirm) {
      setAlert("رمز معتبر نیست.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/register-student", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        family: form.family,
        mobile: registerMobile,
        email: form.email,
        password: form.password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setAlert("ثبت نام با موفقیت انجام شد! در حال انتقال...");
      setTimeout(() => {
        onClose?.();
        router.replace("/onboarding");
      }, 1200);
    } else {
      const err = await res.json();
      setAlert(err.error || "خطا در ثبت نام");
    }
  };

  // Forgot Password Flow
  const handleForgotSendOtp = async () => {
    setLoading(true);
    setAlert("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobile: forgotMobile, type: "forget" }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setForgotStep("otp");
      setAlert("کد تایید ارسال شد.");
    } else {
      setAlert("خطا در ارسال کد! شماره معتبر است؟");
    }
  };

  const handleForgotVerifyOtp = async () => {
    setLoading(true);
    setAlert("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        mobile: forgotMobile,
        code: forgotOtp,
        type: "forget",
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setForgotStep("setpass");
      setAlert("");
    } else {
      setAlert("کد اشتباه است یا منقضی شده.");
    }
  };

  const handleForgotSetPassword = async () => {
    setLoading(true);
    setAlert("");
    if (
      forgotPass.password.length < 4 ||
      forgotPass.password !== forgotPass.confirm
    ) {
      setAlert("رمز باید حداقل ۴ کاراکتر و با تکرار یکی باشد.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({
        mobile: forgotMobile,
        password: forgotPass.password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      setAlert("رمز جدید با موفقیت ثبت شد!");
      setTimeout(() => {
        setForgotStep(null);
        setForgotMobile("");
        setForgotOtp("");
        setForgotPass({ password: "", confirm: "" });
        setActiveStep(0);
        setAlert("");
      }, 1400);
    } else {
      setAlert("خطا در تغییر رمز!");
    }
  };

  // UI
  const renderRegisterStep = () => {
    if (registerStep === 0) {
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            ثبت‌نام دانش‌آموز جدید
          </Typography>
          <TextField
            label="شماره موبایل"
            fullWidth
            value={registerMobile}
            onChange={(e) =>
              setRegisterMobile(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            inputProps={{ maxLength: 11 }}
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading || !/^09\d{9}$/.test(registerMobile)}
            onClick={handleRegisterSendOtp}
          >
            {loading ? <CircularProgress size={24} /> : "ارسال کد تایید"}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setActiveStep(0);
              setRegisterStep(0);
              setAlert("");
            }}
          >
            بازگشت
          </Button>
        </>
      );
    }
    if (registerStep === 1) {
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            کد تایید ثبت‌نام
          </Typography>
          <TextField
            label="کد تایید"
            fullWidth
            value={registerOtp}
            onChange={(e) =>
              setRegisterOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            margin="normal"
            inputProps={{ maxLength: 6 }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading || registerOtp.length !== 6}
            onClick={handleRegisterVerifyOtp}
          >
            {loading ? <CircularProgress size={24} /> : "تایید کد"}
          </Button>
          <Button fullWidth variant="text" onClick={() => setRegisterStep(0)}>
            ویرایش شماره
          </Button>
        </>
      );
    }
    if (registerStep === 2 && otpVerified) {
      return (
        <form onSubmit={handleRegisterForm}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            اطلاعات تکمیلی
          </Typography>
          <TextField
            name="name"
            label="نام"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            name="family"
            label="نام خانوادگی"
            fullWidth
            margin="normal"
            value={form.family}
            onChange={handleChange}
            required
          />
          <TextField
            name="email"
            label="ایمیل (اختیاری)"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            name="password"
            label="رمز عبور"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            required
          />
          <TextField
            name="confirm"
            label="تکرار رمز"
            type="password"
            fullWidth
            margin="normal"
            value={form.confirm}
            onChange={handleChange}
            required
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
            type="submit"
          >
            {loading ? <CircularProgress size={24} /> : "ثبت‌نام نهایی"}
          </Button>
        </form>
      );
    }
    return null;
  };

  const renderForgotStep = () => {
    if (forgotStep === "mobile" || !forgotStep) {
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            فراموشی رمز عبور
          </Typography>
          <TextField
            label="شماره موبایل"
            fullWidth
            value={forgotMobile}
            onChange={(e) =>
              setForgotMobile(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            inputProps={{ maxLength: 11 }}
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading || !/^09\d{9}$/.test(forgotMobile)}
            onClick={handleForgotSendOtp}
          >
            {loading ? <CircularProgress size={24} /> : "ارسال کد تایید"}
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => setForgotStep(null)}
          >
            بازگشت
          </Button>
        </>
      );
    }
    if (forgotStep === "otp") {
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            کد تایید پیامک
          </Typography>
          <TextField
            label="کد تایید"
            fullWidth
            value={forgotOtp}
            onChange={(e) =>
              setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            margin="normal"
            inputProps={{ maxLength: 6 }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading || forgotOtp.length !== 6}
            onClick={handleForgotVerifyOtp}
          >
            {loading ? <CircularProgress size={24} /> : "تایید کد"}
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => setForgotStep("mobile")}
          >
            بازگشت
          </Button>
        </>
      );
    }
    if (forgotStep === "setpass") {
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            تعیین رمز جدید
          </Typography>
          <TextField
            label="رمز جدید"
            type="password"
            fullWidth
            margin="normal"
            value={forgotPass.password}
            onChange={(e) =>
              setForgotPass((f) => ({ ...f, password: e.target.value }))
            }
          />
          <TextField
            label="تکرار رمز جدید"
            type="password"
            fullWidth
            margin="normal"
            value={forgotPass.confirm}
            onChange={(e) =>
              setForgotPass((f) => ({ ...f, confirm: e.target.value }))
            }
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
            onClick={handleForgotSetPassword}
          >
            {loading ? <CircularProgress size={24} /> : "ذخیره رمز جدید"}
          </Button>
        </>
      );
    }
    return null;
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
        {/* فراموشی رمز عبور */}
        {forgotStep !== null ? (
          renderForgotStep()
        ) : activeStep === 0 ? (
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
                setRegisterStep(0);
                setAlert("");
              }}
            >
              ثبت‌نام دانش‌آموز جدید
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setForgotStep("mobile");
                setAlert("");
              }}
            >
              فراموشی رمز عبور
            </Button>
          </form>
        ) : (
          renderRegisterStep()
        )}
      </Box>
    </Modal>
  );
}
