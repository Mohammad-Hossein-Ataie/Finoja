"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function CompanyJobApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/jobs/${id}/applications${showWithdrawn ? "?withdrawn=1" : ""}`
      );
      if (res.status === 401 || res.status === 403) {
        router.replace("/company/login");
        return;
      }
      const data = await res.json();
      setItems(data.applications || []);
    } catch {
      setMsg({ s: "error", t: "خطا در دریافت لیست درخواست‌ها" });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, showWithdrawn]);

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        درخواست‌های دریافت‌شده
      </Typography>

      <Box sx={{ my: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showWithdrawn}
              onChange={(e) => setShowWithdrawn(e.target.checked)}
            />
          }
          label="نمایش انصرافی‌ها"
        />
      </Box>

      {busy && <CircularProgress />}
      {msg && (
        <Alert severity={msg.s} sx={{ my: 2 }}>
          {msg.t}
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 2 }}>
        {items.map((it) => (
          <Box
            key={it.applicationId}
            sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}
          >
            <Typography fontWeight={700}>
              {it.student?.name} {it.student?.family}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {it.student?.city}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(it.student?.softwareSkills || []).slice(0, 6).map((sk, i) => (
                <Chip key={i} size="small" label={sk} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
