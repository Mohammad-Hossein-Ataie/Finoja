"use client";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Card, CardContent, Divider, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/School";

function fetcher(url) { return fetch(url).then(res => res.json()); }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", nationalCode: "", email: "", phone: "", expertise: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetcher('/api/teachers').then(setTeachers);
    fetcher('/api/courses').then(setCourses);
  }, []);

  const handleSubmit = async () => {
    if (!form.name) return;
    if (editing) {
      await fetch(`/api/teachers/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
    } else {
      await fetch("/api/teachers", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
    }
    fetcher("/api/teachers").then(setTeachers);
    setOpen(false);
    setForm({ name: "", nationalCode: "", email: "", phone: "", expertise: "" });
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    setTeachers(teachers.filter(t => t._id !== id));
  };

  const getCoursesOfTeacher = (teacherId) => {
    return courses.filter(c => c.teacher?._id === teacherId);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2} fontWeight={700}>لیست اساتید</Typography>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        startIcon={<AddIcon />}
        onClick={() => { setOpen(true); setEditing(null); }}
      >افزودن استاد جدید</Button>
      <Stack spacing={2}>
        {teachers.map(teacher => (
          <Card key={teacher._id} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography fontWeight={700} fontSize={20} color="primary">
                    <SchoolIcon sx={{ verticalAlign: "middle" }} /> {teacher.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {teacher.expertise} | {teacher.email} | {teacher.phone}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => { setOpen(true); setEditing(teacher); setForm(teacher); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(teacher._id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Box>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600} mb={1} color="info.main">دوره‌ها:</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {getCoursesOfTeacher(teacher._id).length === 0 && <Chip label="هیچ دوره‌ای ندارد" color="warning" />}
                {getCoursesOfTeacher(teacher._id).map(course =>
                  <Chip key={course._id} label={course.title} color="success" />
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "ویرایش استاد" : "افزودن استاد"}</DialogTitle>
        <DialogContent>
          <TextField label="نام" fullWidth margin="dense" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="کد ملی" fullWidth margin="dense" value={form.nationalCode || ""} onChange={e => setForm(f => ({ ...f, nationalCode: e.target.value }))} />
          <TextField label="ایمیل" fullWidth margin="dense" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <TextField label="موبایل" fullWidth margin="dense" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <TextField label="تخصص" fullWidth margin="dense" value={form.expertise || ""} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} variant="contained">ثبت</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
