'use client';
import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, TextField, IconButton, Typography,
  Collapse, Alert, FormControl, InputLabel, MenuItem, Select, Checkbox, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RichTextEditor from './RichTextEditor';

const DEFAULT_STEP = {
  type: 'explanation',
  content: '',
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  correctIndexes: [],
  answer: '',
  explanation: '',
  feedbackCorrect: '',
  feedbackWrong: ''
};

export default function StepList({
  course, topic, topicIndex, unit, unitIndex, section, sectionIndex, refreshCourses
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_STEP);
  const [openIndex, setOpenIndex] = useState(null);

  // جابه‌جایی ترتیب گام‌ها
  const moveStep = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= (topic.steps?.length || 0)) return;
    const newSteps = [...(topic.steps || [])];
    const [removed] = newSteps.splice(fromIdx, 1);
    newSteps.splice(toIdx, 0, removed);

    const newTopics = [...unit.topics];
    newTopics[topicIndex] = { ...topic, steps: newSteps };
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCourses();
  };

  // افزودن یا ویرایش گام
  const addOrEditStep = async () => {
    let newSteps;
    if (editing !== null) {
      newSteps = topic.steps.map((s, i) => i === editing ? form : s);
    } else {
      newSteps = [...(topic.steps || []), form];
    }
    const newTopics = [...unit.topics];
    newTopics[topicIndex] = { ...topic, steps: newSteps };
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    setShowForm(false); setEditing(null); setForm(DEFAULT_STEP);
    refreshCourses();
  };

  // حذف گام
  const handleDeleteStep = async (idx) => {
    const newSteps = (topic.steps || []).filter((_, i) => i !== idx);
    const newTopics = [...unit.topics];
    newTopics[topicIndex] = { ...topic, steps: newSteps };
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCourses();
  };

  const handleOptionChange = (idx, value) => {
    setForm(f => {
      const options = [...f.options];
      options[idx] = value;
      return { ...f, options };
    });
  };

  const handleTypeChange = (value) => {
    setForm({ ...DEFAULT_STEP, type: value });
  };

  // راهنمای گام‌ها
  const StepGuide = (
    <Alert severity="info" sx={{ mb: 1 }}>
      <b>راهنما:</b>
      <ul style={{ margin: 0, padding: 0, paddingRight: 16 }}>
        <li>برای گام «توضیح»، فقط متن را بنویسید.</li>
        <li>در گام «جای‌خالی»، برای محل جای خالی از <b>-</b> استفاده کنید.</li>
        <li>برای گام «چندگزینه‌ای»، گزینه صحیح یا گزینه‌های صحیح را مشخص و فیدبک صحیح/غلط را بنویسید.</li>
      </ul>
    </Alert>
  );

  return (
    <Box sx={{ mt: 1, pl: 3 }}>
      <Button variant="outlined" size="small" sx={{ mb: 1 }} onClick={() => { setShowForm(true); setEditing(null); }}>
        افزودن گام جدید
      </Button>
      {showForm &&
        <Box mb={2} mt={1} display="flex" flexDirection="column" gap={1}>
          {StepGuide}
          <FormControl size="small">
            <InputLabel>نوع گام</InputLabel>
            <Select value={form.type} label="نوع گام" onChange={e => handleTypeChange(e.target.value)}>
              <MenuItem value="explanation">توضیح</MenuItem>
              <MenuItem value="multiple-choice">سوال چندگزینه‌ای</MenuItem>
              <MenuItem value="multi-answer">سوال چندگزینه‌ای چندجوابی</MenuItem>
              <MenuItem value="fill-in-the-blank">جای‌خالی</MenuItem>
            </Select>
          </FormControl>
          {form.type === 'explanation' && (
            <RichTextEditor
              value={form.content}
              onChange={val => setForm(f => ({ ...f, content: val }))}
            />
          )}

          {/* باقی فرم سوالات (بدون تغییر) ... */}
          {form.type === 'multiple-choice' && (
            <>
              <TextField label="متن سوال" size="small" value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
              {form.options.map((option, idx) => (
                <TextField key={idx} label={`گزینه ${idx + 1}`} size="small"
                  value={option} onChange={e => handleOptionChange(idx, e.target.value)} />
              ))}
              <FormControl size="small">
                <InputLabel>گزینه صحیح</InputLabel>
                <Select
                  value={form.correctIndex}
                  label="گزینه صحیح"
                  onChange={e => setForm(f => ({ ...f, correctIndex: e.target.value }))}
                >
                  {[0, 1, 2, 3].map(idx => <MenuItem key={idx} value={idx}>{`گزینه ${idx + 1}`}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="توضیح پس از جواب" size="small"
                value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
              <TextField label="فیدبک صحیح" size="small"
                value={form.feedbackCorrect} onChange={e => setForm(f => ({ ...f, feedbackCorrect: e.target.value }))} />
              <TextField label="فیدبک غلط" size="small"
                value={form.feedbackWrong} onChange={e => setForm(f => ({ ...f, feedbackWrong: e.target.value }))} />
            </>
          )}

          {form.type === 'multi-answer' && (
            <>
              <TextField label="متن سوال" size="small" value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
              {form.options.map((option, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <TextField
                    label={`گزینه ${idx + 1}`}
                    size="small"
                    value={option}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Array.isArray(form.correctIndexes) && form.correctIndexes.includes(idx)}
                        onChange={e => {
                          let arr = Array.isArray(form.correctIndexes) ? [...form.correctIndexes] : [];
                          if (e.target.checked) arr.push(idx);
                          else arr = arr.filter(i => i !== idx);
                          setForm(f => ({ ...f, correctIndexes: arr }));
                        }}
                      />
                    }
                    label="صحیح"
                  />
                </Box>
              ))}
              <TextField label="توضیح پس از جواب" size="small"
                value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
              <TextField label="فیدبک صحیح" size="small"
                value={form.feedbackCorrect} onChange={e => setForm(f => ({ ...f, feedbackCorrect: e.target.value }))} />
              <TextField label="فیدبک غلط" size="small"
                value={form.feedbackWrong} onChange={e => setForm(f => ({ ...f, feedbackWrong: e.target.value }))} />
            </>
          )}

          {form.type === 'fill-in-the-blank' && (
            <>
              <Typography variant="caption" color="info.main">
                توجه: برای مشخص کردن جای خالی در متن جمله، از کاراکتر <b>-</b> استفاده کنید.<br />
                مثال: <b>من بهترین حالت را - دارم</b> (در این صورت جای خالی «-» است)
              </Typography>
              <TextField label="جمله دارای جای خالی" size="small" value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
              <TextField label="پاسخ صحیح" size="small" value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} />
              <TextField label="توضیح پس از جواب" size="small"
                value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
              <TextField label="فیدبک صحیح" size="small"
                value={form.feedbackCorrect} onChange={e => setForm(f => ({ ...f, feedbackCorrect: e.target.value }))} />
              <TextField label="فیدبک غلط" size="small"
                value={form.feedbackWrong} onChange={e => setForm(f => ({ ...f, feedbackWrong: e.target.value }))} />
            </>
          )}

          <Stack direction="row" gap={1}>
            <Button size="small" variant="contained" onClick={addOrEditStep}>ثبت</Button>
            <Button size="small" color="error" onClick={() => { setShowForm(false); setEditing(null); setForm(DEFAULT_STEP); }}>انصراف</Button>
          </Stack>
        </Box>
      }

      {/* نمایش لیست گام‌ها */}
      {(topic.steps || []).map((s, i) => (
        <Card key={i} sx={{ mb: 1, pl: 2, background: "#e5ffe5" }}>
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton size="small" onClick={() => handleDeleteStep(i)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
              <IconButton size="small" onClick={() => { setShowForm(true); setEditing(i); setForm(s); }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <ExpandMoreIcon
                  fontSize="small"
                  sx={{
                    transform: openIndex === i ? "rotate(180deg)" : "none",
                    transition: "0.2s"
                  }}
                />
              </IconButton>
              <IconButton size="small" onClick={() => moveStep(i, i - 1)} disabled={i === 0}>
                <ArrowUpward fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => moveStep(i, i + 1)} disabled={i === (topic.steps.length - 1)}>
                <ArrowDownward fontSize="small" />
              </IconButton>
              <Typography fontWeight="bold">
                {i + 1}. {
                  s.type === 'explanation' ? 'توضیح'
                  : s.type === 'multiple-choice' ? 'سوال چندگزینه‌ای'
                  : s.type === 'multi-answer' ? 'سوال چندگزینه‌ای چندجوابی'
                  : 'جای‌خالی'
                }
              </Typography>
            </Stack>
            <Collapse in={openIndex === i}>
              {/* نمایش محتوا بر اساس نوع گام */}
              {s.type === 'explanation' &&
                <Box sx={{ mt: 1 }} dangerouslySetInnerHTML={{ __html: s.content }} />
              }

              {s.type === 'multiple-choice' && (
                <>
                  <Typography sx={{ mt: 1 }}>سوال: {s.text}</Typography>
                  <ol>
                    {(s.options || []).map((op, idx) =>
                      <li key={idx} style={{ fontWeight: s.correctIndex === idx ? "bold" : "normal" }}>{op}</li>
                    )}
                  </ol>
                  {s.explanation && <Typography variant="caption" color="primary">{s.explanation}</Typography>}
                  <Typography variant="caption" color="success.main">فیدبک صحیح: {s.feedbackCorrect}</Typography>
                  <br />
                  <Typography variant="caption" color="error.main">فیدبک غلط: {s.feedbackWrong}</Typography>
                </>
              )}

              {s.type === 'multi-answer' && (
                <>
                  <Typography sx={{ mt: 1 }}>سوال: {s.text}</Typography>
                  <ol>
                    {(s.options || []).map((op, idx) =>
                      <li
                        key={idx}
                        style={{
                          fontWeight: Array.isArray(s.correctIndexes) && s.correctIndexes.includes(idx) ? "bold" : "normal",
                          color: Array.isArray(s.correctIndexes) && s.correctIndexes.includes(idx) ? "#388e3c" : "inherit"
                        }}
                      >
                        {op}
                      </li>
                    )}
                  </ol>
                  {s.explanation && <Typography variant="caption" color="primary">{s.explanation}</Typography>}
                  <Typography variant="caption" color="success.main">فیدبک صحیح: {s.feedbackCorrect}</Typography>
                  <br />
                  <Typography variant="caption" color="error.main">فیدبک غلط: {s.feedbackWrong}</Typography>
                </>
              )}

              {s.type === 'fill-in-the-blank' && (
                <>
                  <Typography sx={{ mt: 1 }}>جمله: {s.text.replace("-", "____")}</Typography>
                  <Typography color="info.main">پاسخ صحیح: {s.answer}</Typography>
                  {s.explanation && <Typography variant="caption" color="primary">{s.explanation}</Typography>}
                  <Typography variant="caption" color="success.main">فیدبک صحیح: {s.feedbackCorrect}</Typography>
                  <br />
                  <Typography variant="caption" color="error.main">فیدبک غلط: {s.feedbackWrong}</Typography>
                </>
              )}
            </Collapse>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
