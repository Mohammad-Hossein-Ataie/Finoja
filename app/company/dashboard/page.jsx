"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import { IR_PROVINCES } from "../../../utils/iran";

export default function CompanyDashboard() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingKyc, setLoadingKyc] = useState(true);

  // دوره‌ها
  const [courses, setCourses] = useState([]); // {_id,title}
  const loadCourses = async () => {
    const res = await fetch("/api/courses?summary=1");
    const d = await res.json().catch(() => []);
    setCourses(Array.isArray(d) ? d : []);
  };

  // فرم آگهی
  const [job, setJob] = useState({
    title: "",
    description: "",
    salaryRange: "",
    minExpYears: 0,
    gender: "any",
    education: "",
    fieldOfStudy: "",
    skills: [], // strings
    courseIds: [], // {_id,title}
    province: "",
    city: "",
  });
  const setJobField = (k, v) => setJob((j) => ({ ...j, [k]: v }));
  const cities = useMemo(() => {
    const p = IR_PROVINCES.find((x) => x.name === job.province);
    return p ? p.cities : [];
  }, [job.province]);

  // لیست آگهی‌های من
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const notify = (text, sev = "info") => setAlert({ text, sev });
  const kycChip = useMemo(() => {
    const status = kyc?.status || "none";
    const map = {
      none: { label: "احراز هویت: نامشخص", color: "default" },
      pending: { label: "احراز هویت: در انتظار بررسی", color: "warning" },
      rejected: { label: "احراز هویت: رد شده", color: "error" },
      approved: { label: "احراز هویت: تایید شده", color: "success" },
    };
    return map[status] || map.none;
  }, [kyc]);
  const canCreateJob = useMemo(
    () => job.title.trim().length >= 3 && job.description.trim().length >= 10,
    [job]
  );

  const fetchMe = async () => {
    setLoadingMe(true);
    try {
      const res = await fetch("/api/employer/me");
      if (res.status === 401) {
        router.replace("/company/login");
        return;
      }
      const data = await res.json();
      setMe(data);
    } finally {
      setLoadingMe(false);
    }
  };
  const fetchKyc = async () => {
    setLoadingKyc(true);
    try {
      const res = await fetch("/api/companies/kyc");
      const data = await res.json().catch(() => ({}));
      setKyc(data.kyc);
    } finally {
      setLoadingKyc(false);
    }
  };
  const loadMyJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/employer/jobs");
      if (res.status === 401) {
        router.replace("/company/login");
        return;
      }
      const d = await res.json().catch(() => ({}));
      setMyJobs(d.jobs || []);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchKyc();
    loadCourses();
    loadMyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitKyc = async (files) => {
    const res = await fetch("/api/companies/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docs: files }), // [{type,key,name,size}]
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      notify("مدارک ارسال شد. وضعیت شما «در انتظار بررسی» است.", "success");
      fetchKyc();
    } else {
      notify(d.error || "خطا در ارسال مدارک", "error");
    }
  };

  const createJob = async () => {
    const payload = {
      title: job.title.trim(),
      description: job.description.trim(),
      salaryRange: job.salaryRange.trim(),
      minExpYears: Number(job.minExpYears || 0),
      gender: job.gender.trim() || "any",
      education: job.education.trim(),
      fieldOfStudy: job.fieldOfStudy.trim(),
      requiredSkills: job.skills,
      finojaCourseIds: job.courseIds.map((c) => String(c._id)),
      location: { country: "ایران", city: job.city },
    };
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      notify("آگهی ثبت شد.", "success");
      setJob({
        title: "",
        description: "",
        salaryRange: "",
        minExpYears: 0,
        gender: "any",
        education: "",
        fieldOfStudy: "",
        skills: [],
        courseIds: [],
        province: "",
        city: "",
      });
      loadMyJobs();
    } else notify(data.error || "خطا در ثبت آگهی", "error");
  };

  const toggleActive = async (jobId, nextActive) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    });
    if (res.ok)
      setMyJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, active: nextActive } : j))
      );
    else
      notify(
        (await res.json().catch(() => ({}))).error || "خطا در تغییر وضعیت",
        "error"
      );
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("کپی شد.", "success");
    } catch {
      notify("کپی نشد!", "warning");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          داشبورد کارفرما
        </Typography>
        <Tooltip title="به‌روزرسانی">
          <IconButton
            onClick={() => {
              fetchMe();
              fetchKyc();
              loadMyJobs();
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {alert && (
        <Alert
          severity={alert.sev}
          sx={{ mb: 2 }}
          onClose={() => setAlert(null)}
        >
          {alert.text}
        </Alert>
      )}

      {/* احراز هویت شرکت */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>احراز هویت شرکت</Typography>
          {!loadingKyc && (
            <Chip label={kycChip.label} color={kycChip.color} size="small" />
          )}
        </Box>

        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography>
              نام شرکت: {loadingMe ? "..." : me?.company?.name || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              اعتبار مشاهده تماس:{" "}
              {loadingMe ? "..." : me?.company?.subscription?.credits ?? "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              وضعیت: {loadingKyc ? "..." : kyc?.status || "نامشخص"}
            </Typography>
          </Grid>
          {me?.company?.website && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>وب‌سایت: {me.company.website}</Typography>
                <Tooltip title="کپی">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(me.company.website)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          )}
        </Grid>

        {Array.isArray(kyc?.docs) && kyc.docs.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
              مدارک ارسال‌شده:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {kyc.docs.map((d, i) => (
                <Chip
                  key={i}
                  label={`${d.name || d.key} (${d.type || "file"})`}
                />
              ))}
            </Box>
          </Box>
        )}

        <Alert severity="info" sx={{ mb: 1 }}>
          احراز هویت برای نمایش اطلاعات تماس متقاضیان لازم است. یک فایل «روزنامه
          رسمی/ثبت شرکت» یا «نامه روی سربرگ شرکت» ارسال کنید.
        </Alert>

        <Button
          variant="outlined"
          onClick={() =>
            submitKyc([
              {
                type: "registrationDoc",
                key: "kyc/example.pdf",
                name: "example.pdf",
                size: 12345,
              },
            ])
          }
        >
          ارسال مدارک احراز هویت
        </Button>
      </Paper>

      {/* ثبت آگهی */}
      <Paper id="post" sx={{ p: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: "bold", mb: 1 }}>
          ثبت آگهی جدید
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <TextField
              label="عنوان"
              fullWidth
              value={job.title}
              onChange={(e) => setJobField("title", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="توضیحات"
              fullWidth
              multiline
              minRows={4}
              value={job.description}
              onChange={(e) => setJobField("description", e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="حقوق (نمایشی)"
              fullWidth
              value={job.salaryRange}
              onChange={(e) => setJobField("salaryRange", e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="حداقل سابقه (سال)"
              type="number"
              fullWidth
              value={job.minExpYears}
              onChange={(e) => setJobField("minExpYears", e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="جنسیت (any/male/female)"
              fullWidth
              value={job.gender}
              onChange={(e) => setJobField("gender", e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="تحصیلات"
              fullWidth
              value={job.education}
              onChange={(e) => setJobField("education", e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="رشته"
              fullWidth
              value={job.fieldOfStudy}
              onChange={(e) => setJobField("fieldOfStudy", e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>استان</InputLabel>
              <Select
                label="استان"
                value={job.province}
                onChange={(e) => {
                  setJobField("province", e.target.value);
                  setJobField("city", "");
                }}
              >
                {IR_PROVINCES.map((p) => (
                  <MenuItem key={p.name} value={p.name}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth disabled={!job.province}>
              <InputLabel>شهر</InputLabel>
              <Select
                label="شهر"
                value={job.city}
                onChange={(e) => setJobField("city", e.target.value)}
              >
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={job.skills}
              onChange={(_, val) => setJobField("skills", val)}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="مهارت‌ها (Enter برای اضافه‌کردن)"
                  placeholder="Excel, SQL, Power BI"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={courses}
              getOptionLabel={(o) => o.title || ""}
              value={job.courseIds}
              onChange={(_, val) => setJobField("courseIds", val)}
              renderInput={(p) => (
                <TextField {...p} label="دوره‌های مورد نظر (اختیاری)" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={createJob}
              disabled={!canCreateJob}
              startIcon={<SaveIcon />}
            >
              ثبت آگهی
            </Button>
            {!canCreateJob && (
              <Typography
                sx={{ mt: 1, color: "text.secondary" }}
                variant="caption"
              >
                عنوان ≥ ۳ کاراکتر و توضیحات ≥ ۱۰ کاراکتر.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* آگهی‌های من */}
      <Paper id="myjobs" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>آگهی‌های من</Typography>
          <Tooltip title="به‌روزرسانی">
            <IconButton size="small" onClick={loadMyJobs}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {loadingJobs ? (
          <Typography color="text.secondary">در حال بارگذاری...</Typography>
        ) : myJobs.length === 0 ? (
          <Alert severity="info">هنوز آگهی ثبت نکرده‌اید.</Alert>
        ) : (
          myJobs.map((j) => (
            <Card
              key={j._id}
              variant="outlined"
              sx={{ mb: 1.5, borderRadius: 2 }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {j.title}
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {(j.location?.city || "") +
                        (j.location?.country ? "، " + j.location.country : "")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">فعال</Typography>
                      <Switch
                        checked={!!j.active}
                        onChange={(e) => toggleActive(j._id, e.target.checked)}
                      />
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      href={`/company/jobs/${j._id}/applications`}
                      startIcon={<ListAltIcon />}
                    >
                      درخواست‌ها
                    </Button>
                  </Box>
                </Box>
                {j.salaryRange && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Chip size="small" label={`حقوق: ${j.salaryRange}`} />
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Paper>
    </Container>
  );
}
