"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box, Container, Paper, Typography, Button, TextField, Grid, Alert,
  MenuItem, Select, FormControl, InputLabel, CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import { IR_FIELDS, IR_PROVINCES } from "../../../utils/iran";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import EditIcon from "@mui/icons-material/Edit";

const onlyDigits = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);

export default function EmployerAuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") || "/company/dashboard";

  const [mode, setMode] = useState("register"); // "login" | "register"
  const [alert, setAlert] = useState(null);
  const notify = (text, sev="info") => setAlert({ text, sev });

  // --- Login state ---
  const [loginMobile, setLoginMobile] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginSending, setLoginSending] = useState(false);
  const [loginCountdown, setLoginCountdown] = useState(0);

  // --- Register state ---
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
  });
  const set = (k,v)=>setForm((f)=>({...f,[k]:v}));
  const [regSending, setRegSending] = useState(false);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regCountdown, setRegCountdown] = useState(0);

  const cities = useMemo(()=>{
    const p = IR_PROVINCES.find(x=>x.name===form.province);
    return p ? p.cities : [];
  }, [form.province]);

  // countdown tick
  useEffect(()=>{
    if (loginCountdown <= 0) return;
    const t = setInterval(()=> setLoginCountdown(s=> (s>0? s-1:0)), 1000);
    return ()=> clearInterval(t);
  }, [loginCountdown]);

  useEffect(()=>{
    if (regCountdown <= 0) return;
    const t = setInterval(()=> setRegCountdown(s=> (s>0? s-1:0)), 1000);
    return ()=> clearInterval(t);
  }, [regCountdown]);

  // --- Login flow ---
  const sendLoginOtp = async () => {
    setAlert(null);
    if (!/^0\d{10}$/.test(loginMobile)) return notify("شماره موبایل را صحیح وارد کنید.", "error");
    try {
      setLoginSending(true);
      const res = await fetch("/api/employer/send-otp", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ mobile: loginMobile, purpose: "employer_login" })
      });
      if (res.ok) {
        setLoginOtpSent(true);
        setLoginCountdown(90);
        notify("کد تایید ارسال شد.", "success");
      } else {
        const d = await res.json().catch(()=>({}));
        notify(d.error || "خطا در ارسال کد", "error");
      }
    } finally { setLoginSending(false); }
  };

  const loginWithOtp = async () => {
    setAlert(null);
    if (loginCode.length !== 6) return notify("کد ۶ رقمی را کامل وارد کنید.", "error");
    const res = await fetch("/api/employer/login-otp", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ mobile: loginMobile, code: loginCode })
    });
    const d = await res.json().catch(()=>({}));
    if (res.ok) router.replace(nextUrl);
    else notify(d.error || "ورود ناموفق", "error");
  };

  // --- Register flow ---
  const sendRegisterOtp = async () => {
    setAlert(null);
    if (!/^0\d{10}$/.test(form.mobile)) return notify("شماره موبایل مدیر را صحیح وارد کنید.", "error");
    try {
      setRegSending(true);
      const res = await fetch("/api/employer/send-otp", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ mobile: form.mobile, purpose: "employer_register" })
      });
      if (res.ok) {
        setRegOtpSent(true);
        setRegCountdown(90);
        notify("کد تایید ارسال شد.", "success");
      } else {
        const d = await res.json().catch(()=>({}));
        notify(d.error || "خطا در ارسال کد", "error");
      }
    } finally { setRegSending(false); }
  };

  const register = async () => {
    setAlert(null);
    if (!form.companyName.trim()) return notify("نام شرکت الزامی است.", "error");
    if (!form.province || !form.city) return notify("استان و شهر را انتخاب کنید.", "error");
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
          {alert && <Alert severity={alert.sev} sx={{ mb:2, borderRadius:2 }}>{alert.text}</Alert>}

          <Box sx={{ display:"flex", gap:1, mb:3, justifyContent:"center" }}>
            <Button variant={mode==="login"?"contained":"text"} onClick={()=>setMode("login")}>ورود با کد پیامکی</Button>
            <Button variant={mode==="register"?"contained":"text"} onClick={()=>setMode("register")}>ثبت‌نام</Button>
          </Box>

          {mode==="login" ? (
            <Box sx={{ display:"grid", gap:1.5 }}>
              <TextField
                label="موبایل"
                value={loginMobile}
                onChange={e=>setLoginMobile(onlyDigits(e.target.value, 11))}
                inputProps={{ maxLength:11, inputMode:"numeric", pattern:"[0-9]*" }}
                disabled={loginOtpSent && loginCountdown>0}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIphoneIcon fontSize="small" /></InputAdornment>
                }}
              />

              {!loginOtpSent ? (
                <Button variant="contained" onClick={sendLoginOtp} disabled={loginSending || loginMobile.length!==11}>
                  {loginSending ? <CircularProgress size={22}/> : "ارسال کد"}
                </Button>
              ) : (
                <Box sx={{ display:"grid", gap:1 }}>
                  <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                    <TextField
                      label="کد تایید"
                      value={loginCode}
                      onChange={e=>setLoginCode(onlyDigits(e.target.value, 6))}
                      inputProps={{ maxLength:6, inputMode:"numeric", pattern:"[0-9]*" }}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><TaskAltIcon fontSize="small" /></InputAdornment>
                      }}
                    />
                    <IconButton title="ویرایش شماره" onClick={()=>{ setLoginOtpSent(false); setLoginCountdown(0); }}>
                      <EditIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {loginCountdown>0 ? `ارسال مجدد تا ${loginCountdown} ثانیه` : "می‌توانید دوباره ارسال کنید."}
                    </Typography>
                    <Button
                      size="small" variant="text"
                      disabled={loginCountdown>0}
                      onClick={sendLoginOtp}
                    >
                      ارسال مجدد
                    </Button>
                  </Box>

                  <Button variant="contained" onClick={loginWithOtp} disabled={loginCode.length!==6}>
                    ورود
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display:"grid", gap:1.5 }}>
              <TextField label="نام شرکت" value={form.companyName} onChange={e=>set("companyName", e.target.value)} />

              <FormControl fullWidth>
                <InputLabel>حوزه فعالیت</InputLabel>
                <Select label="حوزه فعالیت" value={form.field} onChange={e=>set("field", e.target.value)}>
                  {IR_FIELDS.map((x)=> <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </Select>
              </FormControl>
              {form.field==="سایر" && (
                <TextField label="شرح حوزه فعالیت" value={form.fieldOther} onChange={e=>set("fieldOther", e.target.value)} />
              )}

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>استان</InputLabel>
                    <Select label="استان" value={form.province} onChange={e=>{ set("province", e.target.value); set("city",""); }}>
                      {IR_PROVINCES.map(p=><MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth disabled={!form.province}>
                    <InputLabel>شهر</InputLabel>
                    <Select label="شهر" value={form.city} onChange={e=>set("city", e.target.value)}>
                      {cities.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField label="وب‌سایت (اختیاری)" value={form.website} onChange={e=>set("website", e.target.value)} />
              <TextField label="نام مدیر" value={form.name} onChange={e=>set("name", e.target.value)} />
              <TextField label="ایمیل (اختیاری)" value={form.email} onChange={e=>set("email", e.target.value)} />

              <Grid container spacing={1} alignItems="stretch">
                <Grid item xs={7}>
                  <TextField
                    label="موبایل مدیر"
                    value={form.mobile}
                    onChange={e=>set("mobile", onlyDigits(e.target.value, 11))}
                    inputProps={{ maxLength:11, inputMode:"numeric", pattern:"[0-9]*" }}
                    disabled={regOtpSent && regCountdown>0}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhoneIphoneIcon fontSize="small" /></InputAdornment>
                    }}
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
                      onChange={e=>set("otpCode", onlyDigits(e.target.value, 6))}
                      inputProps={{ maxLength:6, inputMode:"numeric", pattern:"[0-9]*" }}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><TaskAltIcon fontSize="small" /></InputAdornment>
                      }}
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

              <Button variant="contained" onClick={register} disabled={form.otpCode.length!==6}>
                ثبت‌نام
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
