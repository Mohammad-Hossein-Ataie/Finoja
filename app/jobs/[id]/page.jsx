"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Alert, CircularProgress, Chip } from "@mui/material";

export default function StudentJobDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [myApp, setMyApp] = useState(null);

  const applied = useMemo(() => Boolean(myApp) && !myApp.withdrawn, [myApp]);

  const fetchJob = async () => {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json().catch(() => ({}));
    setJob(data.job || null);
  };

  const fetchMyApp = async () => {
    try {
      const res = await fetch("/api/students/applications", { credentials: "include" });
      if (!res.ok) { setMyApp(null); return; }
      const data = await res.json().catch(() => ({}));
      const app = (data.applications || []).find(a => a.jobId === id && !a.withdrawn);
      setMyApp(app || null);
    } catch {}
  };

  useEffect(() => { fetchJob(); fetchMyApp(); }, [id]);

  const ensureStudent = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) { router.push(`/students/login?next=/student/jobs/${id}`); return false; }
    const me = await res.json().catch(() => ({}));
    if (me?.role !== "student") { router.push(`/students/login?next=/student/jobs/${id}`); return false; }
    return true;
  };

  const apply = async () => {
    if (!(await ensureStudent())) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/apply`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus({ text: "درخواست شما ثبت شد.", severity: "success" });
      fetchMyApp();
    } else {
      setStatus({ text: data.error || "خطا در ثبت درخواست", severity: "error" });
    }
  };

  const withdraw = async () => {
    if (!(await ensureStudent())) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/withdraw`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus({ text: "انصراف ثبت شد.", severity: "info" });
      fetchMyApp();
    } else {
      setStatus({ text: data.error || "خطا در انصراف", severity: "error" });
    }
  };

  if (!job) return null;

  return (
    <Container sx={{ py: 4 }} dir="rtl">
      {status && <Alert severity={status.severity} sx={{ mb: 2 }}>{status.text}</Alert>}

      <Typography variant="h4" sx={{ fontWeight: "bold" }}>{job.title}</Typography>
      <Typography sx={{ color: "text.secondary", mt: .5 }}>
        {job.company?.name} — {job.location?.city || ""} {(job.location?.country && job.location.country !== "ایران" ? job.location.country : "")}
      </Typography>

      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {applied && <Chip size="small" color="success" label={myApp?.statusFa || "درخواست ثبت‌شده"} />}
        {job.salaryRange && <Chip size="small" label={`حقوق: ${job.salaryRange}`} />}
      </Box>

      <Box sx={{ mt: 2, whiteSpace: "pre-line" }}>{job.description}</Box>

      <Box sx={{ mt: 3, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={apply}
          disabled={busy || applied}
          title={applied ? "برای این آگهی قبلاً درخواست داده‌اید." : ""}
        >
          {busy ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
          {applied ? "درخواست ثبت‌شده" : "درخواست"}
        </Button>

        <Button variant="outlined" color="error" onClick={withdraw} disabled={busy || !applied}>
          انصراف
        </Button>

        <Button variant="text" onClick={() => router.push("/student/applications")}>
          مشاهده درخواست‌های من
        </Button>
      </Box>
    </Container>
  );
}
