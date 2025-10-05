"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Grid,
  Chip,
  Paper,
  Divider,
} from "@mui/material";

export default function StudentJobDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [myApp, setMyApp] = useState(null); // {id, status, withdrawn} | null
  const [courseRefs, setCourseRefs] = useState([]); // [{_id,title}]
  const [busy, setBusy] = useState(false);

  // Snackbar / toast
  const [toast, setToast] = useState({ open: false, text: "", severity: "info" });
  const showToast = (text, severity = "info") => setToast({ open: true, text, severity });

  const fetchJob = async () => {
    const res = await fetch(`/api/jobs/${id}`, { credentials: "include" });
    const data = await res.json();
    setJob(data.job || null);
    setMyApp(data.myApplication || null);
    setCourseRefs(Array.isArray(data.courseRefs) ? data.courseRefs : []);
  };

  useEffect(() => {
    if (id) fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ensureStudent = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      router.push(`/students/login?next=/student/jobs/${id}`);
      return false;
    }
    const me = await res.json();
    if (me?.role !== "student") {
      router.push(`/students/login?next=/student/jobs/${id}`);
      return false;
    }
    return true;
  };

  const apply = async () => {
    if (!(await ensureStudent())) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/apply`, { method: "POST", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      showToast(data.reApplied ? "درخواست مجدداً ثبت شد." : "درخواست شما ثبت شد.", "success");
      await fetchJob();
      router.push("/student/applications");
    } else {
      showToast(data.error || "خطا در ثبت درخواست", "error");
    }
  };

  const withdraw = async () => {
    if (!(await ensureStudent())) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/withdraw`, { method: "POST", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      showToast("انصراف ثبت شد.", "info");
      await fetchJob();
    } else {
      showToast(data.error || "خطا در انصراف", "error");
    }
  };

  // ---------- Formatters & derived values ----------
  const genderFa = useMemo(
    () => ({
      any: "فرقی ندارد",
      male: "آقا",
      female: "خانم",
    }),
    []
  );

  const fmtNum = (n) => {
    if (n === null || n === undefined || n === "") return "—";
    const num = Number(n);
    return Number.isFinite(num) ? new Intl.NumberFormat("fa-IR").format(num) : n;
  };

  const postedFa = useMemo(
    () => (job?.postedAt ? new Date(job.postedAt).toLocaleDateString("fa-IR") : ""),
    [job?.postedAt]
  );

  if (!job) return null;

  const canApply = !myApp || myApp.withdrawn === true;
  const canWithdraw = !!myApp && myApp.withdrawn === false;

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {job.title}
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
            {job.company?.name}
            {job.location?.city ? ` — ${job.location.city}` : ""}
            {job.location?.country && job.location.country !== "ایران"
              ? ` — ${job.location.country}`
              : ""}
          </Typography>
        </Box>
        {postedFa && (
          <Typography sx={{ color: "text.secondary" }}>تاریخ انتشار: {postedFa}</Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left: Description & Requirements */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              شرح موقعیت
            </Typography>
            <Box sx={{ whiteSpace: "pre-line", color: "text.primary" }}>
              {job.description || "—"}
            </Box>
          </Paper>

          {(job.requiredSkills?.length || courseRefs?.length) ? (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                الزامات
              </Typography>

              {job.requiredSkills?.length ? (
                <Box sx={{ mb: courseRefs?.length ? 2 : 0 }}>
                  <Typography sx={{ mb: 1, color: "text.secondary" }}>
                    مهارت‌های موردنیاز:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {job.requiredSkills.map((s, i) => (
                      <Chip key={i} label={s} size="small" />
                    ))}
                  </Box>
                </Box>
              ) : null}

              {courseRefs?.length ? (
                <Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography sx={{ mb: 1, color: "text.secondary" }}>
                    گذراندن دوره‌های فینوجا:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {courseRefs.map((cr) => (
                      <Chip key={cr._id} label={cr.title} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              ) : null}
            </Paper>
          ) : null}
        </Grid>

        {/* Right: Meta & Actions */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              اطلاعات موقعیت
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                rowGap: 1,
                columnGap: 2,
              }}
            >
              <Typography sx={{ color: "text.secondary" }}>شهر / کشور</Typography>
              <Typography>
                {(job.location?.city || "—") +
                  (job.location?.country ? ` / ${job.location.country}` : "")}
              </Typography>

              <Typography sx={{ color: "text.secondary" }}>حقوق</Typography>
              <Typography>{fmtNum(job.salaryRange)}</Typography>

              <Typography sx={{ color: "text.secondary" }}>حداقل سابقه</Typography>
              <Typography>
                {job.minExpYears != null ? `${fmtNum(job.minExpYears)} سال` : "—"}
              </Typography>

              <Typography sx={{ color: "text.secondary" }}>جنسیت موردنظر</Typography>
              <Typography>{genderFa[job.gender] || "—"}</Typography>

              <Typography sx={{ color: "text.secondary" }}>تحصیلات</Typography>
              <Typography>{job.education || "—"}</Typography>

              <Typography sx={{ color: "text.secondary" }}>رشته مرتبط</Typography>
              <Typography>{job.fieldOfStudy || "—"}</Typography>

              <Typography sx={{ color: "text.secondary" }}>شرکت</Typography>
              <Typography>
                {job.company?.name || "—"}
                {job.company?.website ? (
                  <>
                    {" — "}
                    <a href={job.company.website} target="_blank" rel="noreferrer">
                      وب‌سایت
                    </a>
                  </>
                ) : null}
              </Typography>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              {canApply && (
                <Button variant="contained" onClick={apply} disabled={busy}>
                  {busy ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                  درخواست
                </Button>
              )}
              {canWithdraw && (
                <Button variant="outlined" color="error" onClick={withdraw} disabled={busy}>
                  انصراف
                </Button>
              )}
              <Button variant="text" onClick={() => router.push("/student/applications")}>
                مشاهده درخواست‌های من
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}
