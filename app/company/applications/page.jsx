// app/company/applications/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Grid, TextField, MenuItem, Button, Chip, Alert } from "@mui/material";

export default function CompanyApplicationsPage() {
  const [jobs, setJobs] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "", withdrawn: "all", jobId: "", q: "" });

  const load = async () => {
    const sp = new URLSearchParams();
    if (filters.status) sp.set("status", filters.status);
    if (filters.withdrawn === "true" || filters.withdrawn === "false") sp.set("withdrawn", filters.withdrawn);
    if (filters.jobId) sp.append("jobId", filters.jobId);
    if (filters.q) sp.set("q", filters.q);
    const r = await fetch(`/api/employer/applications?${sp.toString()}`);
    const d = await r.json().catch(() => ({}));
    if (r.ok) setItems(d.applications || []);
  };

  useEffect(() => {
    (async () => {
      const jr = await fetch("/api/employer/jobs");
      if (jr.ok) setJobs((await jr.json()).jobs || []);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [JSON.stringify(filters)]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>درخواست‌ها (همه آگهی‌ها)</Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <TextField select size="small" label="وضعیت" value={filters.status} onChange={e=>setFilters({...filters, status:e.target.value})}>
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="under_review">در حال بررسی</MenuItem>
            <MenuItem value="pre_approved">پیش‌تایید</MenuItem>
            <MenuItem value="hired">استخدام</MenuItem>
            <MenuItem value="rejected">رد شده</MenuItem>
            <MenuItem value="withdrawn">انصراف‌داده</MenuItem>
          </TextField>

          <TextField select size="small" label="انصراف" value={filters.withdrawn} onChange={e=>setFilters({...filters, withdrawn:e.target.value})}>
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value="false">فقط فعال</MenuItem>
            <MenuItem value="true">فقط انصراف‌داده</MenuItem>
          </TextField>

          <TextField select size="small" label="آگهی" value={filters.jobId} onChange={e=>setFilters({...filters, jobId:e.target.value})}>
            <MenuItem value="">همه</MenuItem>
            {jobs.map(j => <MenuItem key={j._id} value={j._id}>{j.title}</MenuItem>)}
          </TextField>

          <TextField size="small" label="جستجو" value={filters.q} onChange={e=>setFilters({...filters, q:e.target.value})} />
          <Button size="small" variant="text" onClick={()=>setFilters({ status:"", withdrawn:"all", jobId:"", q:"" })}>پاک‌سازی</Button>
        </Box>

        {items.length === 0 && <Alert severity="info">موردی مطابق فیلترها پیدا نشد.</Alert>}

        <Grid container spacing={2}>
          {items.map(a => (
            <Grid item xs={12} md={6} key={a.id}>
              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 800 }}>{a.jobTitle || "—"}</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 0.5 }}>
                  <Chip size="small" label={`وضعیت: ${a.status}`} />
                  {a.withdrawn && <Chip size="small" color="warning" label={`انصراف`} />}
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip size="small" label={`ثبت: ${new Date(a.createdAt).toLocaleString("fa-IR")}`} />
                  <Chip size="small" label={`آخرین تغییر: ${new Date(a.updatedAt).toLocaleString("fa-IR")}`} />
                </Box>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined" href={`/company/jobs/${a.jobId}/applications`}>جزئیات آگهی</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}
