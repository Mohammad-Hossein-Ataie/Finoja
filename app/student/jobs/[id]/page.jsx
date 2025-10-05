"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Alert, CircularProgress } from "@mui/material";

export default function StudentJobDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchJob = async () => {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json();
    setJob(data.job || null);
  };
  useEffect(()=>{ fetchJob(); }, [id]);

  const ensureStudent = async () => {
    const res = await fetch("/api/auth/me", { credentials:"include" });
    if (!res.ok) { router.push(`/students/login?next=/student/jobs/${id}`); return false; }
    const me = await res.json();
    if (me?.role !== "student") { router.push(`/students/login?next=/student/jobs/${id}`); return false; }
    return true;
  };

  const apply = async () => {
    if (!(await ensureStudent())) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/apply`, { method:"POST" });
    const data = await res.json().catch(()=>({}));
    setBusy(false);
    if (res.ok) setStatus({ text:"درخواست شما ثبت شد.", severity:"success" });
    else setStatus({ text: data.error || "خطا در ثبت درخواست", severity:"error" });
  };

  const withdraw = async () => {
    if (!(await ensureStudent())) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/withdraw`, { method:"POST" });
    const data = await res.json().catch(()=>({}));
    setBusy(false);
    if (res.ok) setStatus({ text:"انصراف ثبت شد.", severity:"info" });
    else setStatus({ text: data.error || "خطا در انصراف", severity:"error" });
  };

  if (!job) return null;

  return (
    <Container sx={{ py:4 }}>
      {status && <Alert severity={status.severity} sx={{ mb:2 }}>{status.text}</Alert>}
      <Typography variant="h4" sx={{ fontWeight:"bold" }}>{job.title}</Typography>
      <Typography sx={{ color:"text.secondary", mt:.5 }}>
        {job.company?.name} — {job.location?.city || ""} {(job.location?.country && job.location.country!=="ایران"? job.location.country : "")}
      </Typography>
      <Box sx={{ mt:2, whiteSpace:"pre-line" }}>{job.description}</Box>

      <Box sx={{ mt:3, display:"flex", gap:1, alignItems:"center" }}>
        <Button variant="contained" onClick={apply} disabled={busy}>
          {busy ? <CircularProgress size={18} sx={{ mr:1 }} /> : null}
          درخواست
        </Button>
        <Button variant="outlined" color="error" onClick={withdraw} disabled={busy}>انصراف</Button>
        <Button variant="text" onClick={()=>router.push("/student/applications")}>مشاهده درخواست‌های من</Button>
      </Box>
    </Container>
  );
}
