// ================= app/student/profile/page.jsx =================
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Menu,
  MenuItem
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Cropper from "react-easy-crop";

/* ---------- Design tokens ---------- */
const BRAND = "#2563eb"; // هماهنگ با بقیه صفحات
const GREY_BG = "#F6F8FB";
const R_CARD = 2;     // 8px
const R_SECTION = 2;  // 8px

/* ✅ آدرس عمومی استوریج */
const PUBLIC_S3_BASE =
  process.env.NEXT_PUBLIC_LIARA_BASE_URL ||
  "https://storage.c2.liara.space/finoja";

/* ---------- Helper: آواتار جایگزین ---------- */
const fallbackAvatarURL = (n = "", f = "") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${n} ${f}`
  )}&background=2477F3&color=fff`;

const fmtBytes = (n) => {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/* ---------- Canvas crop helper (to Blob) ---------- */
async function getCroppedBlob(imageSrc, cropPixels, size = 512) {
  const img = document.createElement("img");
  img.src = imageSrc;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const { x, y, width, height } = cropPixels;

  ctx.drawImage(img, x, y, width, height, 0, 0, size, size);

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

/* ---------- خواندن فایل به DataURL ---------- */
const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null);

  // رزومه
  const fileInputRef = useRef(null);

  // آواتار
  const avatarInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null); // URL نهایی (عمومی)

  // Crop dialog
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImage, setRawImage] = useState(null); // dataURL
  const [zoom, setZoom] = useState(1.2);
  const [croppedPixels, setCroppedPixels] = useState(null);

  // Image viewer dialog
  const [viewOpen, setViewOpen] = useState(false);

  // Avatar menu
  const [menuEl, setMenuEl] = useState(null);
  const menuOpen = Boolean(menuEl);

  const notify = (text, severity = "info") => setAlert({ text, severity });

  /* ---------- Fetch profile ---------- */
  const fetchProfile = useCallback(async () => {
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

      // ✅ اگر آواتار دارد، URL عمومی بساز
      const key = j?.avatar?.key || j?.avatarKey;
      if (key) {
        setAvatarUrl(`${PUBLIC_S3_BASE}/${key}?ts=${Date.now()}`);
      } else {
        setAvatarUrl(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
      const res = await fetch("/api/students/resume/presigned");
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

  /* ---------- Avatar actions ---------- */
  const onAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChoose = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    const MAX = 5 * 1024 * 1024;
    if (!ALLOWED.includes(file.type)) {
      notify("فقط عکس‌های JPG/PNG/WEBP مجاز است.", "warning");
      e.target.value = "";
      return;
    }
    if (file.size > MAX) {
      notify("حداکثر حجم ۵ مگابایت.", "warning");
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setRawImage(dataUrl);
      setZoom(1.2);
      setCroppedPixels(null);
      setCropOpen(true);
    } catch {
      notify("خواندن فایل ناموفق بود.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const saveCroppedAvatar = async () => {
    if (!rawImage || !croppedPixels) return;
    setBusy(true);
    setAlert(null);
    try {
      const blob = await getCroppedBlob(rawImage, croppedPixels, 512); // 512x512
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/students/avatar/upload", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) {
        notify(j.error || "خطا در ذخیره آواتار", "error");
      } else {
        notify("آواتار ذخیره شد.", "success");
        setCropOpen(false);
        setRawImage(null);

        if (j?.key) {
          setAvatarUrl(`${PUBLIC_S3_BASE}/${j.key}?ts=${Date.now()}`);
        } else {
          await fetchProfile();
        }
      }
    } catch {
      notify("خطا در ذخیره آواتار", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteAvatar = async () => {
    if (!confirm("آواتار حذف شود؟")) return;
    setBusy(true);
    setAlert(null);
    try {
      const res = await fetch("/api/students/avatar/delete", {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) notify(j.error || "خطا در حذف آواتار", "error");
      else {
        notify("آواتار حذف شد.", "success");
        setAvatarUrl(null);
        await fetchProfile();
      }
    } catch {
      notify("خطا در حذف آواتار", "error");
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
        sx={{ borderRadius: R_CARD, overflow: "hidden", bgcolor: "#fff" }}
      >
        {/* Header */}
        <Box
          sx={{
            height: 112,
            bgcolor: BRAND,
            background: "linear-gradient(180deg, #2B7BF5 0%, #1F69E6 100%)",
            borderRadius: 0,
          }}
        />
        {/* Avatar area */}
        <Box sx={{ position: "relative" }}>
          {/* Avatar with hover overlay (view) */}
          <Box
            sx={{
              width: 96,
              height: 96,
              position: "absolute",
              top: -48,
              left: "50%",
              transform: "translateX(-50%)",
              border: "4px solid #fff",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0,0,0,.15)",
              overflow: "hidden",
              cursor: "pointer",
              "&:hover .avatar-overlay": { opacity: 1 },
              bgcolor: BRAND,
            }}
            onClick={() => setViewOpen(true)}
          >
            <Avatar
              src={avatarUrl || undefined}
              alt={`${data.name} ${data.family}`}
              imgProps={{ referrerPolicy: "no-referrer" }}
              sx={{ width: "100%", height: "100%" }}
            >
              {!avatarUrl && (
                <img
                  src={fallbackAvatarURL(data.name, data.family)}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </Avatar>
            <Box
              className="avatar-overlay"
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,.35)",
                color: "#fff",
                transition: "opacity .2s",
                opacity: 0,
                fontSize: 12,
                gap: 0.5
              }}
            >
              <VisibilityIcon fontSize="small" />
              مشاهده
            </Box>
          </Box>

          {/* Three-dot menu like Telegram */}
          <IconButton
            aria-label="گزینه‌ها"
            onClick={(e) => setMenuEl(e.currentTarget)}
            sx={{
              position: "absolute",
              top: 8,
              left: "calc(50% + 42px)",
              transform: "translateX(-50%)",
              bgcolor: "#fff",
              border: "1px solid #E6EAF2",
              "&:hover": { bgcolor: "#f7f9fc" },
              zIndex: 2,
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={menuEl}
            open={menuOpen}
            onClose={() => setMenuEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              onClick={() => {
                setMenuEl(null);
                setViewOpen(true);
              }}
            >
              <VisibilityIcon sx={{ ml: 1 }} fontSize="small" /> مشاهده تصویر
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuEl(null);
                onAvatarClick();
              }}
            >
              <PhotoCameraIcon sx={{ ml: 1 }} fontSize="small" /> تغییر تصویر
            </MenuItem>
            <MenuItem
              onClick={async () => {
                setMenuEl(null);
                await deleteAvatar();
              }}
              sx={{ color: "error.main" }}
            >
              <DeleteOutlineIcon sx={{ ml: 1 }} fontSize="small" /> حذف تصویر
            </MenuItem>
          </Menu>

          <input
            ref={avatarInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleAvatarChoose}
          />
        </Box>

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Collapse in={Boolean(alert)}>
            {alert && (
              <Alert
                severity={alert.severity}
                onClose={() => setAlert(null)}
                sx={{ mb: 2, borderRadius: 2 }}
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
          <Typography align="center" color="text.secondary" sx={{ mb: 2, fontSize: 14 }}>
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
                borderRadius: 1.5
              }}
            />
            <Tooltip
              arrow
              title={
                <Box sx={{ fontSize: 12, lineHeight: 1.8 }}>
                  مجموع امتیاز از همه دوره‌ها. با انجام تمرین‌ها XP می‌گیرید.
                </Box>
              }
            >
              <Chip
                size="small"
                icon={<EmojiEventsIcon />}
                color="success"
                label={`${data.totalXp ?? 0} XP`}
                sx={{ fontWeight: 700, "& .MuiChip-icon": { color: "#fff" }, borderRadius: 1.5 }}
              />
            </Tooltip>
          </Stack>

          {/* Resume card */}
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

      {/* Avatar Crop Dialog */}
      <Dialog
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight={800}>برش تصویر پروفایل</DialogTitle>
        <DialogContent
          dividers
          sx={{ position: "relative", height: 360, bgcolor: "#000" }}
        >
          {rawImage && (
            <Cropper
              image={rawImage}
              crop={{ x: 0, y: 0 }}
              zoom={zoom}
              aspect={1}
              onCropChange={() => {}}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setCroppedPixels(area)}
              restrictPosition
              objectFit="contain"
              showGrid={false}
            />
          )}
        </DialogContent>
        <Box px={3} pt={2}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
            بزرگ‌نمایی
          </Typography>
          <Slider value={zoom} min={1} max={3} step={0.01} onChange={(_, v) => setZoom(v)} />
        </Box>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCropOpen(false)} disabled={busy}>
            انصراف
          </Button>
          <Button variant="contained" onClick={saveCroppedAvatar} disabled={busy || !croppedPixels}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Avatar Viewer Dialog with Edit/Delete */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle fontWeight={800}>مشاهده تصویر پروفایل</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#111" }}>
          <Box
            component="img"
            alt="avatar"
            src={
              avatarUrl ||
              `data:image/svg+xml;utf8,${encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
                   <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
                     <stop offset='0' stop-color='#dbeafe'/><stop offset='1' stop-color='#bfdbfe'/>
                   </linearGradient></defs>
                   <rect width='128' height='128' rx='16' fill='url(#g)'/>
                   <circle cx='64' cy='48' r='24' fill='#fff'/>
                   <rect x='24' y='80' width='80' height='32' rx='16' fill='#fff'/>
                 </svg>`
              )}`
            }
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff"
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={async () => {
            await deleteAvatar();
            setViewOpen(false);
          }}>
            حذف
          </Button>
          <Button startIcon={<PhotoCameraIcon />} variant="contained" onClick={() => {
            setViewOpen(false);
            onAvatarClick();
          }}>
            ویرایش
          </Button>
          <Button onClick={() => setViewOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
