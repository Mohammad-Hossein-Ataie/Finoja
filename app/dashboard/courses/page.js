"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CourseCard from "@/components/CourseCard";
import RichTextEditor from "@/components/RichTextEditor";

function fetcher(url) { return fetch(url).then(res => res.json()); }

export default function CoursesPanel() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', teacher: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetcher("/api/courses").then(setCourses);
    fetcher("/api/teachers").then(setTeachers);
  }, []);

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
    setForm({ title: "", description: "", teacher: "" });
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    setCourses(courses.filter(c => c._id !== id));
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2} fontWeight={700}>دوره‌های من</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setEditing(null); }} sx={{ mb: 2 }}>افزودن دوره جدید</Button>
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
            <Select value={form.teacher} label="استاد" onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}>
              {teachers.map(teacher => <MenuItem value={teacher._id} key={teacher._id}>{teacher.name}</MenuItem>)}
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
