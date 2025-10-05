"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Card, CardContent, Box, Button, Chip, Alert, TextField, MenuItem } from "@mui/material";

export default function JobApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "", withdrawn: "all", q: "" });

  const load = async () => {
    const sp = new URLSearchParams();
    if (filters.status) sp.set("status", filters.status);
    if (filters.withdrawn === "true" || filters.withdrawn === "false") sp.set("withdrawn", filters.withdrawn);
    if (filters.q) sp.set("q", filters.q);
    const res = await fetch(`/api/jobs/${id}/applications?${sp.toString()}`);
    if (res.status === 401 || res.status === 403) { router.replace("/company/login"); return; }
    const data = await res.json();
    setItems(data.applications || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [JSON.stringify(filters)]);

  const reveal = async (studentId, applicationId) => {
    await fetch(`/api/employer/resumes/${studentId}/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId }) });
    load();
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>درخواست‌های این آگهی</Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
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
        <TextField size="small" label="جستجو" value={filters.q} onChange={e=>setFilters({...filters, q:e.target.value})} />
      </Box>

      {items.length===0 && <Alert severity="info">هیچ درخواستی مطابق فیلترها پیدا نشد.</Alert>}

      {items.map(a => (
        <Card key={a.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{a.student?.name || ""} {a.student?.family || ""}</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                  <Chip size="small" label={`وضعیت: ${a.status}`} />
                  {a.withdrawn && <Chip size="small" color="warning" label={`انصراف در ${a.withdrawnAt ? new Date(a.withdrawnAt).toLocaleString("fa-IR") : "—"}`} />}
                  <Chip size="small" label={`شهر: ${a.student?.city || "—"}`} />
                </Box>
              </Box>
              <Button size="small" variant="outlined" onClick={()=>reveal(a.studentId, a.id)}>نمایش تماس</Button>
            </Box>
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip label={`تاریخ ثبت: ${new Date(a.createdAt).toLocaleString("fa-IR")}`} />
              <Chip label={`آخرین بروزرسانی: ${new Date(a.updatedAt).toLocaleString("fa-IR")}`} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
