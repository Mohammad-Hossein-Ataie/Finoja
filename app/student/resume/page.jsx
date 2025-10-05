// ================= app/student/resume/page.jsx =================
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

/* ------------------- ثابت‌های UI ------------------- */
const BRAND = "#2563eb";
const RIGHT_SIDEBAR_W = 260;
const R_CARD = 2; // 8px
const R_SECTION = 2; // 8px

/* ------------------- لیست‌ها ------------------- */
const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const LANGUAGE_LEVELS = [
  "۱۰٪: مبتدی پایه",
  "۳۰٪: پایین‌تر از متوسط",
  "۵۰٪: متوسط",
  "۷۰٪: بالاتر از متوسط",
  "۹۰٪: پیشرفته",
  "۱۰۰٪: مشابه زبان مادری",
];

const ORG_LEVELS = [
  "کارآموز",
  "کارشناس",
  "کارشناس ارشد",
  "سرپرست",
  "مدیر",
  "مدیر ارشد",
];

const SALARY_RANGES = [
  "تا ۲۰ میلیون",
  "۲۰ تا ۳۰ میلیون",
  "۳۰ تا ۴۰ میلیون",
  "۴۰ تا ۶۰ میلیون",
  "۶۰ میلیون به بالا",
];

const FIN_JOB_TITLES = [
  "تحلیل‌گر مالی",
  "کارشناس حسابداری",
  "کارشناس سرمایه‌گذاری",
  "مدل‌ساز مالی",
  "کارشناس ارزش‌گذاری",
  "کارشناس مدیریت ریسک",
  "کارشناس خزانه‌داری",
  "کارشناس اعتبارسنجی",
  "معامله‌گر",
  "پژوهشگر بازار سرمایه",
  "کارشناس بیمه",
  "کارشناس مالیاتی",
];

const FIN_ORG_FIELDS = [
  "بانک",
  "کارگزاری",
  "هلدینگ سرمایه‌گذاری",
  "شرکت تأمین سرمایه",
  "صندوق سرمایه‌گذاری",
  "شرکت تولیدی/غیرمالی",
  "شرکت بیمه",
  "موسسه حسابرسی",
  "استارتاپ فین‌تک",
];

const INTEREST_FIELDS = [
  "تحلیل بنیادی",
  "تحلیل تکنیکال",
  "حسابداری مالی",
  "حسابداری مدیریت",
  "مدیریت ریسک",
  "مدل‌سازی مالی",
  "ارزش‌گذاری سهام",
  "اوراق با درآمد ثابت",
  "بانکداری",
  "بیمه",
];

const DEFAULT_FORM = {
  basic: {
    name: "",
    family: "",
    gender: "",
    marital: "",
    city: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    militaryStatus: "",
    salaryRange: "",
    interestedFields: [],
    foreignNational: false,
    nationality: "",
    disability: false,
    disabilityType: "",
    phone: "",
    email: "",
  },
  educations: [],
  jobs: [],
  languages: [],
  softwareSkills: [],
  extraSkills: [],
  progress: 0,
};

/* ------------------- ابزار: Select با placeholder واقعی ------------------- */
function SelectWithPlaceholder({
  value,
  onChange,
  label,
  placeholder,
  children,
  fullWidth = true,
  disabled = false,
  minWidth,
  size = "medium",
  sx,
}) {
  const mergedSx = minWidth ? { minWidth, ...(sx || {}) } : sx || {};
  return (
    <FormControl
      fullWidth={fullWidth}
      sx={mergedSx}
      disabled={disabled}
      size={size}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value || ""}
        onChange={onChange}
        displayEmpty
        renderValue={(selected) =>
          selected !== "" && selected !== undefined ? (
            selected
          ) : (
            <Typography sx={{ color: "text.disabled" }}>
              {placeholder || `انتخاب ${label}`}
            </Typography>
          )
        }
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        <MenuItem value="">
          <Typography sx={{ color: "text.disabled" }}>
            {placeholder || `انتخاب ${label}`}
          </Typography>
        </MenuItem>
        {children}
      </Select>
    </FormControl>
  );
}

/* ------------------- کمک‌کامپوننت: کارت بخش ------------------- */
function SectionCard({ title, children, subtitle, actions, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: R_SECTION,
        border: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
    >
      {(title || actions) && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Box>
            {title && (
              <Typography component="h3" fontWeight={800} fontSize={16}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Stack>
      )}
      {children}
    </Paper>
  );
}

/* ------------------- کمک‌کامپوننت: چیپ آیکن‌دار و تیتر سکشن ------------------- */
function IconChip({ icon, label, variant = "outlined" }) {
  return (
    <Chip
      size="small"
      variant={variant}
      icon={icon}
      label={label}
      sx={{
        direction: "rtl",
        borderRadius: 1.5,
        "& .MuiChip-icon": { mr: 0, ml: 0.75 },
      }}
    />
  );
}
function SectionTitle({ icon, text }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ mt: 1.5, mb: 0.75 }}
    >
      {icon}
      <Typography fontWeight={800}>{text}</Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: "divider" }} />
    </Stack>
  );
}

/* =============================== Component =============================== */
export default function ResumePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  /** حالت صفحه */
  const [mode, setMode] = useState(/** @type {"edit"|"view"} */ "view");

  /** مراحل فرم فقط وقتی mode === "edit" لازم است */
  const [step, setStep] = useState(0);

  const [form, setForm] = useState(DEFAULT_FORM);

  // برای PDF
  const pdfRef = useRef(null);

  const mobile =
    typeof window !== "undefined"
      ? localStorage.getItem("student_mobile")
      : null;

  /* آواتار برای PDF (Data URL) */
  const [avatarDataUrl, setAvatarDataUrl] = useState("");

  /* رزومه فایل (اختیاری) */
  const [resumeMeta, setResumeMeta] = useState({
    key: null,
    name: "",
    size: 0,
    type: "",
  });
  const fileInputRef = useRef(null);

  /* استفاده از هوک‌های MUI برای تشخیص سایز صفحه */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ------------ Load from API ------------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/students/resume-builder?mobile=${mobile}`
        );
        if (res.ok) {
          const j = await res.json();
          const next = { ...DEFAULT_FORM, ...(j?.resumeForm || {}) };

          setForm(next);

          // اگر خالی است برو روی edit
          const hasAny =
            (next.basic?.name && next.basic?.family) ||
            next.educations?.length ||
            next.jobs?.length ||
            next.languages?.length ||
            next.softwareSkills?.length ||
            next.extraSkills?.length;

          setMode(hasAny ? "view" : "edit");
        } else {
          setMode("edit");
        }
      } catch (e) {
        setMode("edit");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* آواتار را به Data URL بگیر */
  useEffect(() => {
    (async () => {
      try {
        if (!mobile) return;
        const r = await fetch(`/api/students/avatar-dataurl?mobile=${mobile}`);
        if (!r.ok) return;
        const j = await r.json();
        setAvatarDataUrl(j?.dataUrl || "");
      } catch {}
    })();
  }, [mobile]);

  /* متادیتای رزومه فایل از پروفایل (برای کارت بالای صفحه) */
  const fetchResumeMeta = async () => {
    try {
      const res = await fetch("/api/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) return;
      const j = await res.json();
      setResumeMeta({
        key: j?.resume?.key || j?.resumeKey || null,
        name: j?.resume?.name || j?.resumeName || "",
        size: j?.resume?.size || j?.resumeSize || 0,
        type: j?.resume?.type || j?.resumeType || "",
      });
    } catch {}
  };
  useEffect(() => {
    fetchResumeMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------ helpers ------------ */
  const notify = (msg, severity = "info") => setAlert({ msg, severity });

  const update = (path, value) => {
    setForm((prev) => {
      const clone = structuredClone(prev);
      let p = clone;
      for (let i = 0; i < path.length - 1; i++) p = p[path[i]];
      p[path[path.length - 1]] = value;
      return clone;
    });
  };

  const addEdu = () =>
    setForm((f) => ({
      ...f,
      educations: [
        ...f.educations,
        {
          degree: "کارشناسی",
          field: "",
          university: "",
          startYear: "",
          endYear: "",
          gpa: "",
          stillStudying: false,
        },
      ],
    }));

  const addJob = () =>
    setForm((f) => ({
      ...f,
      jobs: [
        ...f.jobs,
        {
          org: "",
          title: "",
          orgField: "",
          level: "",
          country: "ایران",
          city: "",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          current: false,
          achievements: "",
        },
      ],
    }));

  const removeItem = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  /* ------------ Save ------------ */
  const save = async (silent = false) => {
    if (!mobile) return notify("کاربر شناسایی نشد.", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/students/resume-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, resumeForm: form }),
      });
      const j = await res.json();
      if (!res.ok) notify(j.error || "خطا در ذخیره‌سازی", "error");
      else if (!silent) notify("ذخیره شد.", "success");
      setForm((f) => ({ ...f, progress: j.progress ?? f.progress }));
    } catch {
      if (!silent) notify("خطای شبکه", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ------------ Next/Prev ------------ */
  const next = async () => {
    await save(true);
    setStep((s) => Math.min(3, s + 1));
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  /* ------------ PDF ------------ */
  const downloadPDF = async () => {
    try {
      notify("در حال ساخت PDF ...", "info");

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const el = pdfRef.current;
      const canvas = await html2canvas(el, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      let posY = 0;
      pdf.addImage(imgData, "JPEG", 0, posY, imgW, imgH, undefined, "FAST");

      let remaining = imgH - pageH;
      while (remaining > 0) {
        pdf.addPage();
        posY -= pageH;
        pdf.addImage(imgData, "JPEG", 0, posY, imgW, imgH, undefined, "FAST");
        remaining -= pageH;
      }

      pdf.save(`resume-${form.basic?.name || "student"}.pdf`);
      setAlert(null);
    } catch (e) {
      notify("ساخت PDF ناموفق بود.", "error");
    }
  };

  /* ------------ Progress (sidebar) ------------ */
  const PROG = useMemo(() => {
    const p = form.progress ?? 0;
    return { p };
  }, [form.progress]);

  const isComplete = PROG.p === 100;

  /* ------------ رزومه فایل: اکشن‌ها ------------ */
  const fmtBytes = (n) => {
    if (n == null) return "";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

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
        await fetchResumeMeta();
      }
    } catch {
      notify("خطا در بارگذاری رزومه", "error");
    } finally {
      e.target.value = "";
    }
  };

  const openResumeFile = async () => {
    if (!resumeMeta?.key) return notify("رزومه‌ای ثبت نشده.", "info");
    try {
      const res = await fetch("/api/students/resume/presigned");
      const j = await res.json();
      if (!res.ok) return notify(j.error || "خطا در دریافت لینک", "error");
      window.open(j.url, "_blank", "noopener,noreferrer");
    } catch {
      notify("خطا در دریافت لینک", "error");
    }
  };

  const deleteResumeFile = async () => {
    if (!confirm("رزومه حذف شود؟")) return;
    try {
      const res = await fetch("/api/students/resume/delete", {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) notify(j.error || "خطا در حذف رزومه", "error");
      else {
        notify("رزومه حذف شد.", "success");
        await fetchResumeMeta();
      }
    } catch {
      notify("خطا در حذف رزومه", "error");
    }
  };

  /* ------------ لودینگ ------------ */
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =============================== UI =============================== */
  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 1.5, md: 3 },
        py: 3,
        position: "relative",
        // افزایش padding-bottom برای موبایل تا دکمه‌ها زیر فوتر نروند
        pb: { xs: mode === "edit" ? 20 : 16, md: 3 },
        minHeight: "100vh",
      }}
    >
      {/* سایدبار پیشرفت (راست) - فقط در دسکتاپ */}
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 88,
            right: 24,
            width: RIGHT_SIDEBAR_W,
            zIndex: 10,
          }}
        >
          <Paper
            sx={{
              p: 2,
              borderRadius: R_CARD,
              mt: 2,
              border: "1px solid #E6EAF2",
              position: "sticky",
              top: 100,
            }}
            elevation={0}
          >
            <Stack alignItems="center" spacing={1.25}>
              <Box
                sx={{
                  width: 112,
                  height: 112,
                  borderRadius: "50%",
                  position: "relative",
                  background: `conic-gradient(${BRAND} ${
                    PROG.p * 3.6
                  }deg, #E7ECF4 0)`,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 7,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: BRAND,
                    fontSize: 18,
                  }}
                >
                  {PROG.p}٪
                </Box>
              </Box>

              <Typography fontWeight={800}>رزومه فارسی</Typography>
              <Typography color="text.secondary" fontSize={12}>
                {isComplete ? "رزومه تکمیل شده ✅" : "لطفاً مراحل را کامل کنید"}
              </Typography>

              <Divider sx={{ width: "100%", my: 1 }} />

              <Stack spacing={1} sx={{ width: "100%" }}>
                {[
                  { i: 0, label: "اطلاعات اولیه" },
                  { i: 1, label: "سوابق تحصیلی" },
                  { i: 2, label: "سوابق شغلی" },
                  { i: 3, label: "مهارت‌های تکمیلی" },
                ].map((s) => (
                  <Stack
                    key={s.i}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Chip
                      size="small"
                      label={
                        mode === "view"
                          ? "تکمیل شده"
                          : s.i < step
                          ? "انجام شد"
                          : s.i === step
                          ? "در حال تکمیل"
                          : "در انتظار"
                      }
                      color={
                        mode === "view"
                          ? "success"
                          : s.i < step
                          ? "success"
                          : s.i === step
                          ? "primary"
                          : "default"
                      }
                      variant={
                        s.i === step && mode === "edit" ? "filled" : "outlined"
                      }
                      sx={{ minWidth: 104, borderRadius: 1.5 }}
                    />
                    <Typography
                      color={
                        s.i === step && mode === "edit"
                          ? "text.primary"
                          : "text.secondary"
                      }
                    >
                      {s.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* اکشن‌ها: همین‌جا داخل کارت پروگرس */}
              <Stack sx={{ width: "100%", mt: 1.5 }} spacing={1}>
                {mode === "view" ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setMode("edit")}
                  >
                    ویرایش رزومه
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setMode("view")}
                  >
                    مشاهده
                  </Button>
                )}

                <Tooltip
                  title={
                    isComplete
                      ? "دانلود نسخه PDF استاندارد A4"
                      : "پس از تکمیل ۱۰۰٪ فعال می‌شود"
                  }
                >
                  <span>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadPDF}
                      disabled={!isComplete}
                    >
                      دانلود PDF
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* هشدارها */}
      {alert && (
        <Alert
          sx={{ mb: 2 }}
          severity={alert.severity}
          onClose={() => setAlert(null)}
        >
          {alert.msg}
        </Alert>
      )}

      {/* عنوان مرحله / پیش‌نمایش */}
      <Typography
        variant="h6"
        fontWeight={900}
        textAlign="center"
        sx={{ mb: 0.25 }}
      >
        {mode === "edit"
          ? ["اطلاعات اولیه", "سوابق تحصیلی", "سوابق شغلی", "مهارت‌های تکمیلی"][
              step
            ]
          : "پیش‌نمایش رزومه"}
      </Typography>
      <Typography
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 2, fontSize: { xs: "0.875rem", md: "1rem" } }}
      >
        {mode === "edit"
          ? `مرحله ${
              step + 1
            } از 4 • با تکمیل این مرحله رزومه‌تان کامل‌تر می‌شود.`
          : "برای ویرایش از دکمه‌ها در کارت پیشرفت استفاده کنید."}
      </Typography>
      {/* کارت رزومه فایل (اختیاری) */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: R_CARD,
          mb: 2,
          borderColor: "#E6EAF2",
          bgcolor: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={800} sx={{ mb: 0.25 }}>
              رزومه فایل (اختیاری)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              می‌توانید PDF/DOC/DOCX آپلود کنید؛ توصیه: هم فایل، هم رزومه‌ساز را
              کامل کنید تا کارفرماها راحت‌تر شما را پیدا کنند.
            </Typography>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mt: { xs: 1, md: 0 } }}
          >
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={onUploadClick}
              sx={{
                borderRadius: 1.5,
                bgcolor: BRAND,
                "&:hover": { bgcolor: "#1A56DB" },
              }}
              size={isSmallMobile ? "small" : "medium"}
            >
              {resumeMeta?.key ? "تعویض" : "آپلود"}
            </Button>

            <Tooltip title="مشاهده فایل">
              <span>
                <IconButton
                  onClick={openResumeFile}
                  disabled={!resumeMeta?.key}
                  color="primary"
                  sx={{ border: "1px solid #E6EAF2", borderRadius: 1.5 }}
                  size={isSmallMobile ? "small" : "medium"}
                >
                  <OpenInNewIcon
                    fontSize={isSmallMobile ? "small" : "medium"}
                  />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="حذف فایل">
              <span>
                <IconButton
                  onClick={deleteResumeFile}
                  disabled={!resumeMeta?.key}
                  color="error"
                  sx={{ border: "1px solid #F3D3D3", borderRadius: 1.5 }}
                  size={isSmallMobile ? "small" : "medium"}
                >
                  <DeleteOutlineIcon
                    fontSize={isSmallMobile ? "small" : "medium"}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mt: 1 }}>
          {resumeMeta?.key ? (
            <>
              {resumeMeta?.type?.includes?.("pdf") ? (
                <PictureAsPdfIcon
                  sx={{
                    color: "#E53935",
                    fontSize: isSmallMobile ? "small" : "medium",
                  }}
                />
              ) : (
                <DescriptionIcon
                  sx={{
                    color: BRAND,
                    fontSize: isSmallMobile ? "small" : "medium",
                  }}
                />
              )}
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize={isSmallMobile ? "0.75rem" : "0.875rem"}
              >
                {resumeMeta?.name || "resume"}
                {resumeMeta?.size ? ` • ${fmtBytes(resumeMeta.size)}` : ""}
              </Typography>
            </>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize={isSmallMobile ? "0.75rem" : "0.875rem"}
            >
              هنوز فایلی آپلود نشده است.
            </Typography>
          )}
        </Stack>
      </Paper>

      <Grid
        container
        spacing={2}
        sx={{
          pr: { md: `${RIGHT_SIDEBAR_W + 24}px` },
          // کاهش margin-bottom در موبایل برای فضای بیشتر
          mb: { xs: 8, md: 0 },
        }}
      >
        {/* === حالت EDIT: فرم‌ها === */}
        {mode === "edit" && (
          <>
            {/* مرحله 1: اطلاعات اولیه */}
            {step === 0 && (
              <Grid item xs={12}>
                <SectionCard
                  title="اطلاعات اولیه"
                  subtitle="فیلدهای ستاره‌دار ضروری هستند."
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="نام *"
                        value={form.basic.name}
                        onChange={(e) =>
                          update(["basic", "name"], e.target.value)
                        }
                        placeholder="مثلاً: محمدحسین"
                        size={isSmallMobile ? "small" : "medium"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="نام خانوادگی *"
                        value={form.basic.family}
                        onChange={(e) =>
                          update(["basic", "family"], e.target.value)
                        }
                        placeholder="مثلاً: عطایی"
                        size={isSmallMobile ? "small" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectWithPlaceholder
                        label="جنسیت"
                        placeholder="انتخاب جنسیت"
                        value={form.basic.gender}
                        onChange={(e) =>
                          update(["basic", "gender"], e.target.value)
                        }
                        size={isSmallMobile ? "small" : "medium"}
                      >
                        <MenuItem value="male">مرد</MenuItem>
                        <MenuItem value="female">زن</MenuItem>
                        <MenuItem value="other">سایر</MenuItem>
                      </SelectWithPlaceholder>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectWithPlaceholder
                        label="وضعیت تأهل"
                        placeholder="انتخاب وضعیت تأهل"
                        value={form.basic.marital}
                        onChange={(e) =>
                          update(["basic", "marital"], e.target.value)
                        }
                        size={isSmallMobile ? "small" : "medium"}
                      >
                        <MenuItem value="single">مجرد</MenuItem>
                        <MenuItem value="married">متأهل</MenuItem>
                      </SelectWithPlaceholder>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="شهر محل سکونت"
                        value={form.basic.city}
                        onChange={(e) =>
                          update(["basic", "city"], e.target.value)
                        }
                        placeholder="مثلاً: تهران"
                        size={isSmallMobile ? "small" : "medium"}
                      />
                    </Grid>

                    {/* تاریخ تولد */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <FormLabel
                          sx={{
                            mb: 0.75,
                            fontSize: isSmallMobile ? "0.875rem" : "1rem",
                          }}
                        >
                          تاریخ تولد
                        </FormLabel>
                        <Stack
                          direction="row"
                          gap={1}
                          sx={{ flexWrap: isSmallMobile ? "wrap" : "nowrap" }}
                        >
                          <SelectWithPlaceholder
                            label="روز"
                            placeholder="روز"
                            value={form.basic.birthDay}
                            onChange={(e) =>
                              update(["basic", "birthDay"], e.target.value)
                            }
                            fullWidth={isSmallMobile}
                            minWidth={isSmallMobile ? undefined : 110}
                            size={isSmallMobile ? "small" : "medium"}
                            sx={{ flex: isSmallMobile ? 1 : undefined }}
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (d) => (
                                <MenuItem key={d} value={String(d)}>
                                  {d}
                                </MenuItem>
                              )
                            )}
                          </SelectWithPlaceholder>

                          <SelectWithPlaceholder
                            label="ماه"
                            placeholder="ماه"
                            value={form.basic.birthMonth}
                            onChange={(e) =>
                              update(["basic", "birthMonth"], e.target.value)
                            }
                            fullWidth={isSmallMobile}
                            minWidth={isSmallMobile ? undefined : 150}
                            size={isSmallMobile ? "small" : "medium"}
                            sx={{ flex: isSmallMobile ? 1 : undefined }}
                          >
                            {MONTHS.map((m) => (
                              <MenuItem key={m} value={m}>
                                {m}
                              </MenuItem>
                            ))}
                          </SelectWithPlaceholder>

                          <SelectWithPlaceholder
                            label="سال"
                            placeholder="سال"
                            value={form.basic.birthYear}
                            onChange={(e) =>
                              update(["basic", "birthYear"], e.target.value)
                            }
                            fullWidth={isSmallMobile}
                            minWidth={isSmallMobile ? undefined : 130}
                            size={isSmallMobile ? "small" : "medium"}
                            sx={{ flex: isSmallMobile ? 1 : undefined }}
                          >
                            {Array.from({ length: 60 }, (_, i) => 1405 - i).map(
                              (y) => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              )
                            )}
                          </SelectWithPlaceholder>
                        </Stack>
                        <FormHelperText>نمونه: ۲۰ شهریور ۱۳۷۹</FormHelperText>
                      </FormControl>
                    </Grid>

                    {/* نظام وظیفه فقط برای مرد */}
                    {form.basic.gender === "male" && (
                      <Grid item xs={12} sm={6}>
                        <SelectWithPlaceholder
                          label="وضعیت نظام‌وظیفه"
                          placeholder="انتخاب وضعیت"
                          value={form.basic.militaryStatus}
                          onChange={(e) =>
                            update(["basic", "militaryStatus"], e.target.value)
                          }
                          size={isSmallMobile ? "small" : "medium"}
                        >
                          <MenuItem value="انجام‌شده">انجام‌شده</MenuItem>
                          <MenuItem value="معافیت">معافیت</MenuItem>
                          <MenuItem value="در حال خدمت">در حال خدمت</MenuItem>
                          <MenuItem value="معافیت تحصیلی">
                            معافیت تحصیلی
                          </MenuItem>
                        </SelectWithPlaceholder>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <SelectWithPlaceholder
                        label="حقوق درخواستی"
                        placeholder="انتخاب بازه حقوق"
                        value={form.basic.salaryRange}
                        onChange={(e) =>
                          update(["basic", "salaryRange"], e.target.value)
                        }
                        size={isSmallMobile ? "small" : "medium"}
                      >
                        {SALARY_RANGES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </SelectWithPlaceholder>
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={INTEREST_FIELDS}
                        value={form.basic.interestedFields || []}
                        onChange={(_, v) =>
                          update(["basic", "interestedFields"], v.slice(0, 3))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="علاقه‌مندی‌های شغلی (حداکثر ۳ مورد)"
                            placeholder="مثلاً: تحلیل بنیادی"
                            size={isSmallMobile ? "small" : "medium"}
                          />
                        )}
                        size={isSmallMobile ? "small" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ایمیل"
                        value={form.basic.email}
                        onChange={(e) =>
                          update(["basic", "email"], e.target.value)
                        }
                        placeholder="name@example.com"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">@</InputAdornment>
                          ),
                        }}
                        size={isSmallMobile ? "small" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="شماره تماس *"
                        value={form.basic.phone}
                        onChange={(e) =>
                          update(["basic", "phone"], e.target.value)
                        }
                        placeholder="0912xxxxxxx"
                        size={isSmallMobile ? "small" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!form.basic.foreignNational}
                            onChange={(e) =>
                              update(
                                ["basic", "foreignNational"],
                                e.target.checked
                              )
                            }
                            size={isSmallMobile ? "small" : "medium"}
                          />
                        }
                        label="اتباع خارجی هستم"
                        sx={{ fontSize: isSmallMobile ? "0.875rem" : "1rem" }}
                      />
                      {form.basic.foreignNational && (
                        <TextField
                          sx={{ mt: 1 }}
                          fullWidth
                          label="ملیت"
                          value={form.basic.nationality || ""}
                          onChange={(e) =>
                            update(["basic", "nationality"], e.target.value)
                          }
                          placeholder="مثلاً: افغانستان"
                          size={isSmallMobile ? "small" : "medium"}
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!form.basic.disability}
                            onChange={(e) =>
                              update(["basic", "disability"], e.target.checked)
                            }
                            size={isSmallMobile ? "small" : "medium"}
                          />
                        }
                        label="دارای معلولیت هستم"
                        sx={{ fontSize: isSmallMobile ? "0.875rem" : "1rem" }}
                      />
                      {form.basic.disability && (
                        <TextField
                          sx={{ mt: 1 }}
                          fullWidth
                          label="نوع معلولیت"
                          value={form.basic.disabilityType || ""}
                          onChange={(e) =>
                            update(["basic", "disabilityType"], e.target.value)
                          }
                          size={isSmallMobile ? "small" : "medium"}
                        />
                      )}
                    </Grid>
                  </Grid>
                </SectionCard>
              </Grid>
            )}

            {/* مرحله 2: سوابق تحصیلی */}
            {step === 1 && (
              <Grid item xs={12}>
                <SectionCard
                  title="سوابق تحصیلی"
                  actions={
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addEdu}
                      variant="outlined"
                      size={isSmallMobile ? "small" : "medium"}
                    >
                      افزودن مقطع
                    </Button>
                  }
                >
                  {form.educations.length === 0 && (
                    <Typography color="text.secondary">
                      هنوز موردی ثبت نشده است.
                    </Typography>
                  )}

                  <Stack spacing={2}>
                    {form.educations.map((e, idx) => (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: R_SECTION }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <SelectWithPlaceholder
                              label="مقطع"
                              placeholder="انتخاب مقطع"
                              value={e.degree}
                              onChange={(ev) =>
                                update(
                                  ["educations", idx, "degree"],
                                  ev.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {[
                                "زیر دیپلم",
                                "دیپلم",
                                "کاردانی",
                                "کارشناسی",
                                "کارشناسی ارشد",
                                "دکترا",
                              ].map((d) => (
                                <MenuItem key={d} value={d}>
                                  {d}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="رشته"
                              value={e.field || ""}
                              onChange={(ev) =>
                                update(
                                  ["educations", idx, "field"],
                                  ev.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="دانشگاه/مؤسسه"
                              value={e.university || ""}
                              onChange={(ev) =>
                                update(
                                  ["educations", idx, "university"],
                                  ev.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="معدل (اختیاری)"
                              value={e.gpa || ""}
                              onChange={(ev) =>
                                update(
                                  ["educations", idx, "gpa"],
                                  ev.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <SelectWithPlaceholder
                              label="سال شروع"
                              placeholder="سال شروع"
                              value={e.startYear}
                              onChange={(ev) =>
                                update(
                                  ["educations", idx, "startYear"],
                                  ev.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {Array.from(
                                { length: 40 },
                                (_, i) => 1405 - i
                              ).map((y) => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <SelectWithPlaceholder
                              label="سال پایان"
                              placeholder="سال پایان"
                              value={e.endYear}
                              onChange={(ev) =>
                                update(
                                  ["educations", idx, "endYear"],
                                  ev.target.value
                                )
                              }
                              disabled={e.stillStudying}
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {Array.from(
                                { length: 40 },
                                (_, i) => 1405 - i
                              ).map((y) => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!e.stillStudying}
                                  onChange={(ev) =>
                                    update(
                                      ["educations", idx, "stillStudying"],
                                      ev.target.checked
                                    )
                                  }
                                  size={isSmallMobile ? "small" : "medium"}
                                />
                              }
                              label="هنوز در حال تحصیل هستم"
                              sx={{
                                fontSize: isSmallMobile ? "0.875rem" : "1rem",
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" justifyContent="flex-end">
                          <IconButton
                            color="error"
                            onClick={() => removeItem("educations", idx)}
                            size={isSmallMobile ? "small" : "medium"}
                          >
                            <DeleteOutlineIcon
                              fontSize={isSmallMobile ? "small" : "medium"}
                            />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </SectionCard>
              </Grid>
            )}

            {/* مرحله 3: سوابق شغلی */}
            {step === 2 && (
              <Grid item xs={12}>
                <SectionCard
                  title="سوابق شغلی"
                  actions={
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addJob}
                      variant="outlined"
                      size={isSmallMobile ? "small" : "medium"}
                    >
                      افزودن سابقه
                    </Button>
                  }
                >
                  {form.jobs.length === 0 && (
                    <Typography color="text.secondary">
                      هنوز موردی ثبت نشده است.
                    </Typography>
                  )}

                  <Stack spacing={2}>
                    {form.jobs.map((j, idx) => (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: R_SECTION }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="نام سازمان"
                              value={j.org || ""}
                              onChange={(e) =>
                                update(["jobs", idx, "org"], e.target.value)
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Autocomplete
                              options={FIN_JOB_TITLES}
                              value={j.title || ""}
                              onChange={(_, v) =>
                                update(["jobs", idx, "title"], v || "")
                              }
                              renderInput={(p) => (
                                <TextField
                                  {...p}
                                  label="عنوان شغلی"
                                  fullWidth
                                  size={isSmallMobile ? "small" : "medium"}
                                />
                              )}
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Autocomplete
                              options={FIN_ORG_FIELDS}
                              value={j.orgField || ""}
                              onChange={(_, v) =>
                                update(["jobs", idx, "orgField"], v || "")
                              }
                              renderInput={(p) => (
                                <TextField
                                  {...p}
                                  label="زمینه فعالیت شرکت"
                                  fullWidth
                                  size={isSmallMobile ? "small" : "medium"}
                                />
                              )}
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <SelectWithPlaceholder
                              label="رده سازمانی"
                              placeholder="انتخاب رده"
                              value={j.level}
                              onChange={(e) =>
                                update(["jobs", idx, "level"], e.target.value)
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {ORG_LEVELS.map((x) => (
                                <MenuItem key={x} value={x}>
                                  {x}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="کشور"
                              value={j.country || "ایران"}
                              onChange={(e) =>
                                update(["jobs", idx, "country"], e.target.value)
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="شهر"
                              value={j.city || ""}
                              onChange={(e) =>
                                update(["jobs", idx, "city"], e.target.value)
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <SelectWithPlaceholder
                              label="ماه شروع"
                              placeholder="ماه شروع"
                              value={j.startMonth}
                              onChange={(e) =>
                                update(
                                  ["jobs", idx, "startMonth"],
                                  e.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {MONTHS.map((m) => (
                                <MenuItem key={m} value={m}>
                                  {m}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <SelectWithPlaceholder
                              label="سال شروع"
                              placeholder="سال شروع"
                              value={j.startYear}
                              onChange={(e) =>
                                update(
                                  ["jobs", idx, "startYear"],
                                  e.target.value
                                )
                              }
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {Array.from(
                                { length: 40 },
                                (_, i) => 1405 - i
                              ).map((y) => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <SelectWithPlaceholder
                              label="ماه پایان"
                              placeholder="ماه پایان"
                              value={j.endMonth}
                              onChange={(e) =>
                                update(
                                  ["jobs", idx, "endMonth"],
                                  e.target.value
                                )
                              }
                              disabled={j.current}
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {MONTHS.map((m) => (
                                <MenuItem key={m} value={m}>
                                  {m}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <SelectWithPlaceholder
                              label="سال پایان"
                              placeholder="سال پایان"
                              value={j.endYear}
                              onChange={(e) =>
                                update(["jobs", idx, "endYear"], e.target.value)
                              }
                              disabled={j.current}
                              size={isSmallMobile ? "small" : "medium"}
                            >
                              {Array.from(
                                { length: 40 },
                                (_, i) => 1405 - i
                              ).map((y) => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              ))}
                            </SelectWithPlaceholder>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!j.current}
                                  onChange={(e) =>
                                    update(
                                      ["jobs", idx, "current"],
                                      e.target.checked
                                    )
                                  }
                                  size={isSmallMobile ? "small" : "medium"}
                                />
                              }
                              label="هنوز در این شرکت مشغول به کار هستم"
                              sx={{
                                fontSize: isSmallMobile ? "0.875rem" : "1rem",
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="دستاوردها و وظایف کلیدی (اختیاری)"
                              value={j.achievements || ""}
                              onChange={(e) =>
                                update(
                                  ["jobs", idx, "achievements"],
                                  e.target.value
                                )
                              }
                              multiline
                              minRows={3}
                              placeholder="• تحلیل ماهانه جریان نقدی • بهبود …"
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          </Grid>
                        </Grid>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mt: 1 }}
                        >
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon color="success" />}
                            label="سابقه شغلی"
                            variant="outlined"
                            sx={{ borderRadius: 1.5 }}
                          />
                          <IconButton
                            color="error"
                            onClick={() => removeItem("jobs", idx)}
                            size={isSmallMobile ? "small" : "medium"}
                          >
                            <DeleteOutlineIcon
                              fontSize={isSmallMobile ? "small" : "medium"}
                            />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </SectionCard>
              </Grid>
            )}

            {/* مرحله 4: مهارت‌ها */}
            {step === 3 && (
              <Grid item xs={12}>
                <SectionCard title="مهارت‌های تکمیلی">
                  {/* زبان‌ها */}
                  <SectionCard title="زبان‌ها" sx={{ mb: 2 }}>
                    <Stack spacing={1}>
                      {(form.languages || []).map((ln, idx) => (
                        <Stack
                          key={idx}
                          direction={{ xs: "column", md: "row" }}
                          spacing={1}
                          alignItems={{ md: "center" }}
                        >
                          <TextField
                            label="زبان (مثلاً انگلیسی)"
                            value={ln.name || ""}
                            onChange={(e) =>
                              update(["languages", idx, "name"], e.target.value)
                            }
                            sx={{ flex: 1 }}
                            size={isSmallMobile ? "small" : "medium"}
                          />
                          <SelectWithPlaceholder
                            label="سطح مهارت"
                            placeholder="انتخاب سطح"
                            value={ln.level}
                            onChange={(e) =>
                              update(
                                ["languages", idx, "level"],
                                e.target.value
                              )
                            }
                            fullWidth={false}
                            sx={{
                              flex: 2,
                              minWidth: isSmallMobile ? "100%" : 200,
                            }}
                            size={isSmallMobile ? "small" : "medium"}
                          >
                            {LANGUAGE_LEVELS.map((l) => (
                              <MenuItem key={l} value={l}>
                                {l}
                              </MenuItem>
                            ))}
                          </SelectWithPlaceholder>
                          <IconButton
                            color="error"
                            onClick={() => removeItem("languages", idx)}
                            size={isSmallMobile ? "small" : "medium"}
                            sx={{
                              alignSelf: isSmallMobile
                                ? "flex-start"
                                : "center",
                            }}
                          >
                            <DeleteOutlineIcon
                              fontSize={isSmallMobile ? "small" : "medium"}
                            />
                          </IconButton>
                        </Stack>
                      ))}
                      <Button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            languages: [
                              ...(f.languages || []),
                              { name: "انگلیسی", level: "" },
                            ],
                          }))
                        }
                        startIcon={<AddIcon />}
                        variant="outlined"
                        size={isSmallMobile ? "small" : "medium"}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        افزودن زبان
                      </Button>
                    </Stack>
                  </SectionCard>

                  {/* نرم‌افزارها */}
                  <SectionCard
                    title="مهارت‌های نرم‌افزاری (مالی)"
                    sx={{ mb: 2 }}
                  >
                    <Autocomplete
                      multiple
                      options={[
                        "Excel (پیشرفته)",
                        "Power BI",
                        "Python (Pandas/Finance)",
                        "R",
                        "SQL",
                        "EViews",
                        "SPSS",
                        "Stata",
                        "Comfar/Capital Budgeting",
                      ]}
                      value={form.softwareSkills || []}
                      onChange={(_, v) => update(["softwareSkills"], v)}
                      renderInput={(p) => (
                        <TextField
                          {...p}
                          label="نرم‌افزارها را انتخاب کنید"
                          size={isSmallMobile ? "small" : "medium"}
                        />
                      )}
                      size={isSmallMobile ? "small" : "medium"}
                    />
                  </SectionCard>

                  {/* مهارت‌های تکمیلی */}
                  <SectionCard title="مهارت‌های تکمیلی">
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[
                        "تحلیل صورت‌های مالی",
                        "تحلیل صنعت",
                        "مدل‌سازی جریان نقدی تنزیل‌شده (DCF)",
                        "ارزش‌گذاری نسبی (P/E, EV/EBITDA, ...)",
                        "مدیریت پرتفوی",
                        "تحلیل ریسک",
                        "قوانین و مقررات بازار سرمایه",
                      ]}
                      value={form.extraSkills || []}
                      onChange={(_, v) => update(["extraSkills"], v)}
                      renderInput={(p) => (
                        <TextField
                          {...p}
                          label="مثلاً: مدل‌سازی مالی"
                          size={isSmallMobile ? "small" : "medium"}
                        />
                      )}
                      size={isSmallMobile ? "small" : "medium"}
                    />
                  </SectionCard>
                </SectionCard>
              </Grid>
            )}

            {/* کنترل‌ها */}
            <Grid item xs={12}>
              <SectionCard sx={{ p: 1.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mt: 0.5 }}
                  flexWrap="wrap"
                  gap={1}
                >
                  <Button
                    startIcon={<ChevronRightIcon />}
                    variant="text"
                    disabled={step === 0 || saving}
                    onClick={prev}
                    size={isSmallMobile ? "small" : "medium"}
                    sx={{ order: { xs: 2, sm: 1 } }}
                  >
                    قبلی
                  </Button>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ order: { xs: 1, sm: 2 } }}
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<SaveIcon />}
                      onClick={() => save()}
                      disabled={saving}
                      size={isSmallMobile ? "small" : "medium"}
                    >
                      ذخیره
                    </Button>
                    {step < 3 ? (
                      <Button
                        variant="contained"
                        onClick={next}
                        disabled={saving}
                        size={isSmallMobile ? "small" : "medium"}
                      >
                        ذخیره و مرحله بعد
                      </Button>
                    ) : (
                      <Tooltip
                        title={isComplete ? "دانلود PDF" : "بعد از تکمیل ۱۰۰٪"}
                      >
                        <span>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadPDF}
                            disabled={!isComplete || saving}
                            size={isSmallMobile ? "small" : "medium"}
                          >
                            دانلود PDF
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </SectionCard>
            </Grid>
          </>
        )}

        {/* === پیش‌نمایش (در هر دو حالت نمایش داده می‌شود) === */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <SectionCard title="پیش‌نمایش رزومه">
            {/* ظرف A4: عرض ثابت تا html2canvas نتیجه نوار باریک ندهد */}
            <Box
              ref={pdfRef}
              dir="rtl"
              sx={{
                width: { xs: "100%", md: "794px" }, // ریسپانسیو در موبایل
                maxWidth: "100%",
                mx: "auto",
                bgcolor: "#fff",
                p: { xs: 2, md: 3 },
                borderRadius: R_CARD,
                border: "1px solid",
                borderColor: "divider",
                lineHeight: 1.9,
                overflowX: "auto", // برای موبایل اگر محتوا عریض باشد
              }}
            >
              {/* Header با آواتار + کانتکت‌ها */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 1.5 }}
              >
                <Box
                  component="img"
                  alt="avatar"
                  src={
                    avatarDataUrl ||
                    `data:image/svg+xml;utf8,${encodeURIComponent(
                      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
                         <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
                           <stop offset='0' stop-color='#dbeafe'/><stop offset='1' stop-color='#bfdbfe'/></linearGradient></defs>
                         <rect width='128' height='128' rx='64' fill='url(#g)'/>
                         <circle cx='64' cy='48' r='24' fill='#fff'/>
                         <rect x='24' y='80' width='80' height='32' rx='16' fill='#fff'/>
                       </svg>`
                    )}`
                  }
                  sx={{
                    width: { xs: 64, sm: 84 },
                    height: { xs: 64, sm: 84 },
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, width: "100%" }}>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{
                      color: BRAND,
                      mb: 0.5,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    }}
                  >
                    {form.basic?.name || "-"} {form.basic?.family || ""}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {form.basic?.email && (
                      <IconChip
                        icon={<EmailOutlinedIcon fontSize="small" />}
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {form.basic.email}
                          </Typography>
                        }
                      />
                    )}
                    {form.basic?.phone && (
                      <IconChip
                        icon={<LocalPhoneOutlinedIcon fontSize="small" />}
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {form.basic.phone}
                          </Typography>
                        }
                      />
                    )}
                    {form.basic?.city && (
                      <IconChip
                        icon={<LocationOnOutlinedIcon fontSize="small" />}
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {form.basic.city}
                          </Typography>
                        }
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* اطلاعات کلیدی با آیکن */}
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{ mb: 1.25 }}
                gap={1}
              >
                {form.basic?.birthDay &&
                  form.basic?.birthMonth &&
                  form.basic?.birthYear && (
                    <IconChip
                      icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                      label={
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                        >
                          {`تولد: ${form.basic.birthDay} ${form.basic.birthMonth} ${form.basic.birthYear}`}
                        </Typography>
                      }
                    />
                  )}
                {form.basic?.gender && (
                  <IconChip
                    icon={<WorkOutlineIcon fontSize="small" />}
                    label={
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                      >
                        {`جنسیت: ${
                          form.basic.gender === "male"
                            ? "مرد"
                            : form.basic.gender === "female"
                            ? "زن"
                            : "سایر"
                        }`}
                      </Typography>
                    }
                  />
                )}
                {form.basic?.gender === "male" &&
                  form.basic?.militaryStatus && (
                    <IconChip
                      icon={<MilitaryTechOutlinedIcon fontSize="small" />}
                      label={
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                        >
                          {`ن.وظیفه: ${form.basic.militaryStatus}`}
                        </Typography>
                      }
                    />
                  )}
                {form.basic?.salaryRange && (
                  <IconChip
                    icon={<PaidOutlinedIcon fontSize="small" />}
                    label={
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                      >
                        {`حقوق: ${form.basic.salaryRange}`}
                      </Typography>
                    }
                  />
                )}
                {(form.basic?.interestedFields || []).map((x) => (
                  <IconChip
                    key={x}
                    icon={<WorkOutlineIcon fontSize="small" />}
                    label={
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                      >
                        {x}
                      </Typography>
                    }
                  />
                ))}
              </Stack>

              {/* تحصیلات */}
              {form.educations?.length > 0 && (
                <>
                  <SectionTitle
                    icon={<SchoolOutlinedIcon fontSize="small" />}
                    text="سوابق تحصیلی"
                  />
                  <Stack sx={{ mb: 1.25 }}>
                    {form.educations.map((e, i) => (
                      <Box key={i} sx={{ py: 0.4 }}>
                        <Typography
                          fontWeight={700}
                          sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                        >
                          {e.degree || "-"} — {e.field || "-"}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                        >
                          {e.university || "-"} • {e.startYear || "-"} —{" "}
                          {e.stillStudying ? "تا کنون" : e.endYear || "-"}
                          {e.gpa ? ` • معدل: ${e.gpa}` : ""}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              )}

              {/* شغلی */}
              {form.jobs?.length > 0 && (
                <>
                  <SectionTitle
                    icon={<WorkOutlineIcon fontSize="small" />}
                    text="سوابق شغلی"
                  />
                  <Stack sx={{ mb: 1.25 }}>
                    {form.jobs.map((j, i) => (
                      <Box key={i} sx={{ py: 0.4 }}>
                        <Typography
                          fontWeight={700}
                          sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                        >
                          {j.title || "-"} — {j.org || "-"}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                        >
                          {j.city || ""} {j.country ? `(${j.country})` : ""} •{" "}
                          {j.startMonth} {j.startYear} —{" "}
                          {j.current
                            ? "تا کنون"
                            : `${j.endMonth} ${j.endYear || ""}`}
                          {j.orgField ? ` • حوزه: ${j.orgField}` : ""}
                          {j.level ? ` • رده: ${j.level}` : ""}
                        </Typography>
                        {j.achievements && (
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            }}
                          >
                            {j.achievements}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}

              {/* مهارت‌ها */}
              {(form.softwareSkills?.length > 0 ||
                form.extraSkills?.length > 0) && (
                <>
                  <SectionTitle
                    icon={<BuildOutlinedIcon fontSize="small" />}
                    text="مهارت‌ها"
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mb: 1.25 }}
                    gap={1}
                  >
                    {(form.softwareSkills || []).map((s) => (
                      <Chip
                        key={s}
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {s}
                          </Typography>
                        }
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    ))}
                    {(form.extraSkills || []).map((s) => (
                      <Chip
                        key={s}
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {s}
                          </Typography>
                        }
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    ))}
                  </Stack>
                </>
              )}

              {/* زبان‌ها */}
              {form.languages?.length > 0 && (
                <>
                  <SectionTitle
                    icon={<LanguageOutlinedIcon fontSize="small" />}
                    text="زبان‌ها"
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {form.languages.map((l, i) => (
                      <Chip
                        key={i}
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {`${l.name}: ${l.level}`}
                          </Typography>
                        }
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* نوار اکشن موبایل (وقتی سایدبار نیست) */}
      {isMobile && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 80,
            display: "flex",
            p: 1.5,
            borderRadius: 2,
            alignItems: "center",
            gap: 1,
            zIndex: 1300, // z-index بالا برای جلوگیری از پوشانده شدن
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" sx={{ width: "100%" }} spacing={1}>
            {mode === "view" ? (
              <Button
                fullWidth
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setMode("edit")}
                size="small"
              >
                ویرایش
              </Button>
            ) : (
              <Button
                fullWidth
                color="secondary"
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => setMode("view")}
                size="small"
              >
                مشاهده
              </Button>
            )}
            <Tooltip title={isComplete ? "دانلود PDF" : "بعد از تکمیل ۱۰۰٪"}>
              <span style={{ width: "100%" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadPDF}
                  disabled={!isComplete}
                  size="small"
                >
                  PDF
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
