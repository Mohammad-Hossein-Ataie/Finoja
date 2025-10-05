// app/student/applications/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Card, CardContent, Box, Chip, Button, Alert } from "@mui/material";

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const res = await fetch("/api/students/applications");
    if (res.status === 401) { router.replace("/students/login"); return; }
    const data = await res.json();
    setItems(data.applications || []);
  };

  useEffect(()=>{ load(); }, []);

  const withdraw = async (jobId) => {
    const res = await fetch(`/api/jobs/${jobId}/withdraw`, { method: "POST" });
    const d = await res.json();
    if (res.ok) { setMsg({ t:"از درخواست انصراف داده شد.", s:"info" }); load(); }
    else { setMsg({ t: d.error || "خطا در انصراف", s:"error" }); }
  };

  return (
    <Container sx={{ py: 4 }}>
      {msg && <Alert severity={msg.s} sx={{ mb: 2 }}>{msg.t}</Alert>}
      <Typography variant="h5" sx={{ fontWeight:"bold", mb:2 }}>درخواست‌های من</Typography>
      {items.map(a=>(
        <Card key={a.id} variant="outlined" sx={{ mb:2, borderRadius:2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight:"bold" }}>{a.jobTitle}</Typography>
            <Typography sx={{ color:"text.secondary", mt:.5 }}>{a.companyName}</Typography>
            <Box sx={{ mt:1.5, display:"flex", gap:1, flexWrap:"wrap" }}>
              <Chip label={a.statusFa} />
              {a.withdrawn && <Chip color="default" label="انصراف داده‌اید" />}
            </Box>
            <Box sx={{ mt:2, display:"flex", gap:1 }}>
              <Button size="small" variant="outlined" href={`/jobs/${a.jobId}`}>مشاهده آگهی</Button>
              {!a.withdrawn && <Button size="small" color="error" variant="text" onClick={()=>withdraw(a.jobId)}>انصراف</Button>}
            </Box>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <Alert severity="info">هنوز درخواستی ثبت نکرده‌اید. از صفحه‌ی <b>فرصت‌ها</b> اقدام کنید.</Alert>
      )}
    </Container>
  );
}
