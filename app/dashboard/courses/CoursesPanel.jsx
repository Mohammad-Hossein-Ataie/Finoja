"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CourseCard from "../../../components/CourseCard";
import RichTextEditor from "../../../components/RichTextEditor";
import { useCurrentUser } from "../../../lib/useCurrentUser";

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
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2} fontWeight={700}>دوره‌های من</Typography>
      {user.role === "admin" && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setEditing(null); }} sx={{ mb: 2 }}>
          افزودن دوره جدید
        </Button>
      )}
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
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing ? "ویرایش دوره" : "افزودن دوره"}</DialogTitle>
        <DialogContent>
          <TextField label="عنوان دوره" value={form.title} fullWidth margin="dense" onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Box sx={{ my: 2 }}>
            <Typography sx={{ mb: 1 }} color="text.secondary" fontWeight={600}>توضیح دوره:</Typography>
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
              disabled={user.role === "teacher"} // استاد فقط خودش را دارد
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
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} variant="contained">ثبت</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
