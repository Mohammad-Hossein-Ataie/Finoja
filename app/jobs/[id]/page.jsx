"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

export default function StudentJobDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [myApp, setMyApp] = useState(null);

  const [resumeChoice, setResumeChoice] = useState("builder");
  const [chooseOpen, setChooseOpen] = useState(false);

  const applied = useMemo(() => Boolean(myApp) && !myApp.withdrawn, [myApp]);

  const ensureStudent = async () => {
    // ... منطق احراز هویت دانش‌آموز شما (بدون تغییر)
    return true;
  };

  const fetchMyApp = async () => {
    // ... دریافت وضعیت درخواست فعلی کاربر برای این آگهی (بدون تغییرِ مهم)
  };

  useEffect(() => {
    // ... load job + my application
  }, [id]);

  const apply = async () => {
    if (!(await ensureStudent())) return;
    setChooseOpen(true);
  };

  const confirmApply = async () => {
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeChoice }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus({ text: "درخواست شما ثبت شد.", severity: "success" });
      fetchMyApp();
    } else {
      setStatus({ text: data.error || "خطا در ثبت درخواست", severity: "error" });
    }
  };

  const withdraw = async () => {
    // ... منطق انصراف (بدون تغییر)
  };

  return (
    <>
      <Dialog open={chooseOpen} onClose={() => setChooseOpen(false)}>
        <DialogTitle>انتخاب رزومه برای ارسال</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={resumeChoice}
            onChange={(e) => setResumeChoice(e.target.value)}
          >
            <FormControlLabel
              value="builder"
              control={<Radio />}
              label="رزومه‌ساز (اطلاعات فرم رزومه)"
            />
            <FormControlLabel
              value="uploaded"
              control={<Radio />}
              label="فایل رزومه آپلود‌شده"
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChooseOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={() => {
              setChooseOpen(false);
              confirmApply();
            }}
            disabled={busy}
          >
            تایید و ارسال درخواست
          </Button>
        </DialogActions>
      </Dialog>

      <Container sx={{ py: 3 }}>
        {/* ... بقیه‌ی UI و نمایش اطلاعات آگهی شما بدون تغییر اصلی ... */}

        {status && (
          <Alert severity={status.severity} sx={{ my: 2 }}>
            {status.text}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={apply}
            disabled={busy || applied}
          >
            ارسال درخواست
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={withdraw}
            disabled={busy || !applied}
          >
            انصراف
          </Button>

          <Button
            variant="text"
            onClick={() => router.push("/student/applications")}
          >
            مشاهده درخواست‌های من
          </Button>
        </Box>
      </Container>
    </>
  );
}
