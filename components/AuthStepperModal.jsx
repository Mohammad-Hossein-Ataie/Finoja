// components/AuthStepperModal.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  Collapse,
  Container,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Lock,
  Close,
  Visibility,
  VisibilityOff,
  PhoneIphone,
  Key as KeyIcon,
  TaskAlt,
  Email as EmailIcon,
  Person as PersonIcon,
  PersonOutline,
} from "@mui/icons-material";

/* ------------------ Styles ------------------ */
const modalBoxStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
  maxWidth: "92vw",
  minHeight: 420,
  border: "2px solid #D2E7FF",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  outline: "none",
};

// کارت صفحه کامل
const pageWrapStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, rgba(210,231,255,0.35) 0%, rgba(255,255,255,0.7) 100%)",
  padding: "24px 16px",
};
const pageCardStyle = {
  width: "100%",
  maxWidth: 480,
  bgcolor: "background.paper",
  borderRadius: 3,
  p: 4,
  border: "2px solid #D2E7FF",
};

export default function AuthStepperModal({
  open = false,
  onClose,
  defaultStep = 0, // 0:login  1:register
  asPage = false,
}) {
  const [activeStep, setActiveStep] = useState(defaultStep);
  const [form, setForm] = useState({
    name: "",
    family: "",
    mobile: "",
    password: "",
    confirm: "",
    email: "",
  });
  const [alert, setAlert] = useState(null);
  const notify = (text, severity = "info") => setAlert({ text, severity });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // فراموشی رمز
  const [forgotStep, setForgotStep] = useState(null);
  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPass, setForgotPass] = useState({ password: "", confirm: "" });

  // ثبت‌نام (OTP)
  const [registerStep, setRegisterStep] = useState(0);
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const router = useRouter();

  /* ------------------ Reset on open/variant change ------------------ */
  useEffect(() => {
    // هم وقتی مودال باز می‌شود و هم وقتی به‌عنوان صفحه استفاده می‌شود ریست کن
    if (open || asPage) {
      setActiveStep(defaultStep);
      setAlert(null);
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
  }, [open, asPage, defaultStep]);

  /* ------------------ Helpers ------------------ */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const isValidMobile = (m) => /^09\d{9}$/.test(m);
  const onlyDigits = (v, max) => v.replace(/\D/g, "").slice(0, max);

  /* ------------------ Login ------------------ */
  const loginDisabled = useMemo(
    () => !isValidMobile(form.mobile) || !form.password || loading,
    [form.mobile, form.password, loading]
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/login-student", {
        method: "POST",
        body: JSON.stringify({
          mobile: form.mobile,
          password: form.password,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        // اختیاری: ذخیره موبایل در localStorage
        try {
          localStorage.setItem("student_mobile", form.mobile);
        } catch {}
        notify("ورود موفق! در حال انتقال...", "success");
        setTimeout(() => {
          onClose?.();
          router.replace("/student");
        }, 800);
      } else {
        const j = await res.json().catch(() => ({}));
        notify(j.error || "شماره یا رمز عبور اشتباه است", "error");
      }
    } catch {
      notify("خطایی رخ داد. اتصال اینترنت را بررسی کنید.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Register: Send OTP ------------------ */
  const canSendRegisterOtp =
    isValidMobile(registerMobile) && !loading && registerStep === 0;

  const handleRegisterSendOtp = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        body: JSON.stringify({ mobile: registerMobile, type: "register" }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setRegisterStep(1);
        notify("کد تایید ارسال شد", "success");
      } else {
        notify("خطا در ارسال کد!", "error");
      }
    } catch {
      notify("خطا در ارسال کد!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Register: Verify OTP ------------------ */
  const canVerifyRegisterOtp =
    registerStep === 1 && registerOtp.length === 6 && !loading;

  const handleRegisterVerifyOtp = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          mobile: registerMobile,
          code: registerOtp,
          type: "register",
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setRegisterStep(2);
        setOtpVerified(true);
        setForm((f) => ({ ...f, mobile: registerMobile }));
        setAlert(null);
      } else {
        notify("کد اشتباه یا منقضی شده!", "error");
      }
    } catch {
      notify("کد اشتباه یا منقضی شده!", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Register: Final form ------------------ */
  const canSubmitFinalRegister =
    registerStep === 2 &&
    otpVerified &&
    form.name.trim() &&
    form.family.trim() &&
    form.password &&
    form.confirm &&
    !loading;

  const handleRegisterForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const checkRes = await fetch("/api/check-user", {
        method: "POST",
        body: JSON.stringify({ mobile: registerMobile }),
        headers: { "Content-Type": "application/json" },
      });
      if (checkRes.ok) {
        const { exists } = await checkRes.json();
        if (exists) {
          notify("این شماره قبلاً ثبت شده است.", "error");
          setLoading(false);
          return;
        }
      }

      if (form.password.length < 4 || form.password !== form.confirm) {
        notify("رمز معتبر نیست.", "error");
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

      if (res.ok) {
        notify("ثبت‌نام با موفقیت انجام شد! در حال انتقال...", "success");
        setTimeout(() => {
          onClose?.();
          // کاربر تازه ثبت‌نام شده -> به آنبوردینگ
          router.replace("/onboarding");
        }, 800);
      } else {
        const err = await res.json().catch(() => ({}));
        notify(err.error || "خطا در ثبت نام", "error");
      }
    } catch {
      notify("خطا در ثبت نام", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Forgot Password ------------------ */
  const [forgotLoading, setForgotLoading] = useState(false);
  const canSendForgotOtp =
    /^09\d{9}$/.test(forgotMobile) && !forgotLoading;

  const handleForgotSendOtp = async () => {
    setForgotLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        body: JSON.stringify({ mobile: forgotMobile, type: "forget" }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setForgotStep("otp");
        notify("کد تایید ارسال شد.", "success");
      } else {
        notify("خطا در ارسال کد! شماره معتبر است؟", "error");
      }
    } catch {
      notify("خطا در ارسال کد! شماره معتبر است؟", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const canVerifyForgotOtp = forgotOtp.length === 6 && !forgotLoading;

  const handleForgotVerifyOtp = async () => {
    setForgotLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          mobile: forgotMobile,
          code: forgotOtp,
          type: "forget",
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setForgotStep("setpass");
        setAlert(null);
      } else {
        notify("کد اشتباه است یا منقضی شده.", "error");
      }
    } catch {
      notify("کد اشتباه است یا منقضی شده.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const canSaveNewPass =
    forgotPass.password &&
    forgotPass.confirm &&
    forgotPass.password === forgotPass.confirm &&
    forgotPass.password.length >= 4 &&
    !forgotLoading;

  const handleForgotSetPassword = async () => {
    setForgotLoading(true);
    setAlert(null);
    if (
      forgotPass.password.length < 4 ||
      forgotPass.password !== forgotPass.confirm
    ) {
      notify("رمز باید حداقل ۴ کاراکتر و با تکرار یکی باشد.", "error");
      setForgotLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({
          mobile: forgotMobile,
          password: forgotPass.password,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        notify("رمز جدید با موفقیت ثبت شد!", "success");
        setTimeout(() => {
          setForgotStep(null);
          setForgotMobile("");
          setForgotOtp("");
          setForgotPass({ password: "", confirm: "" });
          setActiveStep(0);
          setAlert(null);
        }, 900);
      } else {
        notify("خطا در تغییر رمز!", "error");
      }
    } catch {
      notify("خطا در تغییر رمز!", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  /* ------------------ UI: Register Steps ------------------ */
  const renderRegisterStep = () => {
    if (registerStep === 0) {
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            ثبت‌نام یادگیرنده جدید
          </Typography>
          <TextField
            label="شماره موبایل"
            fullWidth
            value={registerMobile}
            onChange={(e) =>
              setRegisterMobile(onlyDigits(e.target.value, 11))
            }
            inputProps={{
              maxLength: 11,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            margin="normal"
            error={Boolean(registerMobile) && !isValidMobile(registerMobile)}
            helperText={
              registerMobile && !isValidMobile(registerMobile)
                ? "شماره موبایل نامعتبر است."
                : " "
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphone fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={!canSendRegisterOtp}
            onClick={handleRegisterSendOtp}
          >
            {loading ? <CircularProgress size={24} /> : "ارسال کد تایید"}
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            onClick={() => {
              setActiveStep(0);
              setRegisterStep(0);
              setAlert(null);
            }}
          >
            قبلاً ثبت‌نام کرده‌ام!
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
            onChange={(e) => setRegisterOtp(onlyDigits(e.target.value, 6))}
            margin="normal"
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            error={Boolean(registerOtp) && registerOtp.length !== 6}
            helperText={
              registerOtp && registerOtp.length !== 6
                ? "کد شش رقمی را کامل وارد کنید."
                : " "
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TaskAlt fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={!canVerifyRegisterOtp}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="family"
            label="نام خانوادگی"
            fullWidth
            margin="normal"
            value={form.family}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="email"
            label="ایمیل (اختیاری)"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
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
            error={Boolean(form.password) && form.password.length < 4}
            helperText={
              form.password && form.password.length < 4
                ? "حداقل ۴ کاراکتر"
                : " "
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
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
            error={Boolean(form.confirm) && form.confirm !== form.password}
            helperText={
              form.confirm && form.confirm !== form.password
                ? "با رمز عبور برابر نیست"
                : " "
            }
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={!canSubmitFinalRegister}
            type="submit"
          >
            {loading ? <CircularProgress size={24} /> : "ثبت‌نام نهایی"}
          </Button>
        </form>
      );
    }
    return null;
  };

  /* ------------------ UI: Forgot Steps ------------------ */
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
            onChange={(e) => setForgotMobile(onlyDigits(e.target.value, 11))}
            inputProps={{
              maxLength: 11,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            margin="normal"
            error={Boolean(forgotMobile) && !/^09\d{9}$/.test(forgotMobile)}
            helperText={
              forgotMobile && !/^09\d{9}$/.test(forgotMobile)
                ? "شماره موبایل نامعتبر است."
                : " "
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphone fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={!canSendForgotOtp}
            onClick={handleForgotSendOtp}
          >
            {forgotLoading ? <CircularProgress size={24} /> : "ارسال کد تایید"}
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
            onChange={(e) => setForgotOtp(onlyDigits(e.target.value, 6))}
            margin="normal"
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            error={Boolean(forgotOtp) && forgotOtp.length !== 6}
            helperText={
              forgotOtp && forgotOtp.length !== 6
                ? "کد شش رقمی را کامل وارد کنید."
                : " "
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TaskAlt fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={!canVerifyForgotOtp}
            onClick={handleForgotVerifyOtp}
          >
            {forgotLoading ? <CircularProgress size={24} /> : "تایید کد"}
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
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={forgotPass.password}
            onChange={(e) =>
              setForgotPass((f) => ({ ...f, password: e.target.value }))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
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
            error={
              Boolean(forgotPass.confirm) &&
              forgotPass.confirm !== forgotPass.password
            }
            helperText={
              forgotPass.confirm && forgotPass.confirm !== forgotPass.password
                ? "با رمز جدید برابر نیست"
                : " "
            }
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={!canSaveNewPass}
            onClick={handleForgotSetPassword}
          >
            {forgotLoading ? <CircularProgress size={24} /> : "ذخیره رمز جدید"}
          </Button>
        </>
      );
    }
    return null;
  };

  const Inner = (
    <Box sx={{ position: "relative" }}>
      {/* اعلان‌ها */}
      <Collapse in={Boolean(alert)}>
        {alert && (
          <Alert
            severity={alert.severity}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setAlert(null)}
          >
            {alert.text}
          </Alert>
        )}
      </Collapse>

      {/* فراموشی رمز عبور یا ورود/ثبت‌نام */}
      {forgotStep !== null ? (
        renderForgotStep()
      ) : activeStep === 0 ? (
        <form onSubmit={handleLogin} noValidate>
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
            <Lock sx={{ fontSize: 24 }} />
            ورود به حساب کاربری
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
                mobile: onlyDigits(e.target.value, 11),
              }))
            }
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 11,
            }}
            required
            error={Boolean(form.mobile) && !isValidMobile(form.mobile)}
            helperText={
              form.mobile && !isValidMobile(form.mobile)
                ? "شماره موبایل نامعتبر است."
                : " "
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphone fontSize="small" />
                </InputAdornment>
              ),
            }}
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
                    aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon fontSize="small" />
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
              "&:hover": { bgcolor: "#1A56DB" },
            }}
            disabled={loginDisabled}
          >
            {loading ? <CircularProgress size={24} /> : "ورود"}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2, fontWeight: "bold", color: "#2477F3" }}
            onClick={() => {
              setActiveStep(1);
              setRegisterStep(0);
              setAlert(null);
            }}
          >
            ثبت‌نام یادگیرنده جدید
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setForgotStep("mobile");
              setAlert(null);
            }}
          >
            فراموشی رمز عبور
          </Button>
        </form>
      ) : (
        renderRegisterStep()
      )}
    </Box>
  );

  if (asPage) {
    return (
      <Box sx={pageWrapStyle}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={pageCardStyle}>
            {/* عنوان صفحه */}
            <Typography
              variant="h5"
              sx={{ mb: 2.5, fontWeight: "bold", textAlign: "center" }}
            >
              ورود / ثبت‌نام فینوجا
            </Typography>
            {Inner}
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalBoxStyle}>
        <IconButton
          sx={{ position: "absolute", right: 12, top: 12 }}
          onClick={onClose}
          aria-label="بستن"
        >
          <Close />
        </IconButton>
        {Inner}
      </Box>
    </Modal>
  );
}