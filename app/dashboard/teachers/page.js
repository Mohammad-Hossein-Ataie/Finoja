"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

function fetcher(url) { return fetch(url).then(res => res.json()); }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", nationalCode: "", email: "", phone: "", expertise: "" });

  useEffect(() => { fetcher('/api/teachers').then(setTeachers); }, []);

  const handleSubmit = async () => {
    if (!form.name) return;
    await fetch("/api/teachers", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    fetcher("/api/teachers").then(setTeachers);
    setOpen(false);
    setForm({ name: "", nationalCode: "", email: "", phone: "", expertise: "" });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2} fontWeight={700}>لیست اساتید</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        افزودن استاد جدید
      </Button>
      <Stack spacing={1}>
        {teachers.map(teacher => (
          <Box key={teacher._id} sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
            <Typography fontWeight={600}>{teacher.name}</Typography>
            <Typography variant="body2">{teacher.expertise} | {teacher.email} | {teacher.phone}</Typography>
          </Box>
        ))}
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>افزودن استاد</DialogTitle>
        <DialogContent>
          <TextField label="نام" fullWidth margin="dense" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="کد ملی" fullWidth margin="dense" value={form.nationalCode} onChange={e => setForm(f => ({ ...f, nationalCode: e.target.value }))} />
          <TextField label="ایمیل" fullWidth margin="dense" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <TextField label="موبایل" fullWidth margin="dense" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <TextField label="تخصص" fullWidth margin="dense" value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} variant="contained">ثبت</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
