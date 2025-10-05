// app/company/login/LoginClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box, Container, Paper, Typography, Button, TextField, Grid, Alert,
  MenuItem, Select, FormControl, InputLabel, CircularProgress,
  InputAdornment, IconButton, Tabs, Tab, Stack
} from "@mui/material";
import { IR_FIELDS, IR_PROVINCES } from "../../../utils/iran";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import EditIcon from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const onlyDigits = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);

export default function EmployerAuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") || "/company/dashboard";

  const [tab, setTab] = useState(0); // 0: ورود، 1: ثبت‌نام
  const [alert, setAlert] = useState(null);
  const notify = (text, sev="info") => setAlert({ text, sev });

  // ======================
  // Login: password OR OTP
  // ======================
  const [loginForm, setLoginForm] = useState({ mobile: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // OTP sub-flow
  const [otpMode, setOtpMode] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginCodeBoxes, setLoginCodeBoxes] = useState(["","","","","",""]);
  const [loginSending, setLoginSending] = useState(false);
  const [loginCountdown, setLoginCountdown] = useState(0);

  const loginOtpValue = useMemo(()=> loginCodeBoxes.join(""), [loginCodeBoxes]);

  useEffect(()=>{
    if (loginCountdown <= 0) return;
    const t = setInterval(()=> setLoginCountdown(s=> (s>0? s-1:0)), 1000);
    return ()=> clearInterval(t);
  }, [loginCountdown]);

  const resetOtpState = () => {
    setOtpMode(false);
    setLoginOtpSent(false);
    setLoginCountdown(0);
    setLoginCodeBoxes(["","","","","",""]);
  };

  const doPasswordLogin = async () => {
    setAlert(null);
    if (!/^09\d{9}$/.test(loginForm.mobile) || !loginForm.password) {
      return notify("شماره موبایل و رمز عبور را کامل وارد کنید.", "error");
    }
    try {
      setLoginLoading(true);
      const res = await fetch("/api/employer/login", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(loginForm),
      });
      if (res.ok) router.replace(nextUrl);
      else {
        const d = await res.json().catch(()=>({}));
        notify(d.error || "ورود ناموفق. می‌توانید با کد یکبارمصرف وارد شوید.", "error");
      }
    } finally { setLoginLoading(false); }
  };

  const sendLoginOtp = async () => {
    setAlert(null);
    if (!/^09\d{9}$/.test(loginForm.mobile)) return notify("شماره موبایل را صحیح وارد کنید.", "error");
    try {
      setLoginSending(true);
      const res = await fetch("/api/employer/send-otp", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ mobile: loginForm.mobile, purpose: "employer_login" })
      });
      const d = await res.json().catch(()=>({}));
      if (res.ok) {
        setLoginOtpSent(true);
        setLoginCountdown(d?.cooldown || 90);
        notify("کد تایید ارسال شد.", "success");
      } else {
        notify(d.error || "خطا در ارسال کد", "error");
      }
    } finally { setLoginSending(false); }
  };

  const loginWithOtp = async () => {
    setAlert(null);
    if (loginOtpValue.length !== 6) return notify("کد ۶ رقمی را کامل وارد کنید.", "error");
    const res = await fetch("/api/employer/login-otp", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ step: "verify", mobile: loginForm.mobile, code: loginOtpValue })
    });
    const d = await res.json().catch(()=>({}));
    if (res.ok) router.replace(nextUrl);
    else notify(d.error || "ورود ناموفق", "error");
  };

  // ======================
  // Register (PASSWORD REQUIRED)
  // ======================
  const [form, setForm] = useState({
    companyName: "",
    field: "",
    fieldOther: "",
    province: "",
    city: "",
    website: "",
    name: "",
    email: "",
    mobile: "",
    otpCode: "",
    password: "",
    confirmPassword: "",
  });
  const setField = (k,v)=>setForm(f=>({...f,[k]:v}));
  const [regSending, setRegSending] = useState(false);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regCountdown, setRegCountdown] = useState(0);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);

  useEffect(()=>{
    if (regCountdown <= 0) return;
    const t = setInterval(()=> setRegCountdown(s=> (s>0? s-1:0)), 1000);
    return ()=> clearInterval(t);
  }, [regCountdown]);

  const cities = useMemo(()=>{
    const p = IR_PROVINCES.find(x=>x.name===form.province);
    return p ? p.cities : [];
  }, [form.province]);

  const sendRegisterOtp = async () => {
    setAlert(null);
    if (!/^09\d{9}$/.test(form.mobile)) return notify("شماره موبایل مدیر را صحیح وارد کنید.", "error");
    try {
      setRegSending(true);
      const res = await fetch("/api/employer/send-otp", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ mobile: form.mobile, purpose: "employer_register" })
      });
      const d = await res.json().catch(()=>({}));
      if (res.ok) {
        setRegOtpSent(true);
        setRegCountdown(d?.cooldown || 90);
        notify("کد تایید ارسال شد.", "success");
      } else {
        notify(d.error || "خطا در ارسال کد", "error");
      }
    } finally { setRegSending(false); }
  };

  const register = async () => {
    setAlert(null);
    if (!form.companyName.trim()) return notify("نام شرکت الزامی است.", "error");
    if (!form.province || !form.city) return notify("استان و شهر را انتخاب کنید.", "error");
    if (!/^09\d{9}$/.test(form.mobile)) return notify("شماره موبایل مدیر را صحیح وارد کنید.", "error");
    if (form.otpCode.length !== 6) return notify("کد ۶ رقمی ثبت‌نام را وارد کنید.", "error");
    if (!form.password || form.password.length < 6) {
      return notify("رمز عبور الزامی است و باید حداقل ۶ کاراکتر باشد.", "error");
    }
    if (form.password !== form.confirmPassword) {
      return notify("تایید رمز عبور صحیح نیست.", "error");
    }

    const finalField = form.field === "سایر" ? (form.fieldOther?.trim() || "سایر") : form.field;
    const res = await fetch("/api/employer/register", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        field: finalField,
        country: "ایران",
        city: form.city,
        website: form.website,
        employer: { name: form.name, email: form.email, mobile: form.mobile },
        otpCode: form.otpCode,
        password: form.password,
      }),
    });
    const d = await res.json().catch(()=>({}));
    if (res.ok) router.replace("/company/dashboard");
    else notify(d.error || "ثبت‌نام ناموفق", "error");
  };

  return (
    <Box sx={{ minHeight:"100svh", display:"grid", placeItems:"center", p:2, bgcolor:"#f7f9fc" }}>
      <Container maxWidth="sm">
        <Paper sx={{ p:3, borderRadius:3, border:"1px solid #e5eefc" }}>
          <Typography variant="h5" sx={{ fontWeight:"bold", mb:2, textAlign:"center" }}>
            ورود / ثبت‌نام کارفرما
          </Typography>

          {/* یک محل واحد برای پیام‌ها تا دوبار نشان داده نشود */}
          {alert && <Alert severity={alert.sev} sx={{ mb:2, borderRadius:2 }}>{alert.text}</Alert>}

          <Tabs value={tab} onChange={(_, v)=> setTab(v)} sx={{ mb: 2 }}>
            <Tab label="ورود" />
            <Tab label="ثبت‌نام" />
          </Tabs>

          {/* ========== TAB 0: LOGIN ========== */}
          {tab === 0 && (
            <Box sx={{ display:"grid", gap:1.5 }}>
              {/* موبایل همیشه قابل ویرایش */}
              <TextField
                label="موبایل"
                value={loginForm.mobile}
                onChange={e=>setLoginForm({...loginForm, mobile: onlyDigits(e.target.value, 11)})}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon fontSize="small" /></InputAdornment> }}
              />

              {/* اگر در حالت OTP نیستیم، فیلد رمز را نشان بده */}
              {!otpMode && (
                <>
                  <TextField
                    type={showPass ? "text" : "password"}
                    label="رمز عبور"
                    value={loginForm.password}
                    onChange={e=>setLoginForm({...loginForm, password: e.target.value})}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={()=> setShowPass(s=>!s)}>
                            {showPass ? <VisibilityOff/> : <Visibility/>}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button variant="contained" onClick={doPasswordLogin} disabled={loginLoading}>
                    {loginLoading ? <CircularProgress size={22}/> : "ورود"}
                  </Button>
                </>
              )}

              <Typography variant="caption" sx={{ textAlign:"center", color:"text.secondary", my:0.5 }}>
                — یا —
              </Typography>

              {/* بلاک OTP */}
              {!otpMode ? (
                <Button variant="text" onClick={()=>{ setOtpMode(true); setAlert(null); }}>
                  ورود با کد یکبارمصرف
                </Button>
              ) : (
                <Box sx={{ display:"grid", gap:1 }}>
                  {!loginOtpSent ? (
                    <>
                      <Typography variant="body2">کد ورود پیامکی به همین شماره ارسال می‌شود.</Typography>
                      <Box sx={{ display:"flex", gap:1 }}>
                        <Button fullWidth variant="outlined" onClick={resetOtpState}>ورود با رمز عبور</Button>
                        <Button fullWidth variant="contained" onClick={sendLoginOtp}
                                disabled={loginSending || loginForm.mobile.length!==11}>
                          {loginSending ? <CircularProgress size={22}/> : "ارسال کد"}
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>کد تایید ارسال‌شده را وارد کنید</Typography>
                        <IconButton title="ویرایش شماره" onClick={()=>{ setLoginOtpSent(false); setLoginCountdown(0); setLoginCodeBoxes(["","","","","",""]); }}>
                          <EditIcon />
                        </IconButton>
                      </Box>

                      {/* ورودی‌های OTP چپ به راست */}
                      <Box dir="rtl ">
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ direction:"rtl" }}>
                          {loginCodeBoxes.map((v, i) => (
                            <TextField
                              key={i}
                              value={v}
                              onChange={(e) => {
                                const val = onlyDigits(e.target.value, 1);
                                const next = [...loginCodeBoxes];
                                next[i] = val;
                                setLoginCodeBoxes(next);
                                if (val && i < 5) document.getElementById(`login-otp-${i+1}`)?.focus();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Backspace" && !loginCodeBoxes[i] && i > 0) {
                                  document.getElementById(`login-otp-${i-1}`)?.focus();
                                }
                              }}
                              id={`login-otp-${i}`}
                              inputProps={{
                                inputMode:"numeric",
                                pattern:"[0-9]*",
                                maxLength: 1,
                                style:{ direction:"ltr", textAlign:"center", fontSize:20, width:36 }
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <Typography variant="caption" color="text.secondary">
                          {loginCountdown>0 ? `ارسال مجدد تا ${loginCountdown} ثانیه` : "می‌توانید دوباره ارسال کنید."}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="text" onClick={resetOtpState}>
                            ورود با رمز عبور
                          </Button>
                          <Button size="small" variant="text" disabled={loginCountdown>0} onClick={sendLoginOtp}>
                            ارسال مجدد
                          </Button>
                        </Stack>
                      </Box>

                      <Button variant="contained" onClick={loginWithOtp} disabled={loginOtpValue.length!==6}>
                        ورود
                      </Button>
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* ========== TAB 1: REGISTER (password REQUIRED) ========== */}
          {tab === 1 && (
            <Box sx={{ display:"grid", gap:1.5 }}>
              <TextField label="نام شرکت" value={form.companyName} onChange={e=>setField("companyName", e.target.value)} />

              <FormControl fullWidth>
                <InputLabel>حوزه فعالیت</InputLabel>
                <Select label="حوزه فعالیت" value={form.field} onChange={e=>setField("field", e.target.value)}>
                  {IR_FIELDS.map((x)=> <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </Select>
              </FormControl>
              {form.field==="سایر" && (
                <TextField label="شرح حوزه فعالیت" value={form.fieldOther} onChange={e=>setField("fieldOther", e.target.value)} />
              )}

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>استان</InputLabel>
                    <Select label="استان" value={form.province} onChange={e=>{ setField("province", e.target.value); setField("city",""); }}>
                      {IR_PROVINCES.map(p=><MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth disabled={!form.province}>
                    <InputLabel>شهر</InputLabel>
                    <Select label="شهر" value={form.city} onChange={e=>setField("city", e.target.value)}>
                      {cities.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField label="وب‌سایت (اختیاری)" value={form.website} onChange={e=>setField("website", e.target.value)} />
              <TextField label="نام مدیر" value={form.name} onChange={e=>setField("name", e.target.value)} />
              <TextField label="ایمیل (اختیاری)" value={form.email} onChange={e=>setField("email", e.target.value)} />

              {/* Mobile + send otp */}
              <Grid container spacing={1} alignItems="stretch">
                <Grid item xs={7}>
                  <TextField
                    label="موبایل مدیر"
                    value={form.mobile}
                    onChange={e=>setField("mobile", onlyDigits(e.target.value, 11))}
                    inputProps={{ maxLength:11, inputMode:"numeric", pattern:"[0-9]*" }}
                    disabled={regOtpSent && regCountdown>0}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon fontSize="small" /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Button fullWidth variant="outlined" onClick={sendRegisterOtp}
                          disabled={regSending || form.mobile.length!==11 || (regOtpSent && regCountdown>0)}
                          sx={{ height:"100%" }}>
                    {regSending ? <CircularProgress size={22}/> : "ارسال کد"}
                  </Button>
                </Grid>
              </Grid>

              {regOtpSent && (
                <Box sx={{ display:"grid", gap:1 }}>
                  <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                    <TextField
                      label="کد تایید"
                      value={form.otpCode}
                      onChange={e=>setField("otpCode", onlyDigits(e.target.value, 6))}
                      inputProps={{ maxLength:6, inputMode:"numeric", pattern:"[0-9]*" }}
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start"><TaskAltIcon fontSize="small" /></InputAdornment> }}
                    />
                    <IconButton title="ویرایش شماره" onClick={()=>{ setRegOtpSent(false); setRegCountdown(0); }}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {regCountdown>0 ? `ارسال مجدد تا ${regCountdown} ثانیه` : "می‌توانید دوباره ارسال کنید."}
                    </Typography>
                    <Button size="small" variant="text" disabled={regCountdown>0} onClick={sendRegisterOtp}>
                      ارسال مجدد
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Password (REQUIRED) */}
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <TextField
                    type={showRegPass ? "text" : "password"}
                    label="رمز عبور (حداقل ۶ کاراکتر)"
                    value={form.password}
                    onChange={e=>setField("password", e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={()=> setShowRegPass(s=>!s)}>
                            {showRegPass ? <VisibilityOff/> : <Visibility/>}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type={showRegPass2 ? "text" : "password"}
                    label="تایید رمز عبور"
                    value={form.confirmPassword}
                    onChange={e=>setField("confirmPassword", e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={()=> setShowRegPass2(s=>!s)}>
                            {showRegPass2 ? <VisibilityOff/> : <Visibility/>}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Button variant="contained" onClick={register}>
                ثبت‌نام
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
