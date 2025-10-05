// app/student/applications/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Card, CardContent, Box, Chip, Button, Alert, Divider } from "@mui/material";

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await fetch("/api/students/applications");
    if (res.status === 401) { router.replace("/students/login"); return; }
    const data = await res.json();
    setItems(data.applications || []);
  };
  useEffect(() => { load(); }, []);

  const withdraw = async (jobId) => {
    if (!confirm("از انصراف مطمئنید؟")) return;
    const res = await fetch(`/api/jobs/${jobId}/withdraw`, { method: "POST" });
    if (res.ok) load();
  };

  const fa = {
    seen: "دیده‌شده",
    under_review: "در حال بررسی",
    pre_approved: "پیش‌تایید",
    hired: "استخدام",
    rejected: "رد شده",
    withdrawn: "انصراف‌داده",
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>درخواست‌های من</Typography>
      {items.length === 0 && <Alert severity="info">هنوز درخواستی ثبت نکرده‌اید.</Alert>}

      {items.map(a => (
        <Card key={a.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{a.jobTitle}</Typography>
                <Typography variant="body2" sx={{ color:"text.secondary" }}>{a.companyName}</Typography>
              </Box>
              <Chip color={a.withdrawn ? "warning" : "default"} label={fa[a.status] || a.status} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
              <Chip size="small" label={`ثبت: ${new Date(a.createdAt).toLocaleString("fa-IR")}`} />
              <Chip size="small" label={`آخرین تغییر: ${new Date(a.updatedAt).toLocaleString("fa-IR")}`} />
              {a.withdrawn && a.withdrawnAt && <Chip size="small" color="warning" label={`انصراف: ${new Date(a.withdrawnAt).toLocaleString("fa-IR")}`} />}
            </Box>

            {a.statusHistory?.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>تاریخچه وضعیت</Typography>
                <Box sx={{ display:"flex", flexDirection:"column", gap: 0.5 }}>
                  {a.statusHistory.map((s, i) => (
                    <Box key={i} sx={{ display:"flex", gap:1, alignItems:"center" }}>
                      <Chip size="small" label={s.statusFa || s.status} />
                      <Typography variant="caption" sx={{ color:"text.secondary" }}>{new Date(s.at).toLocaleString("fa-IR")}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mt:2, display:"flex", gap:1 }}>
              <Button size="small" variant="outlined" href={`/student/jobs/${a.jobId}`}>مشاهده آگهی</Button>
              {!a.withdrawn && <Button size="small" color="error" variant="text" onClick={()=>withdraw(a.jobId)}>انصراف</Button>}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
