"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function QuestionList({
  course,
  topic,
  topicIndex,
  unit,
  unitIndex,
  section,
  sectionIndex,
  refreshCourses,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    type: "multiple-choice",
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  });

  const handleOptionChange = (idx, value) => {
    setForm((f) => {
      const options = [...f.options];
      options[idx] = value;
      return { ...f, options };
    });
  };

  const addOrEditQuestion = async () => {
    let newQuestions;
    if (editing !== null) {
      newQuestions = topic.questions.map((q, i) => (i === editing ? form : q));
    } else {
      newQuestions = [...(topic.questions || []), form];
    }
    const newTopics = [...unit.topics];
    newTopics[topicIndex] = { ...topic, questions: newQuestions };
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
    setEditing(null);
    setForm({
      type: "multiple-choice",
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    });
    refreshCourses();
  };

  const handleDeleteQuestion = async (idx) => {
    const newQuestions = (topic.questions || []).filter((_, i) => i !== idx);
    const newTopics = [...unit.topics];
    newTopics[topicIndex] = { ...topic, questions: newQuestions };
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
        افزودن سوال چندگزینه‌ای
      </Button>

      {showForm && (
        <Box mb={2} mt={1} display="flex" flexDirection="column" gap={1}>
          {/* کادر بزرگ‌تر برای متن سؤال */}
          <TextField
            label="متن سوال"
            size="small"
            multiline
            minRows={3}
            fullWidth
            value={form.text}
            onChange={(e) =>
              setForm((f) => ({ ...f, text: e.target.value }))
            }
          />

          {form.options.map((option, idx) => (
            <TextField
              key={idx}
              label={`گزینه ${idx + 1}`}
              size="small"
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
            />
          ))}

          <FormControl size="small">
            <InputLabel>گزینه صحیح</InputLabel>
            <Select
              value={form.correctIndex}
              label="گزینه صحیح"
              onChange={(e) =>
                setForm((f) => ({ ...f, correctIndex: e.target.value }))
              }
            >
              {[0, 1, 2, 3].map((idx) => (
                <MenuItem key={idx} value={idx}>{`گزینه ${idx + 1}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="توضیح پس از پاسخ"
            size="small"
            multiline
            minRows={2}
            value={form.explanation}
            onChange={(e) =>
              setForm((f) => ({ ...f, explanation: e.target.value }))
            }
          />

          <Stack direction="row" gap={1}>
            <Button size="small" variant="contained" onClick={addOrEditQuestion}>
              ثبت
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              انصراف
            </Button>
          </Stack>
        </Box>
      )}

      {/* لیست نمایش سؤال‌ها */}
      {(topic.questions || []).map((q, i) => (
        <Card key={i} sx={{ mb: 1, pl: 2, background: "#e5ffe5" }}>
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ whiteSpace: "pre-line" /* نمایش \n */ }}>
                {q.text}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setShowForm(true);
                  setEditing(i);
                  setForm(q);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteQuestion(i)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Stack>
            <ol>
              {(q.options || []).map((op, idx) => (
                <li
                  key={idx}
                  style={{
                    fontWeight: q.correctIndex === idx ? "bold" : "normal",
                  }}
                >
                  {op}
                </li>
              ))}
            </ol>
            {q.explanation && (
              <Typography variant="caption" color="primary">
                {q.explanation}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
