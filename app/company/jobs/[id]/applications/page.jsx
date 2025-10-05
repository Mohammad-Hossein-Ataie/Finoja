"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Card, CardContent, Box, Button, Chip, Alert } from "@mui/material";

export default function JobApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const res = await fetch(`/api/jobs/${id}/applications`);
    if (res.status === 401 || res.status === 403) { router.replace("/company/login"); return; }
    const data = await res.json();
    setItems(data.applications || []);
  };
  useEffect(()=>{ load(); }, [id]);

  const showContact = async (studentId, applicationId) => {
    const res = await fetch(`/api/employer/resumes/${studentId}/contact`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ applicationId })
    });
    const d = await res.json();
    if (!res.ok) { setMsg({ s:"error", t: d.error || "خطا در نمایش تماس" }); return; }
    setItems(prev => prev.map(x => x.student?._id===studentId ? { ...x, revealed: d.contact, credits: d.credits } : x));
    setMsg({ s:"success", t:`تماس نمایش داده شد. اعتبار باقی‌مانده: ${d.credits}` });
  };

  return (
    <Container sx={{ py: 4 }}>
      {msg && <Alert severity={msg.s} sx={{ mb:2 }}>{msg.t}</Alert>}
      <Typography variant="h5" sx={{ fontWeight:"bold", mb:2 }}>درخواست‌ها</Typography>
      {items.map(a=>(
        <Card key={a.applicationId} variant="outlined" sx={{ mb:1.5, borderRadius:2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight:"bold" }}>
              {a.student?.name} {a.student?.family}
            </Typography>
            <Box sx={{ display:"flex", gap:1, mt:1, flexWrap:"wrap" }}>
              {a.student?.city && <Chip label={a.student.city} />}
              {a.student?.gender && <Chip label={a.student.gender==="male"?"آقا":a.student.gender==="female"?"خانم":"سایر"} />}
              {!!a.student?.softwareSkills?.length && <Chip label={`مهارت‌ها: ${a.student.softwareSkills.slice(0,3).join("، ")}`} />}
            </Box>
            <Box sx={{ mt:1.5, display:"flex", gap:1, flexWrap:"wrap" }}>
              {!a.revealed ? (
                <>
                  <Chip label={`موبایل: ${a.student?.maskedPhone || "—"}`} />
                  <Chip label={`ایمیل: ${a.student?.maskedEmail || "—"}`} />
                  <Button size="small" variant="contained" onClick={()=>showContact(a.student?._id, a.applicationId)}>
                    نمایش تماس
                  </Button>
                </>
              ) : (
                <>
                  <Chip color="success" label={`موبایل: ${a.revealed.phone || "—"}`} />
                  <Chip color="success" label={`ایمیل: ${a.revealed.email || "—"}`} />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
      {items.length===0 && <Alert severity="info">هنوز درخواستی ثبت نشده است.</Alert>}
    </Container>
  );
}
