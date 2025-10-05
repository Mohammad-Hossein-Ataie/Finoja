"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Container, Typography, Grid, Card, CardContent,
  Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Chip, CircularProgress
} from "@mui/material";
import { useRouter } from "next/navigation";
import { IR_PROVINCES } from "../../../utils/iran";

export default function StudentJobs() {
  // فیلترها
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // داده‌ها
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJob, setLoadingJob] = useState({}); // { [jobId]: boolean }
  const router = useRouter();

  // شهرهای وابسته به استان
  const cities = useMemo(() => {
    const p = IR_PROVINCES.find(x => x.name === province);
    return p ? p.cities : [];
  }, [province]);

  // مپ درخواست‌ها برای lookup سریع
  const appsByJob = useMemo(() => {
    const m = Object.create(null);
    for (const a of applications) m[a.jobId] = a;
    return m;
  }, [applications]);

  // گرفتن آگهی‌ها
  const fetchJobs = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (province) params.set("country", "ایران");
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    setJobs(data.jobs || []);
  };

  // گرفتن درخواست‌های کاربر (اگر لاگین نیست، ساکت عبور کن)
  const fetchMyApplications = async () => {
    try {
      const res = await fetch("/api/students/applications", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      setApplications(data.applications || []);
    } catch {}
  };

  // روی mount
  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  // هر بار که تب/پنجره فوکِس می‌گیرد، درخواست‌ها را تازه کن تا بعد از برگشت از جزئیات، UI به‌روز شود
  useEffect(() => {
    const onFocus = () => fetchMyApplications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const ensureStudent = async (nextTo) => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) { router.push(`/students/login?next=${encodeURIComponent(nextTo)}`); return false; }
    const me = await res.json().catch(() => ({}));
    if (me?.role !== "student") { router.push(`/students/login?next=${encodeURIComponent(nextTo)}`); return false; }
    return true;
  };

  const setBusy = (id, v) => setLoadingJob(s => ({ ...s, [id]: v }));

  const quickApply = async (jobId) => {
    if (!(await ensureStudent(`/student/jobs/${jobId}`))) return;
    setBusy(jobId, true);
    const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
    await fetchMyApplications();
    setBusy(jobId, false);
  };

  const quickWithdraw = async (jobId) => {
    if (!(await ensureStudent(`/student/jobs/${jobId}`))) return;
    setBusy(jobId, true);
    const res = await fetch(`/api/jobs/${jobId}/withdraw`, { method: "POST" });
    await fetchMyApplications();
    setBusy(jobId, false);
  };

  // کنترل یکنواخت: هر کنترل روی xs تمام‌عرض، روی sm حدود 220px
  const ctrlSx = { width: { xs: "100%", sm: 220 } };

  return (
    <Container sx={{ py: 4 }} dir="rtl">
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        فرصت‌های شغلی
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Grid item xs={12} sm="auto" sx={ctrlSx}>
          <TextField size="small" label="عنوان" fullWidth value={q} onChange={e => setQ(e.target.value)} />
        </Grid>

        <Grid item xs={6} sm="auto" sx={ctrlSx}>
          <FormControl fullWidth size="small">
            <InputLabel>استان</InputLabel>
            <Select
              label="استان"
              value={province}
              onChange={e => { setProvince(e.target.value); setCity(""); }}
              MenuProps={{ disableScrollLock: true }}
            >
              {IR_PROVINCES.map(p => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm="auto" sx={ctrlSx}>
          <FormControl fullWidth disabled={!province} size="small">
            <InputLabel>شهر</InputLabel>
            <Select
              label="شهر"
              value={city}
              onChange={e => setCity(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
            >
              {cities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm="auto" sx={ctrlSx}>
          <TextField size="small" type="date" label="از تاریخ" InputLabelProps={{ shrink: true }} fullWidth value={from} onChange={e => setFrom(e.target.value)} />
        </Grid>

        <Grid item xs={6} sm="auto" sx={ctrlSx}>
          <TextField size="small" type="date" label="تا تاریخ" InputLabelProps={{ shrink: true }} fullWidth value={to} onChange={e => setTo(e.target.value)} />
        </Grid>

        <Grid item xs={12} sm="auto" sx={{ width: { xs: "100%", sm: 120 } }}>
          <Button fullWidth variant="contained" onClick={fetchJobs}>فیلتر</Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {jobs.map((j) => {
          const myApp = appsByJob[j._id];
          const applied = Boolean(myApp) && !myApp.withdrawn;
          const busy = !!loadingJob[j._id];

          return (
            <Grid key={j._id} item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>{j.title}</Typography>
                  <Typography sx={{ color: "text.secondary", mt: .5 }}>
                    {j.company?.name} — {j.location?.city || ""} {(j.location?.country && j.location.country !== "ایران" ? j.location.country : "")}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    {j.salaryRange && <Chip size="small" label={`حقوق: ${j.salaryRange}`} />}
                    {applied && <Chip size="small" color="success" label={myApp?.statusFa || "درخواست ثبت‌شده"} />}
                  </Box>

                  <Typography sx={{ mt: 1 }} noWrap title={j.description}>{j.description}</Typography>

                  <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {!applied ? (
                      <>
                        <Button
                          variant="contained"
                          disabled={busy}
                          onClick={() => quickApply(j._id)}
                        >
                          {busy ? <CircularProgress size={18} sx={{ ml: 1 }} /> : null}
                          درخواست
                        </Button>
                        <Button component={Link} href={`/student/jobs/${j._id}`} variant="text">
                          مشاهده
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button component={Link} href={`/student/jobs/${j._id}`} variant="outlined" color="success">
                          درخواست ثبت‌شده — مشاهده
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={busy}
                          onClick={() => quickWithdraw(j._id)}
                        >
                          {busy ? <CircularProgress size={18} sx={{ ml: 1 }} /> : null}
                          انصراف
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
