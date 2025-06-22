"use client";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Card, CardContent, Divider, Chip, Alert
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

  // state برای نمایش یوزرنیم و پسورد تولید شده
  const [newUser, setNewUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetcher('/api/teachers').then(setTeachers);
    fetcher('/api/courses').then(setCourses);
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!form.name) return;
    let res, data;
    if (editing) {
      res = await fetch(`/api/teachers/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      data = await res.json();
      setNewUser(null); // چون رمز جدید ساخته نمی‌شود
    } else {
      res = await fetch("/api/teachers", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      data = await res.json();

      if (res.ok && data.user) {
        setNewUser(data.user); // نمایش یوزرنیم و رمز عبور
      } else {
        setNewUser(null);
      }
    }
    if (!res.ok) {
      setError(data?.error || "خطا در ثبت استاد");
      return;
    }
    fetcher("/api/teachers").then(setTeachers);
    setForm({ name: "", nationalCode: "", email: "", phone: "", expertise: "" });
    setEditing(null);
    if (editing) setOpen(false);
    // اگر اضافه شده، دیالوگ نبند (تا یوزرنیم و رمز دیده شود)
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    setTeachers(teachers.filter(t => t._id !== id));
  };

  const getCoursesOfTeacher = (teacherId) => {
    return courses.filter(c => c.teacher?._id === teacherId);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewUser(null);
    setError("");
    setForm({ name: "", nationalCode: "", email: "", phone: "", expertise: "" });
    setEditing(null);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2} fontWeight={700}>لیست اساتید</Typography>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        startIcon={<AddIcon />}
        onClick={() => { setOpen(true); setEditing(null); setNewUser(null); setForm({ name: "", nationalCode: "", email: "", phone: "", expertise: "" }); }}
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
                  <IconButton onClick={() => { setOpen(true); setEditing(teacher); setForm(teacher); setNewUser(null); }}>
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
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>{editing ? "ویرایش استاد" : "افزودن استاد"}</DialogTitle>
        <DialogContent>
          <TextField label="نام" fullWidth margin="dense" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="کد ملی" fullWidth margin="dense" value={form.nationalCode || ""} onChange={e => setForm(f => ({ ...f, nationalCode: e.target.value }))} />
          <TextField label="ایمیل" fullWidth margin="dense" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <TextField label="موبایل" fullWidth margin="dense" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <TextField label="تخصص" fullWidth margin="dense" value={form.expertise || ""} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          {/* نمایش یوزرنیم و رمز عبور استاد جدید فقط بعد از ثبت موفق */}
          {newUser && !editing && (
            <Alert severity="success" sx={{ mt: 3, direction: "ltr", textAlign: "left", fontSize: 16 }}>
              <b>اطلاعات ورود استاد:</b><br />
              Username: <b>{newUser.username}</b><br />
              Password: <b>{newUser.password}</b><br />
              <span style={{ color: "#0a0", fontWeight: 600 }}>این اطلاعات را برای استاد ارسال کنید.</span>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>انصراف</Button>
          <Button onClick={handleSubmit} variant="contained">{editing ? "ذخیره" : "ثبت"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
