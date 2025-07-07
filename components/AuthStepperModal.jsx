"use client";
import React, { useState } from "react";
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
} from "@mui/material";

const steps = ["ورود", "ثبت‌نام"];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 380,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  maxWidth: "90vw",
};

export default function AuthStepperModal({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0); // 0: ورود، 1: ثبت‌نام
  const [stepIndex, setStepIndex] = useState(0); // برای فرم ثبت‌نام: 0-نام/خانوادگی, 1-موبایل, 2-رمز/تکرار رمز, 3-ایمیل
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

  // هندلینگ فیلدهای ثبت نام
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // لاگین
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert("");
    const res = await fetch("/api/login-student", {
      method: "POST",
      body: JSON.stringify({ mobile: form.mobile, password: form.password }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setAlert("ورود موفق!");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setAlert("شماره یا رمز عبور اشتباه است");
    }
    setLoading(false);
  };

  // ثبت نام stepper
  const handleRegisterNext = async (e) => {
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
    // چک شماره
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
    // ثبت نام
    // وقتی به اینجا رسیدی:
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

    if (res.ok) {
      setAlert("ثبت نام با موفقیت انجام شد! حالا وارد شوید.");
      setActiveStep(0);
      setStepIndex(0);
    } else {
      const err = await res.json();
      setAlert(err.error || "خطا در ثبت نام");
    }
    setLoading(false);
  };

  // UI Stepper ثبت نام
  const renderRegisterStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <>
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
          </>
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
          <>
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
              label="تکرار رمز عبور"
              type="password"
              fullWidth
              margin="normal"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </>
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
        <Stepper activeStep={activeStep} sx={{ mb: 3, direction: "ltr" }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {alert && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {alert}
          </Alert>
        )}
        {activeStep === 0 ? (
          <form onSubmit={handleLogin}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
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
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : "ورود"}
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1, fontWeight: "bold" }}
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
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              ثبت‌نام دانش‌آموز جدید
            </Typography>
            {renderRegisterStep()}
            <Box display="flex" gap={1} sx={{ mt: 2 }}>
              {stepIndex > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleRegisterBack}
                  sx={{ flex: 1 }}
                >
                  بازگشت
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                sx={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={22} />
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
              sx={{ mt: 1, fontWeight: "bold" }}
              onClick={() => {
                setActiveStep(0);
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
