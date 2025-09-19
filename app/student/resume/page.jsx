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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/* ------------------- ثابت‌های UI ------------------- */
const BRAND = "#2563eb"; // آبی ملایم
const RIGHT_SIDEBAR_W = 260;

/* ------------------- لیست‌ها ------------------- */
const MONTHS = [
  "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
  "مهر","آبان","آذر","دی","بهمن","اسفند",
];

const LANGUAGE_LEVELS = [
  "۱۰٪: مبتدی پایه",
  "۳۰٪: پایین‌تر از متوسط",
  "۵۰٪: متوسط",
  "۷۰٪: بالاتر از متوسط",
  "۹۰٪: پیشرفته",
  "۱۰۰٪: مشابه زبان مادری",
];

const ORG_LEVELS = ["کارآموز","کارشناس","کارشناس ارشد","سرپرست","مدیر","مدیر ارشد"];

const SALARY_RANGES = [
  "تا ۲۰ میلیون",
  "۲۰ تا ۳۰ میلیون",
  "۳۰ تا ۴۰ میلیون",
  "۴۰ تا ۶۰ میلیون",
  "۶۰ میلیون به بالا",
];

const FIN_JOB_TITLES = [
  "تحلیل‌گر مالی","کارشناس حسابداری","کارشناس سرمایه‌گذاری",
  "مدل‌ساز مالی","کارشناس ارزش‌گذاری","کارشناس مدیریت ریسک",
  "کارشناس خزانه‌داری","کارشناس اعتبارسنجی","معامله‌گر",
  "پژوهشگر بازار سرمایه","کارشناس بیمه","کارشناس مالیاتی",
];

const FIN_ORG_FIELDS = [
  "بانک","کارگزاری","هلدینگ سرمایه‌گذاری","شرکت تأمین سرمایه",
  "صندوق سرمایه‌گذاری","شرکت تولیدی/غیرمالی","شرکت بیمه",
  "موسسه حسابرسی","استارتاپ فین‌تک",
];

const INTEREST_FIELDS = [
  "تحلیل بنیادی","تحلیل تکنیکال","حسابداری مالی","حسابداری مدیریت",
  "مدیریت ریسک","مدل‌سازی مالی","ارزش‌گذاری سهام",
  "اوراق با درآمد ثابت","بانکداری","بیمه",
];

const DEFAULT_FORM = {
  basic: {
    name: "",
    family: "",
    gender: "male",
    marital: "single",
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

/* ------------------- کمک‌کامپوننت: کارت بخش ------------------- */
function SectionCard({ title, children, subtitle, actions, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,           // شعاع معقول؛ نه اغراق‌شده
        border: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
    >
      {(title || actions) && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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

/* =============================================================== */

export default function ResumePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  /** حالت صفحه:
   *  - "edit": فرم ساز رزومه
   *  - "view": فقط پیش‌نمایش/نمایش
   * اگر رزومه خالی باشد => edit؛ در غیر این صورت => view
   */
  const [mode, setMode] = useState/** @type {"edit"|"view"} */("view");

  /** مراحل فرم فقط وقتی mode === "edit" لازم است */
  const [step, setStep] = useState(0);

  const [form, setForm] = useState(DEFAULT_FORM);

  // برای PDF
  const pdfRef = useRef(null);

  const mobile =
    typeof window !== "undefined" ? localStorage.getItem("student_mobile") : null;

  /* ------------ Load from API ------------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/students/resume-builder?mobile=${mobile}`);
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

      // import در زمان اجرا برای کاهش وزن باندل کلاینت
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const el = pdfRef.current;
      // عرض A4 در 96dpi ≈ 794px
      const canvas = await html2canvas(el, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();  // 210
      const pageH = pdf.internal.pageSize.getHeight(); // 297

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

  /* ------------ لودینگ ------------ */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  /* ===============================================================
   *                        UI
   * =============================================================== */
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, md: 3 }, py: 3, position: "relative" }}>
      {/* اکشن‌های بالای صفحه */}
      <Stack direction="row" gap={1} sx={{ mb: 1 }}>
        <Tooltip title="دانلود نسخه PDF استاندارد A4">
          <span>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadPDF}
            >
              دانلود PDF
            </Button>
          </span>
        </Tooltip>

        {mode === "view" ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setMode("edit")}
          >
            ویرایش رزومه
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => setMode("view")}
          >
            مشاهده
          </Button>
        )}
      </Stack>

      {/* سایدبار پیشرفت (راست) */}
      <Box
        sx={{
          position: "fixed",
          top: 88,
          right: 24,
          width: { xs: "auto", md: RIGHT_SIDEBAR_W },
          display: { xs: "none", md: "block" },
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 2 }} elevation={0}>
          <Stack alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                position: "relative",
                background: `conic-gradient(${BRAND} ${PROG.p * 3.6}deg, #E7ECF4 0)`,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  color: BRAND,
                }}
              >
                {PROG.p}٪
              </Box>
            </Box>
            <Typography fontWeight={800}>رزومه فارسی</Typography>
            <Divider sx={{ width: "100%", my: 1 }} />
            <Stack spacing={1} sx={{ width: "100%" }}>
              {[
                { i: 0, label: "اطلاعات اولیه" },
                { i: 1, label: "سوابق تحصیلی" },
                { i: 2, label: "سوابق شغلی" },
                { i: 3, label: "مهارت‌های تکمیلی" },
              ].map((s) => (
                <Stack key={s.i} direction="row" alignItems="center" spacing={1}>
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
                    variant={s.i === step && mode === "edit" ? "filled" : "outlined"}
                    sx={{ minWidth: 100 }}
                  />
                  <Typography color={s.i === step && mode === "edit" ? "text.primary" : "text.secondary"}>
                    {s.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* هشدارها */}
      {alert && (
        <Alert
          sx={{ mb: 1 }}
          severity={alert.severity}
          onClose={() => setAlert(null)}
        >
          {alert.msg}
        </Alert>
      )}

      {/* عنوان مرحله */}
      <Typography variant="h6" fontWeight={900} textAlign="center" sx={{ mb: 0.25 }}>
        {mode === "edit"
          ? ["اطلاعات اولیه", "سوابق تحصیلی", "سوابق شغلی", "مهارت‌های تکمیلی"][step]
          : "پیش‌نمایش رزومه"}
      </Typography>
      <Typography color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
        {mode === "edit"
          ? `مرحله ${step + 1} از 4 • با تکمیل این مرحله رزومه‌تان کامل‌تر می‌شود.`
          : "اگر نیاز به ویرایش دارید، روی «ویرایش رزومه» کلیک کنید."}
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{ pr: { md: `${RIGHT_SIDEBAR_W + 24}px` } }}
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
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="نام *"
                        value={form.basic.name}
                        onChange={(e) => update(["basic", "name"], e.target.value)}
                        placeholder="مثلاً: محمدحسین"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="نام خانوادگی *"
                        value={form.basic.family}
                        onChange={(e) => update(["basic", "family"], e.target.value)}
                        placeholder="مثلاً: عطایی"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>جنسیت</InputLabel>
                        <Select
                          label="جنسیت"
                          value={form.basic.gender}
                          onChange={(e) => update(["basic", "gender"], e.target.value)}
                        >
                          <MenuItem value="male">مرد</MenuItem>
                          <MenuItem value="female">زن</MenuItem>
                          <MenuItem value="other">سایر</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>وضعیت تأهل</InputLabel>
                        <Select
                          label="وضعیت تأهل"
                          value={form.basic.marital}
                          onChange={(e) => update(["basic", "marital"], e.target.value)}
                        >
                          <MenuItem value="single">مجرد</MenuItem>
                          <MenuItem value="married">متأهل</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="شهر محل سکونت"
                        value={form.basic.city}
                        onChange={(e) => update(["basic", "city"], e.target.value)}
                        placeholder="مثلاً: تهران"
                      />
                    </Grid>

                    {/* تاریخ تولد */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ mb: 0.75 }}>تاریخ تولد</FormLabel>
                        <Stack direction="row" gap={1}>
                          <FormControl sx={{ minWidth: 96 }}>
                            <InputLabel>روز</InputLabel>
                            <Select
                              label="روز"
                              value={form.basic.birthDay || ""}
                              onChange={(e) => update(["basic", "birthDay"], e.target.value)}
                            >
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                <MenuItem key={d} value={String(d)}>
                                  {d}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl sx={{ minWidth: 140 }}>
                            <InputLabel>ماه</InputLabel>
                            <Select
                              label="ماه"
                              value={form.basic.birthMonth || ""}
                              onChange={(e) => update(["basic", "birthMonth"], e.target.value)}
                            >
                              {MONTHS.map((m) => (
                                <MenuItem key={m} value={m}>
                                  {m}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>سال</InputLabel>
                            <Select
                              label="سال"
                              value={form.basic.birthYear || ""}
                              onChange={(e) => update(["basic", "birthYear"], e.target.value)}
                            >
                              {Array.from({ length: 60 }, (_, i) => 1405 - i).map((y) => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                        <FormHelperText>نمونه: ۲۰ شهریور ۱۳۷۹</FormHelperText>
                      </FormControl>
                    </Grid>

                    {/* نظام وظیفه فقط برای مرد */}
                    {form.basic.gender === "male" && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>وضعیت نظام‌وظیفه</InputLabel>
                          <Select
                            label="وضعیت نظام‌وظیفه"
                            value={form.basic.militaryStatus || ""}
                            onChange={(e) => update(["basic", "militaryStatus"], e.target.value)}
                          >
                            <MenuItem value="انجام‌شده">انجام‌شده</MenuItem>
                            <MenuItem value="معافیت">معافیت</MenuItem>
                            <MenuItem value="در حال خدمت">در حال خدمت</MenuItem>
                            <MenuItem value="معافیت تحصیلی">معافیت تحصیلی</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>حقوق درخواستی</InputLabel>
                        <Select
                          label="حقوق درخواستی"
                          value={form.basic.salaryRange || ""}
                          onChange={(e) => update(["basic", "salaryRange"], e.target.value)}
                        >
                          {SALARY_RANGES.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={INTEREST_FIELDS}
                        value={form.basic.interestedFields || []}
                        onChange={(_, v) => update(["basic", "interestedFields"], v.slice(0, 3))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="علاقه‌مندی‌های شغلی (حداکثر ۳ مورد)"
                            placeholder="مثلاً: تحلیل بنیادی"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="ایمیل"
                        value={form.basic.email}
                        onChange={(e) => update(["basic", "email"], e.target.value)}
                        placeholder="name@example.com"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">@</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="شماره تماس *"
                        value={form.basic.phone}
                        onChange={(e) => update(["basic", "phone"], e.target.value)}
                        placeholder="0912xxxxxxx"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!form.basic.foreignNational}
                            onChange={(e) => update(["basic", "foreignNational"], e.target.checked)}
                          />
                        }
                        label="اتباع خارجی هستم"
                      />
                      {form.basic.foreignNational && (
                        <TextField
                          sx={{ mt: 1 }}
                          fullWidth
                          label="ملیت"
                          value={form.basic.nationality || ""}
                          onChange={(e) => update(["basic", "nationality"], e.target.value)}
                          placeholder="مثلاً: افغانستان"
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!form.basic.disability}
                            onChange={(e) => update(["basic", "disability"], e.target.checked)}
                          />
                        }
                        label="دارای معلولیت هستم"
                      />
                      {form.basic.disability && (
                        <TextField
                          sx={{ mt: 1 }}
                          fullWidth
                          label="نوع معلولیت"
                          value={form.basic.disabilityType || ""}
                          onChange={(e) => update(["basic", "disabilityType"], e.target.value)}
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
                    <Button startIcon={<AddIcon />} onClick={addEdu} variant="outlined" size="small">
                      افزودن مقطع
                    </Button>
                  }
                >
                  {form.educations.length === 0 && (
                    <Typography color="text.secondary">هنوز موردی ثبت نشده است.</Typography>
                  )}

                  <Stack spacing={2}>
                    {form.educations.map((e, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel>مقطع</InputLabel>
                              <Select
                                label="مقطع"
                                value={e.degree || ""}
                                onChange={(ev) => update(["educations", idx, "degree"], ev.target.value)}
                              >
                                {["زیر دیپلم","دیپلم","کاردانی","کارشناسی","کارشناسی ارشد","دکترا"].map((d) => (
                                  <MenuItem key={d} value={d}>{d}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="رشته"
                              value={e.field || ""}
                              onChange={(ev) => update(["educations", idx, "field"], ev.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="دانشگاه/مؤسسه"
                              value={e.university || ""}
                              onChange={(ev) => update(["educations", idx, "university"], ev.target.value)}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="معدل (اختیاری)"
                              value={e.gpa || ""}
                              onChange={(ev) => update(["educations", idx, "gpa"], ev.target.value)}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>سال شروع</InputLabel>
                              <Select
                                label="سال شروع"
                                value={e.startYear || ""}
                                onChange={(ev) => update(["educations", idx, "startYear"], ev.target.value)}
                              >
                                {Array.from({ length: 40 }, (_, i) => 1405 - i).map((y) => (
                                  <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>سال پایان</InputLabel>
                              <Select
                                label="سال پایان"
                                value={e.endYear || ""}
                                onChange={(ev) => update(["educations", idx, "endYear"], ev.target.value)}
                                disabled={e.stillStudying}
                              >
                                {Array.from({ length: 40 }, (_, i) => 1405 - i).map((y) => (
                                  <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!e.stillStudying}
                                  onChange={(ev) => update(["educations", idx, "stillStudying"], ev.target.checked)}
                                />
                              }
                              label="هنوز در حال تحصیل هستم"
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" justifyContent="flex-end">
                          <IconButton color="error" onClick={() => removeItem("educations", idx)}>
                            <DeleteOutlineIcon />
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
                    <Button startIcon={<AddIcon />} onClick={addJob} variant="outlined" size="small">
                      افزودن سابقه
                    </Button>
                  }
                >
                  {form.jobs.length === 0 && (
                    <Typography color="text.secondary">هنوز موردی ثبت نشده است.</Typography>
                  )}

                  <Stack spacing={2}>
                    {form.jobs.map((j, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="نام سازمان"
                              value={j.org || ""}
                              onChange={(e) => update(["jobs", idx, "org"], e.target.value)}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Autocomplete
                              options={FIN_JOB_TITLES}
                              value={j.title || ""}
                              onChange={(_, v) => update(["jobs", idx, "title"], v || "")}
                              renderInput={(p) => <TextField {...p} label="عنوان شغلی" fullWidth />}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Autocomplete
                              options={FIN_ORG_FIELDS}
                              value={j.orgField || ""}
                              onChange={(_, v) => update(["jobs", idx, "orgField"], v || "")}
                              renderInput={(p) => <TextField {...p} label="زمینه فعالیت شرکت" fullWidth />}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel>رده سازمانی</InputLabel>
                              <Select
                                label="رده سازمانی"
                                value={j.level || ""}
                                onChange={(e) => update(["jobs", idx, "level"], e.target.value)}
                              >
                                {ORG_LEVELS.map((x) => (
                                  <MenuItem key={x} value={x}>{x}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="کشور"
                              value={j.country || "ایران"}
                              onChange={(e) => update(["jobs", idx, "country"], e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="شهر"
                              value={j.city || ""}
                              onChange={(e) => update(["jobs", idx, "city"], e.target.value)}
                            />
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>ماه شروع</InputLabel>
                              <Select
                                label="ماه شروع"
                                value={j.startMonth || ""}
                                onChange={(e) => update(["jobs", idx, "startMonth"], e.target.value)}
                              >
                                {MONTHS.map((m) => (
                                  <MenuItem key={m} value={m}>{m}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>سال شروع</InputLabel>
                              <Select
                                label="سال شروع"
                                value={j.startYear || ""}
                                onChange={(e) => update(["jobs", idx, "startYear"], e.target.value)}
                              >
                                {Array.from({ length: 40 }, (_, i) => 1405 - i).map((y) => (
                                  <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>ماه پایان</InputLabel>
                              <Select
                                label="ماه پایان"
                                value={j.endMonth || ""}
                                onChange={(e) => update(["jobs", idx, "endMonth"], e.target.value)}
                                disabled={j.current}
                              >
                                {MONTHS.map((m) => (
                                  <MenuItem key={m} value={m}>{m}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>سال پایان</InputLabel>
                              <Select
                                label="سال پایان"
                                value={j.endYear || ""}
                                onChange={(e) => update(["jobs", idx, "endYear"], e.target.value)}
                                disabled={j.current}
                              >
                                {Array.from({ length: 40 }, (_, i) => 1405 - i).map((y) => (
                                  <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!j.current}
                                  onChange={(e) => update(["jobs", idx, "current"], e.target.checked)}
                                />
                              }
                              label="هنوز در این شرکت مشغول به کار هستم"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="دستاوردها و وظایف کلیدی (اختیاری)"
                              value={j.achievements || ""}
                              onChange={(e) => update(["jobs", idx, "achievements"], e.target.value)}
                              multiline
                              minRows={3}
                              placeholder="• تحلیل ماهانه جریان نقدی • بهبود …"
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon color="success" />}
                            label="سابقه شغلی"
                            variant="outlined"
                          />
                          <IconButton color="error" onClick={() => removeItem("jobs", idx)}>
                            <DeleteOutlineIcon />
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
                        <Stack key={idx} direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            label="زبان (مثلاً انگلیسی)"
                            value={ln.name || ""}
                            onChange={(e) => update(["languages", idx, "name"], e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <FormControl sx={{ flex: 2 }}>
                            <InputLabel>سطح مهارت</InputLabel>
                            <Select
                              label="سطح مهارت"
                              value={ln.level || ""}
                              onChange={(e) => update(["languages", idx, "level"], e.target.value)}
                            >
                              {LANGUAGE_LEVELS.map((l) => (
                                <MenuItem key={l} value={l}>{l}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <IconButton color="error" onClick={() => removeItem("languages", idx)}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>
                      ))}
                      <Button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            languages: [...(f.languages || []), { name: "انگلیسی", level: "" }],
                          }))
                        }
                        startIcon={<AddIcon />}
                        variant="outlined"
                        size="small"
                        sx={{ alignSelf: "flex-start" }}
                      >
                        افزودن زبان
                      </Button>
                    </Stack>
                  </SectionCard>

                  {/* نرم‌افزارها */}
                  <SectionCard title="مهارت‌های نرم‌افزاری (مالی)" sx={{ mb: 2 }}>
                    <Autocomplete
                      multiple
                      options={[
                        "Excel (پیشرفته)","Power BI","Python (Pandas/Finance)","R","SQL",
                        "EViews","SPSS","Stata","Comfar/Capital Budgeting",
                      ]}
                      value={form.softwareSkills || []}
                      onChange={(_, v) => update(["softwareSkills"], v)}
                      renderInput={(p) => <TextField {...p} label="نرم‌افزارها را انتخاب کنید" />}
                    />
                  </SectionCard>

                  {/* مهارت‌های تکمیلی */}
                  <SectionCard title="مهارت‌های تکمیلی">
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[
                        "تحلیل صورت‌های مالی","تحلیل صنعت","مدل‌سازی جریان نقدی تنزیل‌شده (DCF)",
                        "ارزش‌گذاری نسبی (P/E, EV/EBITDA, ...)","مدیریت پرتفوی","تحلیل ریسک",
                        "قوانین و مقررات بازار سرمایه",
                      ]}
                      value={form.extraSkills || []}
                      onChange={(_, v) => update(["extraSkills"], v)}
                      renderInput={(p) => <TextField {...p} label="مثلاً: مدل‌سازی مالی" />}
                    />
                  </SectionCard>
                </SectionCard>
              </Grid>
            )}

            {/* کنترل‌ها */}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Button
                  startIcon={<ChevronRightIcon />}
                  variant="text"
                  disabled={step === 0 || saving}
                  onClick={prev}
                >
                  قبلی
                </Button>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => save()}
                    disabled={saving}
                  >
                    ذخیره
                  </Button>
                  {step < 3 ? (
                    <Button variant="contained" onClick={next} disabled={saving}>
                      ذخیره و مرحله بعد
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={downloadPDF}
                      disabled={saving}
                    >
                      دانلود PDF
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Grid>
          </>
        )}

        {/* === پیش‌نمایش (در هر دو حالت نمایش داده می‌شود) === */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <SectionCard title="پیش‌نمایش رزومه">
            {/* ظرف A4: عرض ثابت تا html2canvas نتیجه نوار باریک ندهد */}
            <Box
              ref={pdfRef}
              sx={{
                width: "794px",          // A4 @ 96dpi
                maxWidth: "100%",
                mx: "auto",
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Header */}
              <Typography
                component="h2"
                variant="h6"
                fontWeight={900}
                sx={{ color: BRAND }}
              >
                {form.basic?.name || "-"} {form.basic?.family || ""}
              </Typography>
              {(form.basic?.email || form.basic?.phone) && (
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  {form.basic?.email ? `${form.basic.email}` : ""}{" "}
                  {form.basic?.phone ? `• ${form.basic.phone}` : ""}
                </Typography>
              )}
              <Divider sx={{ my: 1.5 }} />

              {/* اطلاعات پایه */}
              <Typography fontWeight={800} sx={{ mb: 0.75 }}>
                اطلاعات
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                {form.basic?.city && <Chip label={`شهر: ${form.basic.city}`} />}
                {form.basic?.birthDay && form.basic?.birthMonth && form.basic?.birthYear && (
                  <Chip label={`تاریخ تولد: ${form.basic.birthDay} ${form.basic.birthMonth} ${form.basic.birthYear}`} />
                )}
                {form.basic?.gender && (
                  <Chip
                    label={`جنسیت: ${
                      form.basic.gender === "male"
                        ? "مرد"
                        : form.basic.gender === "female"
                        ? "زن"
                        : "سایر"
                    }`}
                  />
                )}
                {form.basic?.gender === "male" && form.basic?.militaryStatus && (
                  <Chip label={`ن.وظیفه: ${form.basic.militaryStatus}`} />
                )}
                {form.basic?.salaryRange && <Chip label={`حقوق: ${form.basic.salaryRange}`} />}
                {(form.basic?.interestedFields || []).map((x) => (
                  <Chip key={x} label={x} variant="outlined" />
                ))}
              </Stack>

              {/* تحصیلات */}
              {form.educations?.length > 0 && (
                <>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    سوابق تحصیلی
                  </Typography>
                  <Stack sx={{ mb: 1.5 }}>
                    {form.educations.map((e, i) => (
                      <Box key={i} sx={{ py: 0.5 }}>
                        <Typography fontWeight={700}>
                          {e.degree || "-"} — {e.field || "-"}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
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
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    سوابق شغلی
                  </Typography>
                  <Stack sx={{ mb: 1.5 }}>
                    {form.jobs.map((j, i) => (
                      <Box key={i} sx={{ py: 0.5 }}>
                        <Typography fontWeight={700}>
                          {j.title || "-"} — {j.org || "-"}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {j.city || ""} {j.country ? `(${j.country})` : ""} •{" "}
                          {j.startMonth} {j.startYear} — {j.current ? "تا کنون" : `${j.endMonth} ${j.endYear || ""}`}
                          {j.orgField ? ` • حوزه: ${j.orgField}` : ""}
                          {j.level ? ` • رده: ${j.level}` : ""}
                        </Typography>
                        {j.achievements && (
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {j.achievements}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}

              {/* مهارت‌ها */}
              {(form.softwareSkills?.length > 0 || form.extraSkills?.length > 0) && (
                <>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    مهارت‌ها
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                    {(form.softwareSkills || []).map((s) => (
                      <Chip key={s} label={s} variant="outlined" />
                    ))}
                    {(form.extraSkills || []).map((s) => (
                      <Chip key={s} label={s} variant="outlined" />
                    ))}
                  </Stack>
                </>
              )}

              {/* زبان‌ها */}
              {form.languages?.length > 0 && (
                <>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    زبان‌ها
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {form.languages.map((l, i) => (
                      <Chip key={i} label={`${l.name}: ${l.level}`} />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
