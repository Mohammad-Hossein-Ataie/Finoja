'use client';
import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UnitList from './UnitList';

export default function SectionList({ course, refreshCourses }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '' });
  const [editing, setEditing] = useState(null);

  const addOrEditSection = async () => {
    let newSections;
    if (editing !== null) {
      newSections = course.sections.map((s, i) => i === editing ? { ...s, title: form.title } : s);
    } else {
      newSections = [...(course.sections || []), { title: form.title, units: [] }];
    }
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    setShowForm(false); setForm({ title: '' }); setEditing(null); refreshCourses();
  };

  const handleDeleteSection = async (idx) => {
    const newSections = (course.sections || []).filter((_, i) => i !== idx);
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCourses();
  };

  return (
    <Box sx={{ mt: 2, pl: 3 }}>
      <Button variant="outlined" size="small" sx={{ mb: 1 }}
        onClick={() => { setShowForm(true); setEditing(null); }}>
        افزودن بخش
      </Button>
      {showForm &&
        <Box mb={2} mt={1} display="flex" alignItems="center" gap={1}>
          <TextField label="عنوان بخش" size="small"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Button size="small" onClick={addOrEditSection} variant="contained">ثبت</Button>
          <Button size="small" color="error" onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '' }); }}>انصراف</Button>
        </Box>
      }
      {(course.sections || []).map((section, i) => (
        <Card key={i} sx={{ mb: 1, pl: 2, background: "#fafbfc" }}>
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{section.title}</Typography>
              <IconButton size="small" onClick={() => { setShowForm(true); setEditing(i); setForm({ title: section.title }); }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteSection(i)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Stack>
            <UnitList
              course={course}
              section={section}
              sectionIndex={i}
              refreshCourses={refreshCourses}
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
