// app/company/jobs/new/page.jsx
"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Box,             // ⬅️ اینجا اضافه شد
} from "@mui/material";

export default function NewJobPage() {
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    salaryRange: "",
    minExpYears: 0,
    gender: "any",
    education: "",
    fieldOfStudy: "",
    requiredSkills: "",
    country: "",
    city: "",
  });

  useEffect(() => {
    (async () => {
      const mr = await fetch("/api/employer/me");
      if (mr.ok) setMe(await mr.json());
    })();
  }, []);

  const kycStatus = me?.company?.kyc?.status ?? "none";
  const kycApproved = kycStatus === "approved";
  const formDisabled = me ? !kycApproved : false; // تا قبل از لود، فرم فعال بماند

  const submit = async () => {
    setMsg(null);
    const body = {
      title: form.title,
      description: form.description,
      salaryRange: form.salaryRange,
      minExpYears: Number(form.minExpYears || 0),
      gender: form.gender,
      education: form.education,
      fieldOfStudy: form.fieldOfStudy,
      requiredSkills: form.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      finojaCourseIds: [],
      location: { country: form.country, city: form.city },
    };
    const r = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setForm({
        title: "",
        description: "",
        salaryRange: "",
        minExpYears: 0,
        gender: "any",
        education: "",
        fieldOfStudy: "",
        requiredSkills: "",
        country: "",
        city: "",
      });
      setMsg({ ok: true, text: "آگهی با موفقیت ثبت شد." });
    } else {
      setMsg(d?.error || "خطا در ثبت آگهی");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          ثبت آگهی جدید
        </Typography>

        {/* هشدار فقط وقتی me لود شده */}
        {me && !kycApproved && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            برای ثبت آگهی، ابتدا احراز هویت شرکت باید تایید شود.
          </Alert>
        )}

        <Grid
          container
          spacing={2}
          sx={{
            opacity: formDisabled ? 0.6 : 1,
            pointerEvents: formDisabled ? "none" : "auto",
          }}
        >
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="عنوان"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="حقوق (نمایشی)"
              value={form.salaryRange}
              onChange={(e) =>
                setForm({ ...form, salaryRange: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="توضیحات"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="حداقل سابقه (سال)"
              value={form.minExpYears}
              onChange={(e) =>
                setForm({ ...form, minExpYears: e.target.value })
              }
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="تحصیلات"
              value={form.education}
              onChange={(e) =>
                setForm({ ...form, education: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="رشته مرتبط"
              value={form.fieldOfStudy}
              onChange={(e) =>
                setForm({ ...form, fieldOfStudy: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="کشور"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="شهر"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="مهارت‌ها (با ویرگول جدا)"
              value={form.requiredSkills}
              onChange={(e) =>
                setForm({ ...form, requiredSkills: e.target.value })
              }
            />
          </Grid>
        </Grid>

        {msg && (
          <Alert severity={msg.ok ? "success" : "error"} sx={{ mt: 2 }}>
            {msg.text || msg}
          </Alert>
        )}

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={submit}>
            ثبت آگهی
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
