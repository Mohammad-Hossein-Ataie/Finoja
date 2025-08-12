"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box, Stack, Typography, Paper, IconButton, Tooltip, Button, Divider,
  TextField, InputAdornment, Select, MenuItem, Chip, Avatar, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Snackbar, Alert,
  Drawer, Slider
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import SchoolIcon from "@mui/icons-material/School";
import StarsIcon from "@mui/icons-material/Stars";

const fetcher = (url, opts = {}) =>
  fetch(url, { credentials: "include", ...opts })
    .then((r) => (r.ok ? r.json() : Promise.reject(r)))
    .catch(() => null);

/* تعداد کل استپ‌های هر دوره */
const totalStepsOfCourse = (course) =>
  course?.sections?.reduce(
    (a, s) => a + s.units?.reduce((b, u) => b + (u.steps?.length || 0), 0),
    0
  ) || 0;

/* نام حروف اول برای آواتار */
const initials = (name = "", family = "") =>
  `${(name[0] || "").toUpperCase()}${(family[0] || "").toUpperCase()}`;

/* CSV ساده */
const toCsv = (rows) => {
  const header = [
    "name", "family", "mobile", "email", "totalXp", "createdAt",
    "learning_count"
  ];
  const lines = [header.join(",")];
  rows.forEach((s) => {
    lines.push([
      s.name, s.family, s.mobile, s.email || "",
      s.totalXp || 0,
      new Date(s.createdAt).toISOString(),
      (s.learning || []).length
    ].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","));
  });
  return lines.join("\n");
};

export default function StudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // فیلترها
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState("all"); // all | courseId | no-course
  const [statusFilter, setStatusFilter] = useState("all"); // all | in-progress | finished | not-started
  const [sortBy, setSortBy] = useState("createdAt-desc"); // xp-desc | createdAt-desc | name-asc

  // ویرایش/جزئیات
  const [editOpen, setEditOpen] = useState(false);
  const [editModel, setEditModel] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStd, setSelectedStd] = useState(null);

  // نوتیف
  const [snack, setSnack] = useState({ open: false, type: "success", text: "" });

  const load = async () => {
    setLoading(true);
    const [sts, crs] = await Promise.all([
      fetcher("/api/students"),
      fetcher("/api/courses"),
    ]);
    setStudents(Array.isArray(sts) ? sts : []);
    setCourses(Array.isArray(crs) ? crs : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const courseMap = useMemo(() => {
    const m = {};
    (courses || []).forEach((c) => (m[c._id] = c));
    return m;
  }, [courses]);

  const filtered = useMemo(() => {
    let list = [...students];

    // سرچ
    const qq = q.trim();
    if (qq) {
      const needle = qq.toLowerCase();
      list = list.filter((s) =>
        [s.name, s.family, s.mobile, s.email]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(needle))
      );
    }

    // فیلتر دوره
    if (courseFilter !== "all") {
      if (courseFilter === "no-course") {
        list = list.filter((s) => (s.learning || []).length === 0);
      } else {
        list = list.filter((s) =>
          (s.learning || []).some((l) => l.courseId === courseFilter)
        );
      }
    }

    // فیلتر وضعیت
    if (statusFilter !== "all") {
      list = list.filter((s) => {
        const L = s.learning || [];
        if (courseFilter !== "all" && courseFilter !== "no-course") {
          const rec = L.find((l) => l.courseId === courseFilter);
          if (!rec) return statusFilter === "not-started";
          const course = courseMap[courseFilter];
          const total = totalStepsOfCourse(course);
          if (statusFilter === "finished") return !!rec.finished || rec.progress >= total;
          if (statusFilter === "in-progress") return !rec.finished && rec.progress > 0 && rec.progress < total;
          if (statusFilter === "not-started") return rec.progress === 0;
          return true;
        } else {
          // بر اساس هر دوره‌ای
          const hasProgress = L.some((l) => l.progress > 0);
          const hasFinished = L.some((l) => l.finished);
          if (statusFilter === "finished") return hasFinished;
          if (statusFilter === "in-progress") return hasProgress && !hasFinished;
          if (statusFilter === "not-started") return !hasProgress;
          return true;
        }
      });
    }

    // مرتب‌سازی
    list.sort((a, b) => {
      if (sortBy === "xp-desc") return (b.totalXp || 0) - (a.totalXp || 0);
      if (sortBy === "name-asc") {
        const an = `${a.family} ${a.name}`.trim();
        const bn = `${b.family} ${b.name}`.trim();
        return an.localeCompare(bn, "fa");
      }
      // createdAt-desc
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [students, q, courseFilter, statusFilter, sortBy, courseMap]);

  const progressForCourse = (s, cid) => {
    const rec = (s.learning || []).find((l) => l.courseId === cid);
    if (!rec) return { value: 0, total: totalStepsOfCourse(courseMap[cid]) || 0, finished: false };
    const total = totalStepsOfCourse(courseMap[cid]);
    return {
      value: Math.min(rec.progress || 0, total),
      total,
      finished: !!rec.finished || rec.progress >= total
    };
  };

  // اکسپورت CSV
  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ویرایش ساده مشخصات
  const openEdit = (s) => {
    setEditModel({ ...s });
    setEditOpen(true);
  };
  const saveEdit = async () => {
    const {_id, name, family, mobile, email} = editModel;
    const res = await fetcher(`/api/students/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, family, mobile, email }),
    });
    if (res?.error) {
      setSnack({ open: true, type: "error", text: res.error || "خطا در ذخیره" });
      return;
    }
    setSnack({ open: true, type: "success", text: "اطلاعات ذخیره شد" });
    setEditOpen(false);
    load();
  };

  // حذف
  const removeStd = async (s) => {
    if (!confirm(`حذف "${s.name} ${s.family}" قطعی است؟`)) return;
    const res = await fetcher(`/api/students/${s._id}`, { method: "DELETE" });
    if (res?.deleted) {
      setSnack({ open: true, type: "success", text: "حذف شد" });
      load();
    } else {
      setSnack({ open: true, type: "error", text: "خطا در حذف" });
    }
  };

  // Drawer جزییات یادگیری
  const openDrawer = (s) => {
    setSelectedStd(s);
    setDrawerOpen(true);
  };

  // تغییر پیشرفت/XP یک دوره
  const updateLearning = async (courseId, patch) => {
    if (!selectedStd) return;
    const rec = (selectedStd.learning || []).find((l) => l.courseId === courseId) || { progress: 0, xp: 0, finished: false };
    const course = courseMap[courseId];
    const total = totalStepsOfCourse(course);
    const payload = {
      mobile: selectedStd.mobile,
      courseId
    };

    if (patch.progress !== undefined) {
      payload.progress = Math.max(0, Math.min(patch.progress, total));
      payload.finished = payload.progress >= total;
    }
    if (patch.reset) {
      payload.progress = 0;
      payload.correct = [];
      payload.wrongByUnit = {};
      payload.reviewQueue = [];
      payload.finished = false;
      // XP را دست نمی‌زنیم اینجا
    }
    if (patch.xp !== undefined) {
      // deltaXp بر اساس اختلاف
      const currentXp = rec.xp || 0;
      payload.deltaXp = (patch.xp - currentXp) | 0;
    }

    const res = await fetcher("/api/students/learning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res?.success) {
      setSnack({ open: true, type: "success", text: "ذخیره شد" });
      // ریفرش دانش‌آموز انتخاب‌شده
      const fresh = await fetcher("/api/students");
      setStudents(Array.isArray(fresh) ? fresh : students);
      const newSel = (fresh || students).find((x) => x._id === selectedStd._id);
      setSelectedStd(newSel || selectedStd);
    } else {
      setSnack({ open: true, type: "error", text: "خطا در ذخیره" });
    }
  };

  // ساخت دانش‌آموز جدید (ساده)
  const createBlank = () => {
    setEditModel({ name: "", family: "", mobile: "", email: "" });
    setEditOpen(true);
  };
  const saveCreate = async () => {
    // پیشنهاد: از /api/register-student یا /api/students استفاده شود (بسته به بک‌اند شما)
    const res = await fetcher("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editModel.name,
        family: editModel.family,
        phone: editModel.mobile,
        email: editModel.email,
      }),
    });
    if (res?.error) {
      setSnack({ open: true, type: "error", text: res.error || "خطا در ایجاد" });
      return;
    }
    setSnack({ open: true, type: "success", text: "یادگیرنده ایجاد شد" });
    setEditOpen(false);
    load();
  };

  /* ---------- UI ---------- */
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1.5, md: 2 }, mt: 1 }}>
      {/* هدر */}
      <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <SchoolIcon color="primary" />
        <Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>
          مدیریت یادگیرندگان
        </Typography>

        <Tooltip title="ریفرش">
          <IconButton onClick={load}><RefreshIcon /></IconButton>
        </Tooltip>
        <Tooltip title="خروجی CSV">
          <IconButton onClick={exportCsv}><DownloadIcon /></IconButton>
        </Tooltip>
        <Button variant="contained" startIcon={<AddIcon />} onClick={createBlank}>
          افزودن یادگیرنده
        </Button>
      </Paper>

      {/* فیلترها */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو (نام، موبایل، ایمیل)"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="course-filter">فیلتر دوره</InputLabel>
            <Select
              labelId="course-filter"
              value={courseFilter}
              label="فیلتر دوره"
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <MenuItem value="all">همه‌ی دوره‌ها</MenuItem>
              <MenuItem value="no-course">بدون دوره</MenuItem>
              {courses.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter">وضعیت</InputLabel>
            <Select
              labelId="status-filter"
              value={statusFilter}
              label="وضعیت"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">همه</MenuItem>
              <MenuItem value="in-progress">در حال یادگیری</MenuItem>
              <MenuItem value="finished">تکمیل‌شده</MenuItem>
              <MenuItem value="not-started">شروع‌نشده</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="sort-by">مرتب‌سازی</InputLabel>
            <Select
              labelId="sort-by"
              value={sortBy}
              label="مرتب‌سازی"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="createdAt-desc">جدیدترین</MenuItem>
              <MenuItem value="xp-desc">XP بیش‌تر</MenuItem>
              <MenuItem value="name-asc">نام خانوادگی (الفبا)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* چیپ‌های راهنما */}
        <Stack direction="row" spacing={1} mt={1.25} flexWrap="wrap">
          {courseFilter !== "all" && (
            <Chip
              label={
                courseFilter === "no-course"
                  ? "فیلتر: بدون دوره"
                  : `فیلتر: ${courses.find((c) => c._id === courseFilter)?.title || ""}`
              }
              onDelete={() => setCourseFilter("all")}
            />
          )}
          {statusFilter !== "all" && (
            <Chip
              label={
                statusFilter === "finished"
                  ? "وضعیت: تکمیل‌شده"
                  : statusFilter === "in-progress"
                  ? "وضعیت: در حال یادگیری"
                  : "وضعیت: شروع‌نشده"
              }
              onDelete={() => setStatusFilter("all")}
            />
          )}
          {!!q && <Chip label={`جستجو: ${q}`} onDelete={() => setQ("")} />}
        </Stack>
      </Paper>

      {/* جدول */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading && <LinearProgress />}
        {!loading && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 800 } }}>
                  <TableCell align="right">یادگیرنده</TableCell>
                  <TableCell align="right">موبایل</TableCell>
                  <TableCell align="right">ایمیل</TableCell>
                  <TableCell align="center">XP کل</TableCell>
                  <TableCell align="center">تعداد دوره</TableCell>
                  {courseFilter !== "all" && courseFilter !== "no-course" && (
                    <TableCell align="center">پیشرفت در این دوره</TableCell>
                  )}
                  <TableCell align="center">اقدامات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((s) => {
                  const courseProg =
                    courseFilter !== "all" && courseFilter !== "no-course"
                      ? progressForCourse(s, courseFilter)
                      : null;

                  return (
                    <TableRow key={s._id} hover>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
                          <Avatar sx={{ bgcolor: "#2477F3" }}>{initials(s.name, s.family)}</Avatar>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography fontWeight={700}>
                              {s.name} {s.family}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {new Date(s.createdAt).toLocaleDateString("fa-IR")}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{s.mobile}</TableCell>
                      <TableCell align="right">{s.email || "-"}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <StarsIcon fontSize="small" sx={{ color: "#F9C846" }} />
                          <Typography fontWeight={700}>{(s.totalXp || 0).toLocaleString("fa-IR")}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{(s.learning || []).length}</TableCell>

                      {courseProg && (
                        <TableCell align="center">
                          <Stack alignItems="center" spacing={0.5}>
                            <LinearProgress
                              variant="determinate"
                              value={courseProg.total ? Math.round((courseProg.value / courseProg.total) * 100) : 0}
                              sx={{ width: 120, height: 8, borderRadius: 5 }}
                            />
                            <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.8 }}>
                              {courseProg.value}/{courseProg.total}
                              {courseProg.finished ? " (تمام)" : ""}
                            </Typography>
                          </Stack>
                        </TableCell>
                      )}

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="جزئیات/ویرایش یادگیری">
                            <IconButton onClick={() => openDrawer(s)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ویرایش مشخصات">
                            <IconButton onClick={() => openEdit(s)}><EditIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton color="error" onClick={() => removeStd(s)}><DeleteIcon /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box py={6} textAlign="center">
                        <Typography>موردی پیدا نشد.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* دیالوگ ویرایش/ایجاد */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>{editModel?._id ? "ویرایش یادگیرنده" : "افزودن یادگیرنده"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="نام"
              value={editModel?.name || ""}
              onChange={(e) => setEditModel((m) => ({ ...m, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="نام خانوادگی"
              value={editModel?.family || ""}
              onChange={(e) => setEditModel((m) => ({ ...m, family: e.target.value }))}
              fullWidth
            />
            <TextField
              label="موبایل"
              value={editModel?.mobile || ""}
              onChange={(e) => setEditModel((m) => ({ ...m, mobile: e.target.value }))}
              fullWidth
            />
            <TextField
              label="ایمیل"
              value={editModel?.email || ""}
              onChange={(e) => setEditModel((m) => ({ ...m, email: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={editModel?._id ? saveEdit : saveCreate}
          >
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer جزئیات یادگیری */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 460 } } }}
      >
        <Box sx={{ p: 2, direction: "rtl" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight={900}>جزئیات یادگیری</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {selectedStd && (
            <>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "#2477F3" }}>{initials(selectedStd.name, selectedStd.family)}</Avatar>
                <Box>
                  <Typography fontWeight={800}>
                    {selectedStd.name} {selectedStd.family}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {selectedStd.mobile} · XP کل: {(selectedStd.totalXp || 0).toLocaleString("fa-IR")}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                دوره‌ها
              </Typography>

              <Stack spacing={1.25}>
                {(selectedStd.learning || []).length === 0 && (
                  <Typography sx={{ opacity: 0.8 }}>رکورد یادگیری ثبت نشده.</Typography>
                )}

                {(selectedStd.learning || []).map((l) => {
                  const course = courseMap[l.courseId];
                  const total = totalStepsOfCourse(course);
                  const perc = total ? Math.round((Math.min(l.progress, total) / total) * 100) : 0;

                  return (
                    <Paper key={l.courseId} sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography fontWeight={700}>{course?.title || "دوره نامشخص"}</Typography>

                      <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                        <LinearProgress value={perc} variant="determinate" sx={{ flex: 1, height: 8, borderRadius: 5 }} />
                        <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 90, textAlign: "center" }}>
                          {Math.min(l.progress, total)}/{total} {l.finished ? "(تمام)" : ""}
                        </Typography>
                      </Stack>

                      {/* کنترل‌ها */}
                      <Box mt={1.5}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>تنظیم پیشرفت</Typography>
                        <Slider
                          value={Math.min(l.progress || 0, total)}
                          min={0}
                          max={total}
                          step={1}
                          onChangeCommitted={(_, val) =>
                            updateLearning(l.courseId, { progress: Number(val) })
                          }
                        />
                        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                          <TextField
                            size="small"
                            label="XP این دوره"
                            type="number"
                            value={l.xp || 0}
                            onChange={(e) =>
                              updateLearning(l.courseId, { xp: Number(e.target.value || 0) })
                            }
                            sx={{ width: 140 }}
                          />
                          <Button
                            color="warning"
                            onClick={() => updateLearning(l.courseId, { reset: true })}
                          >
                            ریست دوره
                          </Button>
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </>
          )}
        </Box>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.type} variant="filled">{snack.text}</Alert>
      </Snackbar>
    </Box>
  );
}
