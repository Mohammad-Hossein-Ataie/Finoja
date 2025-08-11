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
  Tooltip,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import RichTextEditor from "./RichTextEditor";
import SafeHtml from "./SafeHtml";

const TYPE_LABELS = {
  explanation: "توضیحی",
  "multiple-choice": "چندگزینه‌ای",
  "multi-answer": "چندپاسخ",
  "fill-in-the-blank": "جای‌خالی",
  matching: "تطبیق",
};

const EMPTY_STEP = {
  title: "",
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
  pairs: [{ left: "", right: "" }],
  matchingQuestion: "",
  mediaUrl: "",
};

function normalizeStep(s) {
  const t = s.type;
  const base = { ...s };
  if (t === "explanation") {
    base.text = "";
    base.options = [];
    base.correctIndex = 0;
    base.correctIndexes = [];
    base.feedbackCorrect = "";
    base.feedbackWrong = "";
    base.pairs = [{ left: "", right: "" }];
    base.matchingQuestion = "";
  } else if (t === "multiple-choice" || t === "fill-in-the-blank") {
    base.correctIndexes = [];
    base.pairs = [{ left: "", right: "" }];
    base.matchingQuestion = "";
  } else if (t === "multi-answer") {
    base.correctIndex = 0;
    base.pairs = [{ left: "", right: "" }];
    base.matchingQuestion = "";
  } else if (t === "matching") {
    base.options = [];
    base.correctIndex = 0;
    base.correctIndexes = [];
  }
  return base;
}

export default function StepList({
  course,
  unit,
  unitIndex,
  section,
  sectionIndex,
  refreshCourses,
  onToast,
}) {
  const [openIdx, setOpenIdx] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_STEP);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const notify = (msg, sev = "success") => setToast({ open: true, msg, sev });

  const save = async (newSteps) => {
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

  const addOrEdit = async () => {
    const steps = unit.steps || [];
    const normalized = normalizeStep(form);
    const newSteps =
      editing !== null
        ? steps.map((s, i) => (i === editing ? normalized : s))
        : [...steps, normalized];
    await save(newSteps);
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_STEP);
    notify(editing !== null ? "گام ویرایش شد" : "گام اضافه شد");
    onToast?.("یونیت به‌روزرسانی شد");
  };

  const remove = async (idx) => {
    const newSteps = (unit.steps || []).filter((_, i) => i !== idx);
    await save(newSteps);
    notify("گام حذف شد");
    onToast?.("یونیت به‌روزرسانی شد");
  };

  const onDragEnd = async (res) => {
    if (!res.destination) return;
    if (res.source.index === res.destination.index) return;
    const steps = Array.from(unit.steps || []);
    const [item] = steps.splice(res.source.index, 1);
    steps.splice(res.destination.index, 0, item);
    await save(steps);
    notify("ترتیب گام‌ها تغییر کرد");
  };

  const handlePairsChange = (i, side, val) => {
    const pairs = [...(form.pairs || [])];
    pairs[i] = { ...pairs[i], [side]: val };
    setForm((f) => ({ ...f, pairs }));
  };

  return (
    <Box sx={{ mt: 1, pr: 1 }}>
      {/* راهنما */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography fontWeight={800} fontSize={16}>
          گام‌ها
        </Typography>
        <Tooltip title={helpOpen ? "بستن راهنما" : "نمایش راهنما"}>
          <IconButton onClick={() => setHelpOpen((v) => !v)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Collapse in={helpOpen}>
        <Card variant="outlined" sx={{ mb: 1 }}>
          <CardContent sx={{ pt: 1.5 }}>
            <Typography variant="body2" sx={{ lineHeight: 2 }}>
              • «توضیحی» فقط متن/رسانه دارد و گزینه ندارد.
              <br />
              • برای «چندگزینه‌ای/چندپاسخ» گزینه‌ها و فیدبک را پر کنید.
              <br />
              • «جای‌خالی» معمولاً یک پاسخ صحیح دارد و بین گزینه‌ها انتخاب
              می‌شود.
              <br />• «تطبیق» را با جفت‌های چپ/راست بسازید.
            </Typography>
          </CardContent>
        </Card>
      </Collapse>

      <Stack direction="row" gap={1} sx={{ mb: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setFormOpen(true);
            setEditing(null);
            setForm(EMPTY_STEP);
          }}
        >
          افزودن گام جدید
        </Button>
      </Stack>

      {/* لیست گام‌ها */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(p) => (
            <div ref={p.innerRef} {...p.droppableProps}>
              {(unit.steps || []).map((st, i) => {
                const showOptions =
                  [
                    "multiple-choice",
                    "multi-answer",
                    "fill-in-the-blank",
                  ].includes(st.type) &&
                  Array.isArray(st.options) &&
                  st.options.some((o) => (o || "").toString().trim() !== "");

                return (
                  <Draggable key={i} draggableId={`step-${i}`} index={i}>
                    {(prov) => (
                      <Card
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        sx={{
                          mb: 1,
                          background: "#fff",
                          borderRadius: 2,
                          boxShadow: 1,
                          border: "1px solid #eaecef",
                        }}
                      >
                        <CardContent sx={{ pb: 1.25 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <span {...prov.dragHandleProps}>
                              <DragIndicatorIcon
                                sx={{ color: "#999", cursor: "grab" }}
                              />
                            </span>
                            <IconButton size="small" onClick={() => remove(i)}>
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setFormOpen(true);
                                setEditing(i);
                                setForm(st);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setOpenIdx(openIdx === i ? null : i)
                              }
                            >
                              <ExpandMoreIcon
                                sx={{
                                  transform:
                                    openIdx === i ? "rotate(180deg)" : "none",
                                  transition: ".2s",
                                }}
                              />
                            </IconButton>
                            <Chip
                              size="small"
                              label={TYPE_LABELS[st.type] || st.type}
                            />
                            <Typography fontWeight={700} sx={{ mr: 1 }}>
                              {i + 1}. {st.title || "بدون عنوان"}
                            </Typography>
                          </Stack>

                          <Collapse in={openIdx === i}>
                            <Box sx={{ mt: 1, color: "text.secondary" }}>
                              {st.type === "explanation" ? (
                                <>
                                  {st.mediaUrl ? (
                                    <div style={{ marginBottom: 8 }}>
                                      <SafeHtml
                                        html={`<p><a href="${st.mediaUrl}" target="_blank" rel="noreferrer">مشاهده مدیا</a></p>`}
                                      />
                                    </div>
                                  ) : null}
                                  <SafeHtml
                                    html={
                                      st.content ||
                                      '<p style="opacity:.6">— بدون محتوا —</p>'
                                    }
                                  />
                                </>
                              ) : st.type === "matching" ? (
                                <>
                                  {(st.matchingQuestion || st.text) && (
                                    <Typography sx={{ mb: 0.75 }}>
                                      سؤال تطبیق:{" "}
                                      {st.matchingQuestion || st.text}
                                    </Typography>
                                  )}

                                  {Array.isArray(st.pairs) &&
                                  st.pairs.length ? (
                                    <Box
                                      sx={{
                                        mt: 0.5,
                                        border: "1px dashed #d0d7de",
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "grid",
                                          gridTemplateColumns: "1fr 1fr",
                                          p: 1,
                                          bgcolor: "#f6f8fa",
                                          fontWeight: 700,
                                        }}
                                      >
                                        <div>سمت راست</div>
                                        <div>سمت چپ</div>
                                      </Box>
                                      {st.pairs.map((p, idx) => (
                                        <Box
                                          key={idx}
                                          sx={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            p: 1,
                                            borderTop: "1px solid #eee",
                                          }}
                                        >
                                          <div>
                                            {p.left || (
                                              <span style={{ opacity: 0.5 }}>
                                                —
                                              </span>
                                            )}
                                          </div>
                                          <div>
                                            {p.right || (
                                              <span style={{ opacity: 0.5 }}>
                                                —
                                              </span>
                                            )}
                                          </div>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography sx={{ opacity: 0.6 }}>
                                      — بدون جفت —
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <>
                                  {st.text && (
                                    <Typography sx={{ mb: 0.5 }}>
                                      سؤال: {st.text}
                                    </Typography>
                                  )}
                                  {Array.isArray(st.options) &&
                                    st.options.some(
                                      (o) => (o || "").trim() !== ""
                                    ) && (
                                      <>
                                        <Typography variant="body2">
                                          گزینه‌ها:
                                        </Typography>
                                        <ol style={{ marginTop: 4 }}>
                                          {st.options.map((o, idx) => (
                                            <li
                                              key={idx}
                                              style={{
                                                fontWeight:
                                                  st.correctIndex === idx ||
                                                  (
                                                    st.correctIndexes || []
                                                  ).includes(idx)
                                                    ? "bold"
                                                    : "normal",
                                              }}
                                            >
                                              {o || (
                                                <span style={{ opacity: 0.5 }}>
                                                  —
                                                </span>
                                              )}
                                            </li>
                                          ))}
                                        </ol>
                                      </>
                                    )}
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {p.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* دیالوگ ساخت/ویرایش گام */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle fontWeight={900}>
          {editing !== null ? "ویرایش گام" : "افزودن گام"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack gap={1.5}>
            <TextField
              label="عنوان گام"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />

            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              <TextField
                label="نوع گام"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                select
                sx={{ minWidth: 240 }}
              >
                <MenuItem value="explanation">توضیحی</MenuItem>
                <MenuItem value="multiple-choice">چندگزینه‌ای</MenuItem>
                <MenuItem value="multi-answer">چندپاسخ</MenuItem>
                <MenuItem value="fill-in-the-blank">جای‌خالی</MenuItem>
                <MenuItem value="matching">تطبیق</MenuItem>
              </TextField>

              <TextField
                label="لینک مدیا (اختیاری)"
                placeholder="https://... (mp4/mp3/jpg/...)"
                value={form.mediaUrl || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mediaUrl: e.target.value }))
                }
                fullWidth
              />
            </Stack>

            {form.type === "explanation" && (
              <>
                <Typography fontWeight={700} mt={1}>
                  محتوا:
                </Typography>
                <RichTextEditor
                  value={form.content}
                  onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                />
              </>
            )}

            {[
              "multiple-choice",
              "multi-answer",
              "fill-in-the-blank",
              "matching",
            ].includes(form.type) && (
              <TextField
                label="متن سؤال"
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                multiline
                minRows={2}
              />
            )}

            {["multiple-choice", "fill-in-the-blank"].includes(form.type) && (
              <>
                <Typography fontWeight={700}>گزینه‌ها</Typography>
                <Stack gap={1}>
                  {(form.options || []).map((op, i) => (
                    <TextField
                      key={i}
                      label={`گزینه ${i + 1}`}
                      value={op}
                      onChange={(e) => {
                        const options = [...(form.options || [])];
                        options[i] = e.target.value;
                        setForm((f) => ({ ...f, options }));
                      }}
                    />
                  ))}
                </Stack>
                <TextField
                  label="اندیس گزینه صحیح (۰…)"
                  type="number"
                  value={form.correctIndex ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      correctIndex: Number(e.target.value),
                    }))
                  }
                  sx={{ maxWidth: 260 }}
                />
              </>
            )}

            {form.type === "multi-answer" && (
              <>
                <Typography fontWeight={700}>گزینه‌ها</Typography>
                <Stack gap={1}>
                  {(form.options || []).map((op, i) => (
                    <TextField
                      key={i}
                      label={`گزینه ${i + 1}`}
                      value={op}
                      onChange={(e) => {
                        const options = [...(form.options || [])];
                        options[i] = e.target.value;
                        setForm((f) => ({ ...f, options }));
                      }}
                    />
                  ))}
                </Stack>
                <TextField
                  label="اندیس‌های صحیح (با ویرگول)"
                  placeholder="مثلاً: 0,2"
                  value={(form.correctIndexes || []).join(",")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      correctIndexes: e.target.value
                        .split(",")
                        .map((x) => Number(x.trim()))
                        .filter((x) => !Number.isNaN(x)),
                    }))
                  }
                />
              </>
            )}

            {form.type === "matching" && (
              <>
                <TextField
                  label="عنوان سؤال تطبیق"
                  value={form.matchingQuestion || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, matchingQuestion: e.target.value }))
                  }
                />
                <Typography fontWeight={700} mt={1}>
                  جفت‌ها
                </Typography>
                <Stack gap={1}>
                  {(form.pairs || []).map((p, i) => (
                    <Stack
                      key={i}
                      direction={{ xs: "column", sm: "row" }}
                      gap={1}
                    >
                      <TextField
                        label="سمت راست"
                        value={p.left}
                        onChange={(e) =>
                          handlePairsChange(i, "left", e.target.value)
                        }
                        fullWidth
                      />
                      <TextField
                        label="سمت چپ"
                        value={p.right}
                        onChange={(e) =>
                          handlePairsChange(i, "right", e.target.value)
                        }
                        fullWidth
                      />
                      <Button
                        color="error"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            pairs: f.pairs.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        حذف
                      </Button>
                    </Stack>
                  ))}
                  <Button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        pairs: [...(f.pairs || []), { left: "", right: "" }],
                      }))
                    }
                  >
                    افزودن جفت
                  </Button>
                </Stack>
              </>
            )}

            {form.type !== "explanation" && (
              <>
                <TextField
                  label="فیدبک پاسخ صحیح"
                  value={form.feedbackCorrect}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, feedbackCorrect: e.target.value }))
                  }
                  multiline
                  minRows={2}
                />
                <TextField
                  label="فیدبک پاسخ غلط"
                  value={form.feedbackWrong}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, feedbackWrong: e.target.value }))
                  }
                  multiline
                  minRows={2}
                />
                <TextField
                  label="توضیح پس از پاسخ (اختیاری)"
                  value={form.explanation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, explanation: e.target.value }))
                  }
                  multiline
                  minRows={2}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={addOrEdit}>
            ثبت
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
      >
        <Alert severity={toast.sev} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
