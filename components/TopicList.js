"use client";
import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StepList from './StepList';

export default function TopicList({
  course,
  unit,
  unitIndex,
  section,
  sectionIndex,
  refreshCourses,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "" });
  const [editing, setEditing] = useState(null);

  const addOrEditTopic = async () => {
    let newTopics;
    if (editing !== null) {
      newTopics = unit.topics.map((t, i) =>
        i === editing ? { ...t, title: form.title } : t
      );
    } else {
      newTopics = [
        ...(unit.topics || []),
        { title: form.title, steps: [] },
      ];
    }
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    setShowForm(false);
    setForm({ title: "" });
    setEditing(null);
    refreshCourses();
  };

  const handleDeleteTopic = async (idx) => {
    const newTopics = (unit.topics || []).filter((_, i) => i !== idx);
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    refreshCourses();
  };

  return (
    <Box sx={{ mt: 1, pl: 3 }}>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
        onClick={() => {
          setShowForm(true);
          setEditing(null);
        }}
      >
        افزودن موضوع
      </Button>
      {showForm && (
        <Box mb={2} mt={1} display="flex" alignItems="center" gap={1}>
          <TextField
            label="عنوان موضوع"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Button size="small" onClick={addOrEditTopic} variant="contained">
            ثبت
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => {
              setShowForm(false);
              setEditing(null);
              setForm({ title: "" });
            }}
          >
            انصراف
          </Button>
        </Box>
      )}
      {(unit.topics || []).map((topic, i) => (
        <Card key={i} sx={{ mb: 1, pl: 2, background: "#fef9f2" }}>
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{topic.title}</Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setShowForm(true);
                  setEditing(i);
                  setForm({ title: topic.title });
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteTopic(i)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Stack>
            <StepList
              course={course}
              topic={topic}
              topicIndex={i}
              unit={unit}
              unitIndex={unitIndex}
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
