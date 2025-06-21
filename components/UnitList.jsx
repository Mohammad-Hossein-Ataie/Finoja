'use client';
import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TopicList from './TopicList';

export default function UnitList({ course, section, sectionIndex, refreshCourses }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '' });
  const [editing, setEditing] = useState(null);

  const addOrEditUnit = async () => {
    let newUnits;
    if (editing !== null) {
      newUnits = section.units.map((u, i) => i === editing ? { ...u, title: form.title } : u);
    } else {
      newUnits = [...(section.units || []), { title: form.title, topics: [] }];
    }
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    setShowForm(false); setForm({ title: '' }); setEditing(null); refreshCourses();
  };

  const handleDeleteUnit = async (idx) => {
    const newUnits = (section.units || []).filter((_, i) => i !== idx);
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCourses();
  };

  return (
    <Box sx={{ mt: 1, pl: 3 }}>
      <Button variant="outlined" size="small" sx={{ mb: 1 }}
        onClick={() => { setShowForm(true); setEditing(null); }}>
        افزودن یونیت
      </Button>
      {showForm &&
        <Box mb={2} mt={1} display="flex" alignItems="center" gap={1}>
          <TextField label="عنوان یونیت" size="small"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Button size="small" onClick={addOrEditUnit} variant="contained">ثبت</Button>
          <Button size="small" color="error" onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '' }); }}>انصراف</Button>
        </Box>
      }
      {(section.units || []).map((unit, i) => (
        <Card key={i} sx={{ mb: 1, pl: 2, background: "#f9f6ff" }}>
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{unit.title}</Typography>
              <IconButton size="small" onClick={() => { setShowForm(true); setEditing(i); setForm({ title: unit.title }); }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteUnit(i)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Stack>
            <TopicList
              course={course}
              unit={unit}
              unitIndex={i}
              section={section}
              sectionIndex={sectionIndex}
              refreshCourses={refreshCourses}
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
