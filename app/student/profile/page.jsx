// ================= app/student/profile/page.jsx =================
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

/* ---------- Design tokens (تیز و حرفه‌ای) ---------- */
const BRAND = "#2477F3";
const GREY_BG = "#F6F8FB";
const R_CARD = 3; // کارت اصلی و کارت‌ها
const R_SECTION = 3; // باکس رزومه و آیتم دوره‌ها

/* ---------- Helper: آواتار ---------- */
const avatarURL = (n = "", f = "") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${n} ${f}`
  )}&background=2477F3&color=fff`;

const fmtBytes = (n) => {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);

  const notify = (text, severity = "info") => setAlert({ text, severity });

  /* ---------- Fetch profile ---------- */
  const fetchProfile = async () => {
    const mobile =
      typeof window !== "undefined"
        ? localStorage.getItem("student_mobile")
        : null;
    if (!mobile) {
      setLoad(false);
      return;
    }
    try {
      const res = await fetch("/api/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const j = await res.json();
      setData(j);
    } catch {
      setData(null);
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  /* ---------- Resume actions ---------- */
  const onUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const MAX = 10 * 1024 * 1024;
    if (!ALLOWED.includes(file.type)) {
      notify("فقط PDF/DOC/DOCX مجاز است.", "warning");
      e.target.value = "";
      return;
    }
    if (file.size > MAX) {
      notify("حداکثر حجم ۱۰ مگابایت.", "warning");
      e.target.value = "";
      return;
    }

    setBusy(true);
    setAlert(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/students/resume/upload", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) notify(j.error || "خطا در بارگذاری رزومه", "error");
      else {
        notify("رزومه ذخیره شد.", "success");
        await fetchProfile();
      }
    } catch {
      notify("خطا در بارگذاری رزومه", "error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const openResume = async () => {
    const hasResume = data?.resume?.key || data?.resumeKey;
    if (!hasResume) return notify("رزومه‌ای ثبت نشده.", "info");
    try {
      const res = await fetch("/api/students/resume/presigned", {
        method: "GET",
      });
      const j = await res.json();
      if (!res.ok) return notify(j.error || "خطا در دریافت لینک", "error");
      window.open(j.url, "_blank", "noopener,noreferrer");
    } catch {
      notify("خطا در دریافت لینک", "error");
    }
  };

  const deleteResume = async () => {
    if (!confirm("رزومه حذف شود؟")) return;
    setBusy(true);
    setAlert(null);
    try {
      const res = await fetch("/api/students/resume/delete", {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) notify(j.error || "خطا در حذف رزومه", "error");
      else {
        notify("رزومه حذف شد.", "success");
        await fetchProfile();
      }
    } catch {
      notify("خطا در حذف رزومه", "error");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading)
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );

  if (!data)
    return (
      <Typography textAlign="center" color="error" mt={8}>
        خطا در بارگیری پروفایل
      </Typography>
    );

  const joinDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(data.createdAt));

  const resume = data.resume || {
    key: data.resumeKey,
    name: data.resumeName,
    size: data.resumeSize,
    type: data.resumeType,
    updatedAt: data.resumeUpdatedAt,
  };

  /* ---------- UI ---------- */
  return (
    <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 1.5, sm: 2 }, py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: R_CARD, // ← تیز (۸px)
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        {/* Header بدون گوشه گرد اضافه */}
        <Box
          sx={{
            height: 112,
            bgcolor: BRAND,
            background: "linear-gradient(180deg, #2B7BF5 0%, #1F69E6 100%)",
            borderRadius: 0, // ← صفر
          }}
        />
        {/* Avatar */}
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={avatarURL(data.name, data.family)}
            alt={`${data.name} ${data.family}`}
            sx={{
              width: 88,
              height: 88,
              position: "absolute",
              top: -44,
              left: "50%",
              transform: "translateX(-50%)",
              border: "4px solid #fff",
              boxShadow: "0 4px 12px rgba(0,0,0,.15)",
              bgcolor: BRAND,
              fontSize: 26,
            }}
          />
        </Box>

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Collapse in={Boolean(alert)}>
            {alert && (
              <Alert
                severity={alert.severity}
                onClose={() => setAlert(null)}
                sx={{ mb: 2, borderRadius: 6 }}
              >
                {alert.text}
              </Alert>
            )}
          </Collapse>

          <Typography
            variant="h6"
            align="center"
            fontWeight={800}
            sx={{ mt: 3.5, mb: 0.5 }}
          >
            {data.name} {data.family}
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
            sx={{ mb: 2, fontSize: 14 }}
          >
            {data.email ? `${data.email} • ` : ""}
            {data.mobile}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mb: 3 }}
          >
            <Chip
              size="small"
              icon={<AccessTimeIcon />}
              label={`عضویت از ${joinDate}`}
              sx={{
                bgcolor: GREY_BG,
                "& .MuiChip-icon": { color: "text.secondary" },
              }}
            />
            <Tooltip
              arrow
              title={
                <Box sx={{ fontSize: 12, lineHeight: 1.8 }}>
                  مجموع امتیاز از تمام دوره‌ها. با حل تمرین‌ها XP می‌گیرید.
                </Box>
              }
            >
              <Chip
                size="small"
                icon={<EmojiEventsIcon />}
                color="success"
                label={`${data.totalXp ?? 0} XP`}
                sx={{ fontWeight: 700, "& .MuiChip-icon": { color: "#fff" } }}
              />
            </Tooltip>
          </Stack>

          {/* Resume card – radius ≤ والد */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: R_SECTION,
              mb: 3,
              bgcolor: "#fff",
              borderColor: "#E6EAF2",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.5}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                {resume?.type?.includes("pdf") ? (
                  <PictureAsPdfIcon sx={{ color: "#E53935" }} />
                ) : (
                  <DescriptionIcon sx={{ color: BRAND }} />
                )}
                <Box>
                  <Typography fontWeight={700}>رزومه</Typography>
                  {resume?.key ? (
                    <Typography variant="body2" color="text.secondary">
                      {resume.name || "resume"}
                      {resume.size ? ` • ${fmtBytes(resume.size)}` : ""}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      هنوز رزومه‌ای ثبت نکرده‌اید.
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={onUploadClick}
                  disabled={busy}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: BRAND,
                    "&:hover": { bgcolor: "#1A56DB" },
                  }}
                >
                  {resume?.key ? "تعویض" : "بارگذاری"}
                </Button>
                <Tooltip title="مشاهده رزومه">
                  <span>
                    <IconButton
                      onClick={openResume}
                      disabled={!resume?.key || busy}
                      color="primary"
                      sx={{ border: "1px solid #E6EAF2", borderRadius: 1.5 }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="حذف رزومه">
                  <span>
                    <IconButton
                      onClick={deleteResume}
                      disabled={!resume?.key || busy}
                      color="error"
                      sx={{ border: "1px solid #F3D3D3", borderRadius: 1.5 }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          {/* Courses */}
          <Typography fontWeight={800} sx={{ mb: 1.5 }} align="center">
            دوره‌های شما
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.25}>
            {(data.learning || []).length === 0 && (
              <Typography align="center" color="text.secondary">
                هنوز دوره‌ای ندارید.
              </Typography>
            )}
            {data.learning
              .slice()
              .sort((a, b) => b.xp - a.xp)
              .map((l) => {
                const percent = l.totalSteps
                  ? Math.min(100, (l.progress / l.totalSteps) * 100)
                  : Math.min(100, Number(l.progress) || 0);
                return (
                  <Paper
                    key={l.courseId}
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: R_SECTION,
                      borderColor: "#E6EAF2",
                      bgcolor: "#fff",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <WorkspacePremiumIcon sx={{ color: "#FFC107" }} />
                      <Box flex={1} minWidth={0}>
                        <Typography fontWeight={700} noWrap>
                          {l.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          XP: {l.xp ?? 0}
                          {typeof l.progress === "number"
                            ? ` • پیشرفت: ${l.progress}${
                                l.totalSteps ? ` از ${l.totalSteps}` : ""
                              }`
                            : ""}
                          {l.finished ? " • پایان‌یافته" : ""}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={isNaN(percent) ? 0 : percent}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: GREY_BG,
                            "& .MuiLinearProgress-bar": { bgcolor: BRAND },
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
