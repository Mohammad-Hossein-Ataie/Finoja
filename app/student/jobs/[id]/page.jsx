// app/student/jobs/[id]/page.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Link as MLink,
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

  // دیالوگ انتخاب رزومه
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [resumeOptions, setResumeOptions] = useState({ hasFile: false, hasBuilder: false, defaultChoice: null });
  const [resumeChoice, setResumeChoice] = useState("file");

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

  const loadResumePresence = async () => {
    const res = await fetch("/api/students/resume-presence", { credentials: "include" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { hasFile: false, hasBuilder: false, defaultChoice: null };
    }
    return d;
  };

  const submitApply = async (choice /* "file" | "builder" | undefined */) => {
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(choice ? { resumeChoice: choice } : {}),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      showToast("درخواست شما ثبت شد.", "success");
      await fetchJob();
      router.push("/student/applications");
      return;
    }

    // هندل ارورکدها
    if (data?.errorCode === "CHOOSE_RESUME") {
      setResumeOptions({ hasFile: true, hasBuilder: true, defaultChoice: "file" });
      setResumeChoice("file");
      setResumeDialogOpen(true);
      return;
    }
    if (data?.errorCode === "NO_RESUME") {
      showToast("برای ارسال درخواست باید رزومه بسازید یا آپلود کنید.", "warning");
      return;
    }
    if (data?.errorCode === "WITHDRAWN_LOCKED") {
      showToast("انصراف داده‌اید؛ دیگر امکان ارسال درخواست برای این آگهی نیست.", "info");
      return;
    }

    showToast(data?.error || "خطا در ثبت درخواست", "error");
  };

  const apply = async () => {
    if (!(await ensureStudent())) return;

    // اگر قبلاً انصراف داده -> قفل
    if (myApp?.withdrawn) {
      showToast("شما قبلاً انصراف داده‌اید؛ امکان ارسال مجدد وجود ندارد.", "info");
      return;
    }

    // وضعیت رزومه‌ها را بگیر
    const pres = await loadResumePresence();
    setResumeOptions(pres);

    // هیچ رزومه‌ای؟
    if (!pres.hasFile && !pres.hasBuilder) {
      showToast("برای درخواست باید ابتدا یک رزومه بسازید یا فایل رزومه آپلود کنید.", "warning");
      return;
    }

    // فقط یکی؟
    if (pres.hasFile && !pres.hasBuilder) {
      await submitApply("file");
      return;
    }
    if (!pres.hasFile && pres.hasBuilder) {
      await submitApply("builder");
      return;
    }

    // هر دو → از کاربر بپرس
    setResumeChoice(pres.defaultChoice || "file");
    setResumeDialogOpen(true);
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

  /** ✅ فقط وقتی هیچ اپلیکیشنی وجود نداشته باشد می‌تواند درخواست دهد */
  const canApply = !myApp;
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
            {job.location?.country && job.location.country !== "ایران" ? ` — ${job.location.country}` : ""}
          </Typography>
        </Box>
        {postedFa && <Typography sx={{ color: "text.secondary" }}>تاریخ انتشار: {postedFa}</Typography>}
      </Box>

      <Grid container spacing={3}>
        {/* Left: Description & Requirements */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              شرح موقعیت
            </Typography>
            <Box sx={{ whiteSpace: "pre-line", color: "text.primary" }}>{job.description || "—"}</Box>
          </Paper>

          {job.requiredSkills?.length || courseRefs?.length ? (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                الزامات
              </Typography>

              {job.requiredSkills?.length ? (
                <Box sx={{ mb: courseRefs?.length ? 2 : 0 }}>
                  <Typography sx={{ mb: 1, color: "text.secondary" }}>مهارت‌های موردنیاز:</Typography>
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
                  <Typography sx={{ mb: 1, color: "text.secondary" }}>گذراندن دوره‌های فینوجا:</Typography>
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
                {(job.location?.city || "—") + (job.location?.country ? ` / ${job.location.country}` : "")}
              </Typography>

              <Typography sx={{ color: "text.secondary" }}>حقوق</Typography>
              <Typography>{fmtNum(job.salaryRange)}</Typography>

              <Typography sx={{ color: "text.secondary" }}>حداقل سابقه</Typography>
              <Typography>{job.minExpYears != null ? `${fmtNum(job.minExpYears)} سال` : "—"}</Typography>

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

              {/* اگر قبلاً اپلای کرده و انصراف نداده → کلید انصراف */}
              {canWithdraw && (
                <Button variant="outlined" color="error" onClick={withdraw} disabled={busy}>
                  انصراف
                </Button>
              )}

              {/* اگر اپلیکیشن دارد و انصراف هم داده → قفل + توضیح */}
              {myApp && myApp.withdrawn && (
                <Alert severity="info" sx={{ m: 0, py: 0.5 }}>
                  شما برای این موقعیت <b>انصراف</b> داده‌اید؛ امکان ارسال مجدد وجود ندارد.
                </Alert>
              )}

              <Button variant="text" onClick={() => router.push("/student/applications")}>
                مشاهده درخواست‌های من
              </Button>
            </Box>

            {/* در صورت نبود رزومه، راهنما */}
            {!myApp && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  رزومه ندارید؟{" "}
                  <MLink href="/student/resume" underline="hover">
                    رزومه‌ساز فینوجا
                  </MLink>{" "}
                  یا{" "}
                  <MLink href="/student/profile" underline="hover">
                    بارگذاری فایل رزومه
                  </MLink>
                </Typography>
              </Box>
            )}
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
        <Alert onClose={() => setToast((t) => ({ ...t, open: false }))} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.text}
        </Alert>
      </Snackbar>

      {/* ✅ دیالوگ انتخاب نوع رزومه */}
      <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>انتخاب رزومه برای ارسال</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            value={resumeChoice}
            onChange={(e) => setResumeChoice(e.target.value)}
            sx={{ display: "grid", gap: 1 }}
          >
            <FormControlLabel
              value="file"
              control={<Radio />}
              label="رزومه فایل (آپلود شده در پروفایل)"
              disabled={!resumeOptions.hasFile}
            />
            <FormControlLabel
              value="builder"
              control={<Radio />}
              label="رزومه‌ساز فینوجا"
              disabled={!resumeOptions.hasBuilder}
            />
          </RadioGroup>
          {(!resumeOptions.hasFile || !resumeOptions.hasBuilder) && (
            <Alert severity="info" sx={{ mt: 1 }}>
              اگر گزینه‌ای غیرفعال است، ابتدا آن را در{" "}
              <MLink href="/student/profile" underline="hover">
                پروفایل
              </MLink>{" "}
              یا{" "}
              <MLink href="/student/resume" underline="hover">
                رزومه‌ساز
              </MLink>{" "}
              تکمیل کنید.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDialogOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setResumeDialogOpen(false);
              await submitApply(resumeChoice);
            }}
            disabled={!resumeOptions.hasFile && !resumeOptions.hasBuilder}
          >
            ارسال درخواست
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
