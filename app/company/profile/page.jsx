// app/company/profile/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Chip, Alert } from "@mui/material";

export default function CompanyProfilePage() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/employer/me");
      if (r.ok) setMe(await r.json());
    })();
  }, []);

  const c = me?.company;
  const kyc = c?.kyc?.status || "none";

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>پروفایل شرکت</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label={`نام: ${c?.name || "-"}`} />
          <Chip label={`کشور: ${c?.country || "-"}`} />
          <Chip label={`شهر: ${c?.city || "-"}`} />
          <Chip label={`وب‌سایت: ${c?.website || "-"}`} />
          <Chip color={kyc === "approved" ? "success" : (kyc === "pending" ? "warning" : "default")} label={`KYC: ${kyc}`} />
        </Box>
        {kyc !== "approved" && <Alert severity="info" sx={{ mt: 1 }}>برای تایید KYC مدارک را از مسیر «پنل ادمین» آپلود/تایید کنید.</Alert>}
      </Paper>
    </Container>
  );
}
