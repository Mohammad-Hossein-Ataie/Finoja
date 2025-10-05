// app/company/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Chip, Button, Grid, Alert } from "@mui/material";

export default function CompanyDashboard() {
  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    (async () => {
      const mr = await fetch("/api/employer/me");
      if (mr.ok) setMe(await mr.json());
      const jr = await fetch("/api/employer/jobs");
      if (jr.ok) setJobs((await jr.json()).jobs || []);
    })();
  }, []);

  const kyc = me?.company?.kyc?.status || "none";

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>خلاصه وضعیت شرکت</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label={`نام: ${me?.company?.name || "-"}`} />
          <Chip label={`شهر: ${me?.company?.city || "-"}`} />
          <Chip label={`وب‌سایت: ${me?.company?.website || "-"}`} />
          <Chip color={kyc === "approved" ? "success" : (kyc === "pending" ? "warning" : "default")} label={`KYC: ${kyc}`} />
        </Box>
        {kyc !== "approved" && <Alert severity="warning" sx={{ mt: 1 }}>برای ثبت آگهی، KYC باید تایید شود. از منوی «پروفایل شرکت» اقدام کنید.</Alert>}
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>میان‌برها</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button href="/company/profile" variant="outlined">پروفایل شرکت</Button>
          <Button href="/company/jobs/new" variant="contained">ثبت آگهی جدید</Button>
          <Button href="/company/applications" variant="outlined">مشاهده درخواست‌ها</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mt: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>آخرین آگهی‌ها</Typography>
        {jobs.length === 0 ? <Alert severity="info">هنوز آگهی‌ای ثبت نکرده‌اید.</Alert> :
          <Grid container spacing={2}>
            {jobs.slice(0, 4).map(j => (
              <Grid item xs={12} md={6} key={j._id}>
                <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{j.title}</Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                    {j.location?.city && <Chip size="small" label={`شهر: ${j.location.city}`} />}
                    {j.salaryRange && <Chip size="small" label={`حقوق: ${j.salaryRange}`} />}
                  </Box>
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button size="small" href={`/company/jobs/${j._id}/applications`} variant="outlined">درخواست‌ها</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>}
      </Paper>
    </Container>
  );
}
