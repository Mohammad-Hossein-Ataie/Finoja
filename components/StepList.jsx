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

const FINOJA_COLORS = {
  primary: "#2477F3",
  secondary: "#D2E7FF",
  accent: "#66DE93",
  background: "#F9FAFB",
  text: "#1A2233",
  error: "#F35C4A",
};

const DEFAULT_STEP = {
  title: "",
  type: "explanation",
  content: "",
  text: "",
  options: ["", "", ""],
  correctIndex: 0,
  correctIndexes: [],
  answer: "",
  explanation: "",
  feedbackCorrect: "",
  feedbackWrong: "",
  pairs: [],
  matchingQuestion: "",
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


  const addOption = () =>
    setForm((f) => ({ ...f, options: [...(f.options || []), ""] }));
  const removeOption = (idx) => {
    setForm((f) => {
      const options = [...(f.options || [])];
      options.splice(idx, 1);
      let newCorrectIndex = f.correctIndex;
      if (f.correctIndex >= options.length) newCorrectIndex = 0;
      let newCorrectIndexes = f.correctIndexes;
      if (Array.isArray(f.correctIndexes)) {
        newCorrectIndexes = f.correctIndexes
          .filter((i) => i !== idx)
          .map((i) => (i > idx ? i - 1 : i));
      }
      return {
        ...f,
        options,
        correctIndex: newCorrectIndex,
        correctIndexes: newCorrectIndexes,
      };
    });
  };

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

  const StepGuide = (
    <Alert severity="info" sx={{ mb: 1, background: FINOJA_COLORS.secondary }}>
      <b>راهنما:</b>
      <ul style={{ margin: 0, padding: 0, paddingRight: 16, fontSize: 13 }}>
        <li>
          برای گام <b>توضیح</b>، فقط متن را بنویسید.
        </li>
        <li>
          در گام <b>جای‌خالی</b>، جمله و گزینه‌های پیشنهادی را مشخص کنید؛ فقط
          یک گزینه صحیح است.
        </li>
        <li>
          در گام <b>چندگزینه‌ای</b>، گزینه صحیح یا گزینه‌های صحیح را مشخص و
          فیدبک صحیح/غلط را بنویسید.
        </li>
        <li>
          در گام <b>وصل‌کردنی</b>، عنوان سوال و جفت‌های مرتبط را بنویسید.
        </li>
      </ul>
    </Alert>
  );

  return (
    <Box sx={{ mt: 1, pl: 3 }}>
      <Button
        variant="outlined"
        size="small"
        sx={{
          mb: 1,
          color: FINOJA_COLORS.primary,
          borderColor: FINOJA_COLORS.primary,
          fontWeight: 700,
        }}
        onClick={() => {
          setShowForm(true);
          setEditing(null);
        }}
      >
        افزودن گام جدید
      </Button>

      {showForm && (
        <Box
          mb={2}
          mt={1}
          display="flex"
          flexDirection="column"
          gap={1}
          sx={{ background: FINOJA_COLORS.secondary, p: 2, borderRadius: 2 }}
        >
          {StepGuide}

          {/* عنوان گام */}
          <TextField
            label="عنوان گام"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            sx={{ background: "#fff" }}
            InputProps={{ sx: { fontSize: 10 } }}
          />

          {/* نوع گام */}
          <FormControl size="small">
            <InputLabel>نوع گام</InputLabel>
            <Select
              value={form.type}
              label="نوع گام"
              onChange={(e) => handleTypeChange(e.target.value)}
              sx={{ background: "#fff" }}
              inputProps={{ style: { fontSize: 12 } }}
            >
              <MenuItem value="explanation">توضیح</MenuItem>
              <MenuItem value="multiple-choice">سوال چندگزینه‌ای</MenuItem>
              <MenuItem value="multi-answer">سوال چندگزینه‌ای چندجوابی</MenuItem>
              <MenuItem value="fill-in-the-blank">جای‌خالی (با گزینه)</MenuItem>
              <MenuItem value="matching">وصل‌کردنی</MenuItem>
            </Select>
          </FormControl>

          {/* ───── نوع «توضیح» */}
          {form.type === "explanation" && (
            <RichTextEditor
              value={form.content}
              onChange={(val) => setForm((f) => ({ ...f, content: val }))}
            />
          )}

          {/* ───── انواع سؤالی (چندگزینه‌ای، چندجوابی، جای‌خالی) */}
          {(form.type === "multiple-choice" ||
            form.type === "multi-answer" ||
            form.type === "fill-in-the-blank") && (
            <>
              <TextField
                label={
                  form.type === "fill-in-the-blank"
                    ? "جمله دارای جای‌خالی (برای جای خالی از - استفاده کن)"
                    : "متن سوال"
                }
                size="small"
                multiline
                minRows={3}
                fullWidth
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                sx={{ background: "#fff" }}
                InputProps={{ sx: { fontSize: 10 } }}
              />

              {form.type === "fill-in-the-blank" && (
                <Typography variant="caption" color="info.main" mb={1}>
                  توجه: جای خالی با <b>-</b> در جمله مشخص شود. مثال: من بهترین
                  حالت را - دارم
                </Typography>
              )}

              {/* گزینه‌ها */}
              <Stack gap={1}>
                {(form.options || []).map((option, idx) => (
                  <Stack direction="row" gap={1} alignItems="center" key={idx}>
                    <TextField
                      label={`گزینه ${idx + 1}`}
                      size="small"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      sx={{ background: "#fff" }}
                      InputProps={{ sx: { fontSize: 10 } }}
                    />
                    {form.options.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeOption(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                    {form.type === "multi-answer" && (
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
                            sx={{ color: FINOJA_COLORS.primary }}
                          />
                        }
                        label="صحیح"
                      />
                    )}
                  </Stack>
                ))}

                <Button
                  size="small"
                  variant="outlined"
                  sx={{ width: "fit-content", px: 2, fontSize: 10, mt: 1 }}
                  onClick={addOption}
                >
                  افزودن گزینه
                </Button>
              </Stack>

              {/* انتخاب گزینه صحیح */}
              {(form.type === "multiple-choice" ||
                form.type === "fill-in-the-blank") && (
                <FormControl size="small" sx={{ width: 160 }}>
                  <InputLabel>گزینه صحیح</InputLabel>
                  <Select
                    value={form.correctIndex}
                    label="گزینه صحیح"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, correctIndex: e.target.value }))
                    }
                    sx={{ background: "#fff" }}
                    inputProps={{ style: { fontSize: 12 } }}
                  >
                    {form.options.map((op, idx) => (
                      <MenuItem key={idx} value={idx}>{`گزینه ${
                        idx + 1
                      }`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* فیدبک و توضیح */}
              <TextField
                label="توضیح پس از جواب"
                size="small"
                multiline
                minRows={2}
                value={form.explanation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, explanation: e.target.value }))
                }
                sx={{ background: "#fff" }}
                InputProps={{ sx: { fontSize: 10 } }}
              />
              <TextField
                label="فیدبک صحیح"
                size="small"
                multiline
                minRows={2}
                value={form.feedbackCorrect}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackCorrect: e.target.value }))
                }
                sx={{ background: "#fff" }}
                InputProps={{ sx: { fontSize: 10 } }}
              />
              <TextField
                label="فیدبک غلط"
                size="small"
                multiline
                minRows={2}
                value={form.feedbackWrong}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feedbackWrong: e.target.value }))
                }
                sx={{ background: "#fff" }}
                InputProps={{ sx: { fontSize: 10 } }}
              />
            </>
          )}

          {/* ───── نوع «وصل‌کردنی» */}
          {form.type === "matching" && (
            <Box>
              <TextField
                label="عنوان سوال وصل‌کردنی"
                size="small"
                multiline
                minRows={2}
                value={form.matchingQuestion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, matchingQuestion: e.target.value }))
                }
                sx={{ background: "#fff", mb: 1, mr: 1, width: "70%" }}
                InputProps={{ sx: { fontSize: 10 } }}
              />

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
                    sx={{ background: "#fff" }}
                    InputProps={{ sx: { fontSize: 10 } }}
                  />
                  <TextField
                    label="ستون چپ"
                    size="small"
                    value={pair.right}
                    onChange={(e) =>
                      updateMatchingPair(idx, "right", e.target.value)
                    }
                    sx={{ background: "#fff" }}
                    InputProps={{ sx: { fontSize: 10 } }}
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

              <Button
                size="small"
                variant="outlined"
                onClick={addMatchingPair}
                sx={{
                  color: FINOJA_COLORS.primary,
                  borderColor: FINOJA_COLORS.primary,
                  mt: 1,
                  px: 2,
                  fontSize: 10,
                }}
              >
                افزودن جفت جدید
              </Button>

              <TextField
                label="توضیح پس از جواب"
                size="small"
                multiline
                minRows={2}
                value={form.explanation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, explanation: e.target.value }))
                }
                sx={{ background: "#fff", mt: 2 }}
                InputProps={{ sx: { fontSize: 10 } }}
              />
            </Box>
          )}

          {/* دکمه‌های ثبت / انصراف */}
          <Stack direction="row" gap={1}>
            <Button
              size="small"
              variant="contained"
              onClick={addOrEditStep}
              sx={{
                background: FINOJA_COLORS.primary,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
              }}
            >
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
              sx={{ borderRadius: 2, color: FINOJA_COLORS.error }}
            >
              انصراف
            </Button>
          </Stack>
        </Box>
      )}

      {/* ───────── لیست گام‌ها (Drag & Drop) ───────── */}
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
                        background: FINOJA_COLORS.secondary,
                        borderRadius: 3,
                        boxShadow: 1,
                        border: `1.5px solid ${FINOJA_COLORS.primary}20`,
                        transition: "box-shadow 0.15s",
                        color: FINOJA_COLORS.text,
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
                            <EditIcon
                              fontSize="small"
                              sx={{ color: FINOJA_COLORS.primary }}
                            />
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
                                color: FINOJA_COLORS.primary,
                              }}
                            />
                          </IconButton>
                          <Typography fontWeight="bold" fontSize={14}>
                            {i + 1}.{" "}
                            {s.title ? (
                              <span style={{ color: FINOJA_COLORS.primary }}>
                                {s.title}
                              </span>
                            ) : (
                              ""
                            )}
                            <span style={{ marginRight: 8, fontSize: 12 }}>
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
                            </span>
                          </Typography>
                        </Stack>

                        <Collapse in={openIndex === i}>
                          {/* نمایش محتوای گام (بدون تغییر) */}
                          {s.type === "explanation" && (
                            <Box
                              sx={{ mt: 1 }}
                              dangerouslySetInnerHTML={{ __html: s.content }}
                            />
                          )}
                          {(s.type === "multiple-choice" ||
                            s.type === "multi-answer" ||
                            s.type === "fill-in-the-blank") && (
                            <>
                              <Typography
                                sx={{
                                  mt: 1,
                                  fontWeight: 700,
                                  color: FINOJA_COLORS.text,
                                  whiteSpace: "pre-line", // برای نمایش \n
                                }}
                              >
                                سوال: {s.text}
                              </Typography>
                              <ol>
                                {(s.options || []).map((op, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      fontWeight:
                                        (s.type === "multi-answer" &&
                                          Array.isArray(s.correctIndexes) &&
                                          s.correctIndexes.includes(idx)) ||
                                        (s.type !== "multi-answer" &&
                                          s.correctIndex === idx)
                                          ? "bold"
                                          : "normal",
                                      color:
                                        (s.type === "multi-answer" &&
                                          Array.isArray(s.correctIndexes) &&
                                          s.correctIndexes.includes(idx)) ||
                                        (s.type !== "multi-answer" &&
                                          s.correctIndex === idx)
                                          ? FINOJA_COLORS.accent
                                          : undefined,
                                    }}
                                  >
                                    {op}
                                  </li>
                                ))}
                              </ol>
                              {s.explanation && (
                                <Typography
                                  variant="caption"
                                  color={FINOJA_COLORS.primary}
                                >
                                  {s.explanation}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                color={FINOJA_COLORS.accent}
                              >
                                فیدبک صحیح: {s.feedbackCorrect}
                              </Typography>
                              <br />
                              <Typography
                                variant="caption"
                                color={FINOJA_COLORS.error}
                              >
                                فیدبک غلط: {s.feedbackWrong}
                              </Typography>
                            </>
                          )}
                          {s.type === "matching" && (
                            <Box sx={{ mt: 1 }}>
                              {s.matchingQuestion && (
                                <Typography
                                  fontWeight={600}
                                  color={FINOJA_COLORS.primary}
                                  mb={1}
                                >
                                  {s.matchingQuestion}
                                </Typography>
                              )}
                              <Typography fontWeight={700}>
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
                                <Typography
                                  variant="caption"
                                  color={FINOJA_COLORS.primary}
                                >
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
