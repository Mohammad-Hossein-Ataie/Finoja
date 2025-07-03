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
  Collapse,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import RichTextEditor from "./RichTextEditor";

const DEFAULT_STEP = {
  type: "explanation",
  content: "",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  correctIndexes: [],
  answer: "",
  explanation: "",
  feedbackCorrect: "",
  feedbackWrong: "",
  pairs: [], // برای matching
};

export default function StepList({
  course,
  unit,
  unitIndex,
  section,
  sectionIndex,
  refreshCourses,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_STEP);
  const [openIndex, setOpenIndex] = useState(null);

  // بخش اضافه: مدیریت آیتم‌های matching
  const addMatchingPair = () => {
    setForm((f) => ({
      ...f,
      pairs: [...(f.pairs || []), { left: "", right: "" }],
    }));
  };
  const updateMatchingPair = (idx, side, value) => {
    setForm((f) => {
      const pairs = [...(f.pairs || [])];
      pairs[idx][side] = value;
      return { ...f, pairs };
    });
  };
  const deleteMatchingPair = (idx) => {
    setForm((f) => {
      const pairs = [...(f.pairs || [])];
      pairs.splice(idx, 1);
      return { ...f, pairs };
    });
  };

  // Drag & drop for steps
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    const steps = Array.from(unit.steps || []);
    const [removed] = steps.splice(source.index, 1);
    steps.splice(destination.index, 0, removed);

    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, steps };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    refreshCourses();
  };

  const addOrEditStep = async () => {
    let newSteps;
    if (editing !== null) {
      newSteps = unit.steps.map((s, i) => (i === editing ? form : s));
    } else {
      newSteps = [...(unit.steps || []), form];
    }
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, steps: newSteps };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    setShowForm(false);
    setEditing(null);
    setForm(DEFAULT_STEP);
    refreshCourses();
  };

  const handleDeleteStep = async (idx) => {
    const newSteps = (unit.steps || []).filter((_, i) => i !== idx);
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, steps: newSteps };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    refreshCourses();
  };

  const handleOptionChange = (idx, value) => {
    setForm((f) => {
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
        <li>
          در گام «جای‌خالی»، برای محل جای خالی از <b>-</b> استفاده کنید.
        </li>
        <li>
          برای گام «چندگزینه‌ای»، گزینه صحیح یا گزینه‌های صحیح را مشخص و فیدبک
          صحیح/غلط را بنویسید.
        </li>
        <li>
          در گام «وصل‌کردنی»، جفت‌های مرتبط را بنویسید. مثلاً "کفش" و "پا"
        </li>
      </ul>
    </Alert>
  );

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
        افزودن گام جدید
      </Button>
      {showForm && (
        <Box mb={2} mt={1} display="flex" flexDirection="column" gap={1}>
          {StepGuide}
          <FormControl size="small">
            <InputLabel>نوع گام</InputLabel>
            <Select
              value={form.type}
              label="نوع گام"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <MenuItem value="explanation">توضیح</MenuItem>
              <MenuItem value="multiple-choice">سوال چندگزینه‌ای</MenuItem>
              <MenuItem value="multi-answer">
                سوال چندگزینه‌ای چندجوابی
              </MenuItem>
              <MenuItem value="fill-in-the-blank">جای‌خالی</MenuItem>
              <MenuItem value="matching">وصل‌کردنی</MenuItem>
            </Select>
          </FormControl>
          {form.type === "explanation" && (
            <RichTextEditor
              value={form.content}
              onChange={(val) => setForm((f) => ({ ...f, content: val }))}
            />
          )}
          {form.type === "multiple-choice" && (
            <>
              <TextField
                label="متن سوال"
                size="small"
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
                    <MenuItem key={idx} value={idx}>{`گزینه ${
                      idx + 1
                    }`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="توضیح پس از جواب"
                size="small"
                value={form.explanation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, explanation: e.target.value }))
                }
              />
              <TextField
                label="فیدبک صحیح"
                size="small"
                value={form.feedbackCorrect}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackCorrect: e.target.value }))
                }
              />
              <TextField
                label="فیدبک غلط"
                size="small"
                value={form.feedbackWrong}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackWrong: e.target.value }))
                }
              />
            </>
          )}
          {form.type === "multi-answer" && (
            <>
              <TextField
                label="متن سوال"
                size="small"
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
              />
              {form.options.map((option, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <TextField
                    label={`گزینه ${idx + 1}`}
                    size="small"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          Array.isArray(form.correctIndexes) &&
                          form.correctIndexes.includes(idx)
                        }
                        onChange={(e) => {
                          let arr = Array.isArray(form.correctIndexes)
                            ? [...form.correctIndexes]
                            : [];
                          if (e.target.checked) arr.push(idx);
                          else arr = arr.filter((i) => i !== idx);
                          setForm((f) => ({ ...f, correctIndexes: arr }));
                        }}
                      />
                    }
                    label="صحیح"
                  />
                </Box>
              ))}
              <TextField
                label="توضیح پس از جواب"
                size="small"
                value={form.explanation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, explanation: e.target.value }))
                }
              />
              <TextField
                label="فیدبک صحیح"
                size="small"
                value={form.feedbackCorrect}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackCorrect: e.target.value }))
                }
              />
              <TextField
                label="فیدبک غلط"
                size="small"
                value={form.feedbackWrong}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackWrong: e.target.value }))
                }
              />
            </>
          )}
          {form.type === "fill-in-the-blank" && (
            <>
              <Typography variant="caption" color="info.main">
                توجه: برای مشخص کردن جای خالی در متن جمله، از کاراکتر <b>-</b>{" "}
                استفاده کنید.
                <br />
                مثال: <b>من بهترین حالت را - دارم</b> (در این صورت جای خالی «-»
                است)
              </Typography>
              <TextField
                label="جمله دارای جای خالی"
                size="small"
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
              />
              <TextField
                label="پاسخ صحیح"
                size="small"
                value={form.answer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, answer: e.target.value }))
                }
              />
              <TextField
                label="توضیح پس از جواب"
                size="small"
                value={form.explanation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, explanation: e.target.value }))
                }
              />
              <TextField
                label="فیدبک صحیح"
                size="small"
                value={form.feedbackCorrect}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackCorrect: e.target.value }))
                }
              />
              <TextField
                label="فیدبک غلط"
                size="small"
                value={form.feedbackWrong}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackWrong: e.target.value }))
                }
              />
            </>
          )}
          {form.type === "matching" && (
            <Box>
              <Typography fontWeight={700} mb={1} color="primary">
                سوال وصل‌کردنی
              </Typography>
              {(form.pairs || []).map((pair, idx) => (
                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  key={idx}
                  mb={1}
                >
                  <TextField
                    label="ستون راست"
                    size="small"
                    value={pair.left}
                    onChange={(e) =>
                      updateMatchingPair(idx, "left", e.target.value)
                    }
                  />
                  <TextField
                    label="ستون چپ"
                    size="small"
                    value={pair.right}
                    onChange={(e) =>
                      updateMatchingPair(idx, "right", e.target.value)
                    }
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteMatchingPair(idx)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button size="small" variant="outlined" onClick={addMatchingPair}>
                افزودن جفت جدید
              </Button>
            </Box>
          )}
          <Stack direction="row" gap={1}>
            <Button size="small" variant="contained" onClick={addOrEditStep}>
              ثبت
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setForm(DEFAULT_STEP);
              }}
            >
              انصراف
            </Button>
          </Stack>
        </Box>
      )}

      {/* نمایش لیست گام‌ها با Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(unit.steps || []).map((s, i) => (
                <Draggable key={i} draggableId={`step-${i}`} index={i}>
                  {(prov) => (
                    <Card
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      sx={{
                        mb: 1,
                        pl: 2,
                        background: "#e5ffe5",
                        borderRadius: 3,
                        boxShadow: 1,
                        transition: "box-shadow 0.15s",
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span {...prov.dragHandleProps}>
                            <DragIndicatorIcon
                              sx={{ color: "#999", cursor: "grab", mr: 1 }}
                            />
                          </span>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteStep(i)}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setShowForm(true);
                              setEditing(i);
                              setForm(s);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setOpenIndex(openIndex === i ? null : i)
                            }
                          >
                            <ExpandMoreIcon
                              fontSize="small"
                              sx={{
                                transform:
                                  openIndex === i ? "rotate(180deg)" : "none",
                                transition: "0.2s",
                              }}
                            />
                          </IconButton>
                          <Typography fontWeight="bold">
                            {i + 1}.{" "}
                            {s.type === "explanation"
                              ? "توضیح"
                              : s.type === "multiple-choice"
                              ? "سوال چندگزینه‌ای"
                              : s.type === "multi-answer"
                              ? "سوال چندگزینه‌ای چندجوابی"
                              : s.type === "fill-in-the-blank"
                              ? "جای‌خالی"
                              : s.type === "matching"
                              ? "وصل‌کردنی"
                              : ""}
                          </Typography>
                        </Stack>
                        <Collapse in={openIndex === i}>
                          {s.type === "explanation" && (
                            <Box
                              sx={{ mt: 1 }}
                              dangerouslySetInnerHTML={{ __html: s.content }}
                            />
                          )}
                          {s.type === "multiple-choice" && (
                            <>
                              <Typography sx={{ mt: 1 }}>
                                سوال: {s.text}
                              </Typography>
                              <ol>
                                {(s.options || []).map((op, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      fontWeight:
                                        s.correctIndex === idx
                                          ? "bold"
                                          : "normal",
                                    }}
                                  >
                                    {op}
                                  </li>
                                ))}
                              </ol>
                              {s.explanation && (
                                <Typography variant="caption" color="primary">
                                  {s.explanation}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                فیدبک صحیح: {s.feedbackCorrect}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="error.main">
                                فیدبک غلط: {s.feedbackWrong}
                              </Typography>
                            </>
                          )}
                          {s.type === "multi-answer" && (
                            <>
                              <Typography sx={{ mt: 1 }}>
                                سوال: {s.text}
                              </Typography>
                              <ol>
                                {(s.options || []).map((op, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      fontWeight:
                                        Array.isArray(s.correctIndexes) &&
                                        s.correctIndexes.includes(idx)
                                          ? "bold"
                                          : "normal",
                                      color:
                                        Array.isArray(s.correctIndexes) &&
                                        s.correctIndexes.includes(idx)
                                          ? "#388e3c"
                                          : "inherit",
                                    }}
                                  >
                                    {op}
                                  </li>
                                ))}
                              </ol>
                              {s.explanation && (
                                <Typography variant="caption" color="primary">
                                  {s.explanation}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                فیدبک صحیح: {s.feedbackCorrect}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="error.main">
                                فیدبک غلط: {s.feedbackWrong}
                              </Typography>
                            </>
                          )}
                          {s.type === "fill-in-the-blank" && (
                            <>
                              <Typography sx={{ mt: 1 }}>
                                جمله: {s.text.replace("-", "____")}
                              </Typography>
                              <Typography color="info.main">
                                پاسخ صحیح: {s.answer}
                              </Typography>
                              {s.explanation && (
                                <Typography variant="caption" color="primary">
                                  {s.explanation}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                فیدبک صحیح: {s.feedbackCorrect}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="error.main">
                                فیدبک غلط: {s.feedbackWrong}
                              </Typography>
                            </>
                          )}
                          {s.type === "matching" && (
                            <Box sx={{ mt: 1 }}>
                              <Typography fontWeight={600}>
                                لیست جفت‌های درست:
                              </Typography>
                              <ol>
                                {(s.pairs || []).map((pair, idx) => (
                                  <li key={idx}>
                                    <b>{pair.left}</b> ← <b>{pair.right}</b>
                                  </li>
                                ))}
                              </ol>
                              {s.explanation && (
                                <Typography variant="caption" color="primary">
                                  {s.explanation}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Collapse>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
