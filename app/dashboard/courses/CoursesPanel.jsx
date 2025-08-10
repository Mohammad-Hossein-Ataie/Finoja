"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CourseCard from "../../../components/CourseCard";
import RichTextEditor from "../../../components/RichTextEditor";
import { useCurrentUser } from "../../../lib/useCurrentUser";
import SchoolIcon from "@mui/icons-material/School";

function fetcher(url) {
  return fetch(url, { credentials: "include" })
    .then(res => res.ok ? res.json() : Promise.resolve([]))
    .catch(() => []);
}

export default function CoursesPanel() {
  const { user, loading } = useCurrentUser();

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', teacher: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetcher("/api/courses").then(setCourses);

    if (user.role === "admin") {
      fetcher("/api/teachers").then(data => {
        setTeachers(Array.isArray(data) ? data : []);
      });
    } else if (user.role === "teacher") {
      setTeachers(user.teacher ? [user.teacher] : []);
      setForm(f => ({ ...f, teacher: user.teacher?._id || "" }));
    } else {
      setTeachers([]);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.title || !form.teacher) return;
    if (editing) {
      await fetch(`/api/courses/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
    } else {
      await fetch("/api/courses", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
    }
    fetcher("/api/courses").then(setCourses);
    setOpen(false);
    setForm({ title: "", description: "", teacher: user.role === "teacher" ? (user.teacher?._id || "") : "" });
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    setCourses(courses.filter(c => c._id !== id));
  };

  if (loading || !user) return null;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: { xs: 2, md: 4 }, px: 1 }}>
      <Typography variant="h4" mb={3} fontWeight={900} sx={{ textAlign: "center", letterSpacing: 2 }}>
        دوره‌های من
      </Typography>
      {user.role === "admin" && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setOpen(true); setEditing(null); }}
          sx={{
            mb: 3,
            fontWeight: 700,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: 18,
            boxShadow: 2,
            background: "linear-gradient(90deg, #223354 10%, #121B25 90%)",
          }}
        >
          افزودن دوره جدید
        </Button>
      )}

      {/* پیام اگر هیچ دوره‌ای وجود نداشت */}
      {courses.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            mt: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "#f8fafc",
            boxShadow: 1,
            borderRadius: 4,
            minHeight: 240,
            width:"100%"
          }}
        >
          <SchoolIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography fontWeight={700} color="text.secondary" fontSize={20}>
            در حال حاضر هیچ دوره‌ای ندارید.
          </Typography>
          {user.role === "admin" && (
            <Typography color="text.secondary" mt={2}>
              برای ایجاد اولین دوره، روی "افزودن دوره جدید" کلیک کنید.
            </Typography>
          )}
        </Paper>
      ) : (
        <Stack spacing={2}>
          {courses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={() => {
                setForm({
                  title: course.title,
                  description: course.description,
                  teacher: course.teacher?._id || ""
                });
                setEditing(course);
                setOpen(true);
              }}
              onDelete={() => handleDelete(course._id)}
              refreshCourses={() => fetcher("/api/courses").then(setCourses)}
              teacherName={course.teacher?.name || "بدون استاد"}
            />
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900, fontSize: 22 }}>
          {editing ? "ویرایش دوره" : "افزودن دوره"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="عنوان دوره"
            value={form.title}
            fullWidth
            margin="dense"
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            InputProps={{ sx: { borderRadius: 2, fontWeight: 700 } }}
          />
          <Box sx={{ my: 2 }}>
            <Typography sx={{ mb: 1 }} color="text.secondary" fontWeight={600}>
              توضیح دوره:
            </Typography>
            <RichTextEditor
              value={form.description}
              onChange={val => setForm(f => ({ ...f, description: val }))}
            />
          </Box>
          <FormControl fullWidth margin="dense">
            <InputLabel>استاد</InputLabel>
            <Select
              value={form.teacher}
              label="استاد"
              onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}
              disabled={user.role === "teacher"}
              sx={{ borderRadius: 2 }}
            >
              {Array.isArray(teachers) && teachers.length > 0 ? (
                teachers.map(teacher => (
                  <MenuItem value={teacher._id} key={teacher._id}>
                    {teacher.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">بدون استاد</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2, fontWeight: 700 }}>
            انصراف
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
            ثبت
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
