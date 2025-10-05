// app/company/profile/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Container, Paper, Typography, Box, Chip, Alert,
  Grid, TextField, Button, Tooltip, Divider, Stack
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";

const kycFa = {
  none: "نامشخص",
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
};

function kycColor(status) {
  switch (status) {
    case "approved": return "success";
    case "pending": return "warning";
    case "rejected": return "error";
    default: return "default";
  }
}

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // فرم قابل ویرایش
  const [form, setForm] = useState({
    name: "", field: "", country: "", city: "",
    website: "", description: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      // از /api/employer/me برای هم employer هم company استفاده می‌کنیم
      const r = await fetch("/api/employer/me");
      if (r.ok) {
        const data = await r.json();
        setMe(data);
        const c = data?.company || {};
        setForm({
          name: c.name || "",
          field: c.field || "",
          country: c.country || "",
          city: c.city || "",
          website: c.website || "",
          description: c.description || "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const c = me?.company || {};
  const sub = c?.subscription || {};
  const kycStatus = c?.kyc?.status || "none";
  const kycDocs = c?.kyc?.docs || [];

  const changed = useMemo(() => {
    return (
      (c.name || "") !== form.name.trim() ||
      (c.field || "") !== form.field.trim() ||
      (c.country || "") !== form.country.trim() ||
      (c.city || "") !== form.city.trim() ||
      (c.website || "") !== form.website.trim() ||
      (c.description || "") !== form.description.trim()
    );
  }, [c, form]);

  const save = async () => {
    setMsg(null);
    if (!form.name.trim()) {
      setMsg({ sev: "error", text: "نام شرکت الزامی است." });
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/companies/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ sev: "success", text: "پروفایل با موفقیت به‌روزرسانی شد." });
        setEdit(false);
        // هم‌سان‌سازی state
        setMe((m) => ({ ...m, company: d.company }));
      } else {
        setMsg({ sev: "error", text: d.error || "به‌روزرسانی ناموفق بود." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography>در حال بارگذاری…</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>
            پروفایل شرکت
          </Typography>

          <Chip
            label={`مدارک احراز هویت: ${kycFa[kycStatus] || "نامشخص"}`}
            color={kycColor(kycStatus)}
            icon={
              kycStatus === "approved" ? <TaskAltIcon /> :
              kycStatus === "pending" ? <HourglassEmptyIcon /> :
              kycStatus === "rejected" ? <BlockIcon /> :
              <InfoOutlinedIcon />
            }
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Tooltip
          title="KYC یا «احراز هویت شرکت» یعنی بررسی مدارک ثبتی/هویتی شرکت جهت جلوگیری از سوءاستفاده. تا زمانی که KYC تأیید نشود، برخی امکانات مانند ثبت آگهی یا مشاهده اطلاعات تماس محدود است."
          placement="bottom-start"
        >
          <Box sx={{
            mt: 1.5, p: 1.25, bgcolor: "#f1f7ff",
            border: "1px dashed #c9e1ff", borderRadius: 2,
            display: "flex", gap: 1.2, alignItems: "center"
          }}>
            <InfoOutlinedIcon fontSize="small" />
            <Typography variant="body2">
              وضعیت فعلی شما: <b>{kycFa[kycStatus] || "نامشخص"}</b>
              {kycStatus !== "approved" && " — برای دسترسی کامل، مدارک احراز هویت شرکت باید در پنل ادمین بررسی و تأیید شوند."}
            </Typography>
          </Box>
        </Tooltip>

        {/* نمایش خلاصه‌های کلیدی */}
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {c?.name && <Chip label={`نام: ${c.name}`} />}
          {c?.field && <Chip label={`حوزه: ${c.field}`} />}
          {c?.city && <Chip label={`شهر: ${c.city}`} />}
          {c?.country && <Chip label={`کشور: ${c.country}`} />}
          {c?.website && <Chip label={`وب‌سایت: ${c.website}`} />}
          {!!sub?.plan && <Chip label={`طرح: ${sub.plan}`} />}
          {typeof sub?.credits === "number" && <Chip label={`اعتبار مشاهده تماس: ${sub.credits}`} />}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {msg && <Alert severity={msg.sev} sx={{ mb: 2, borderRadius: 2 }}>{msg.text}</Alert>}

        {/* فرم ویرایش */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>اطلاعات عمومی</Typography>
          {!edit ? (
            <Button variant="outlined" onClick={() => setEdit(true)}>ویرایش</Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="text" onClick={() => { setEdit(false); setForm({
                name: c.name || "", field: c.field || "", country: c.country || "",
                city: c.city || "", website: c.website || "", description: c.description || ""
              }); }}>انصراف</Button>
              <Button variant="contained" onClick={save} disabled={!changed || saving}>
                ذخیره
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField
              label="نام شرکت"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              fullWidth
              disabled={!edit}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="حوزه فعالیت"
              value={form.field}
              onChange={(e) => set("field", e.target.value)}
              fullWidth
              disabled={!edit}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="کشور"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              fullWidth
              disabled={!edit}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="شهر"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              fullWidth
              disabled={!edit}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="وب‌سایت"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              helperText="صرفاً نام دامنه را وارد کنید (مثلاً: example.com)"
              fullWidth
              disabled={!edit}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="توضیحات"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={!edit}
            />
          </Grid>
        </Grid>

        {/* بخش مدارک KYC فقط نمایشی (آپلود/بررسی از پنل ادمین شما) */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            مدارک احراز هویت (KYC)
          </Typography>
          {kycDocs?.length ? (
            <Stack gap={1}>
              {kycDocs.map((d, idx) => (
                <Box key={idx} sx={{
                  p: 1, border: "1px solid #e6eef9", borderRadius: 2,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <Typography variant="body2">
                    {d?.name || d?.key} <Typography component="span" sx={{ color: "text.secondary" }}>({d?.type || "—"})</Typography>
                  </Typography>
                  <Chip size="small" label={`${(d?.size || 0)} بایت`} />
                </Box>
              ))}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              مدرکی ثبت نشده است. پس از بارگذاری مدارک توسط ادمین/شرکت، وضعیت KYC به‌روزرسانی می‌شود.
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
