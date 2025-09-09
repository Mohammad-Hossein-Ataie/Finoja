// ===============================
// FILE: components/StepList.jsx
// ===============================
"use client";
import { useState, useRef, useEffect } from "react";
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

/* =======================
   Embed media inside HTML
   ======================= */
const URL_RE = /(https?:\/\/[^\s"'<>]+)/g;
const isMediaUrl = (u = "") => {
  const low = u.toLowerCase();
  return (
    low.includes("youtube.com/watch?v=") ||
    low.includes("youtu.be/") ||
    low.includes("aparat.com/") ||
    /\.(mp3|wav|ogg|mp4|webm|ogv|png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(low)
  );
};

const MediaEl = ({ src }) => {
  const low = (src || "").toLowerCase();

  // YouTube
  if (low.includes("youtube.com/watch?v=") || low.includes("youtu.be/")) {
    let id = "";
    try {
      id = low.includes("watch?v=")
        ? new URL(src).searchParams.get("v") || ""
        : src.split("/").pop() || "";
    } catch {}
    return id ? (
      <Box
        sx={{
          position: "relative",
          pt: "56.25%",
          borderRadius: 2,
          overflow: "hidden",
          my: 1.25,
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
          title="youtube"
        />
      </Box>
    ) : null;
  }

  // Aparat
  if (low.includes("aparat.com/")) {
    const vid = src.includes("/v/")
      ? src.split("/v/")[1]?.split(/[?&#]/)[0] || ""
      : "";
    return vid ? (
      <Box
        sx={{
          position: "relative",
          pt: "56.25%",
          borderRadius: 2,
          overflow: "hidden",
          my: 1.25,
        }}
      >
        <iframe
          src={`https://www.aparat.com/video/video/embed/videohash/${vid}/vt/frame`}
          allowFullScreen
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
          title="aparat"
        />
      </Box>
    ) : null;
  }

  // Audio
  if (/\.(mp3|wav|ogg)(\?|#|$)/i.test(low)) {
    return <audio src={src} controls style={{ width: "100%", margin: "10px 0" }} />;
  }

  // Video
  if (/\.(mp4|webm|ogv)(\?|#|$)/i.test(low)) {
    return (
      <video
        src={src}
        controls
        style={{ width: "100%", borderRadius: 8, margin: "10px 0" }}
      />
    );
  }

  // Image
  if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(low)) {
    return (
      <img
        src={src}
        alt=""
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: 8,
          display: "block",
          margin: "10px 0",
        }}
      />
    );
  }
  return null;
};

const HtmlInlineMedia = ({ html = "" }) => {
  if (!html) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  const walk = (node, key) => {
    // متن: لینک‌ها را تشخیص بده و embed کن
    if (node.nodeType === 3) {
      const text = node.nodeValue || "";
      const parts = text.split(URL_RE);
      return parts.map((chunk, i) => {
        if (i % 2 === 0)
          return chunk ? <span key={`${key}-t-${i}`}>{chunk}</span> : null;
        const url = chunk.replace(/[),.;]+$/, "");
        return isMediaUrl(url) ? (
          <MediaEl key={`${key}-m-${i}`} src={url} />
        ) : (
          <a
            key={`${key}-a-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{ wordBreak: "break-all" }}
          >
            {url}
          </a>
        );
      });
    }

    if (node.nodeType !== 1) return null;
    const tag = node.tagName.toLowerCase();

    // ⚠️ تگ‌های void باید self-closing باشن (بدون children)
    if (tag === "br") return <br key={key} />;
    if (tag === "hr") return <hr key={key} />;

    if (tag === "a") {
      const href = node.getAttribute("href") || "";
      if (isMediaUrl(href)) return <MediaEl key={key} src={href} />;
      const children = Array.from(node.childNodes).map((ch, i) =>
        walk(ch, `${key}-${i}`)
      );
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {children}
        </a>
      );
    }

    const children = Array.from(node.childNodes).map((ch, i) =>
      walk(ch, `${key}-${i}`)
    );
    const allowed = new Set([
      "p",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span",
    ]);
    const Tag = allowed.has(tag) ? tag : "span";
    return <Tag key={key}>{children}</Tag>;
  };

  return (
    <Box
      sx={{
        lineHeight: 1.9,
        "& p": { m: 0, mb: 1 },
        "& table": {
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          overflow: "hidden",
          borderRadius: 1,
        },
        "& th, & td": { border: "1px solid #e5e7eb", p: 1 },
        "& th": { background: "#f3f4f6", fontWeight: 700 },
      }}
    >
      {Array.from(root.childNodes).map((n, i) => walk(n, `n-${i}`))}
    </Box>
  );
};
/* ======================= */

const TYPE_LABELS = {
  explanation: "توضیحی",
  "multiple-choice": "چهارگزینه‌ای",
  "multi-answer": "چندگزینه‌ای (چند پاسخ صحیح)",
  matching: "تطبیق",
  video: "ویدیویی",
  audio: "صوتی",
};

const EMPTY_STEP = {
  title: "",
  type: "explanation",
  content: "",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  correctIndexes: [],
  explanation: "",
  feedbackCorrect: "",
  feedbackWrong: "",
  pairs: [{ left: "", right: "" }],
  matchingQuestion: "",
  mediaUrl: "",
  mediaKey: "",
};

function normalizeStep(s) {
  const t = s.type;
  const base = { ...s };

  const clearQA = () => {
    base.options = [];
    base.correctIndex = 0;
    base.correctIndexes = [];
    base.feedbackCorrect = "";
    base.feedbackWrong = "";
  };
  const clearMatching = () => {
    base.pairs = [{ left: "", right: "" }];
    base.matchingQuestion = "";
  };

  if (t === "explanation") {
    base.text = "";
    clearQA();
    clearMatching();
    base.mediaKey = "";
    base.mediaUrl = "";
  } else if (t === "multiple-choice") {
    base.correctIndexes = [];
    clearMatching();
    base.mediaUrl = "";
    base.mediaKey = "";
  } else if (t === "multi-answer") {
    base.correctIndex = 0;
    clearMatching();
    base.mediaUrl = "";
    base.mediaKey = "";
  } else if (t === "matching") {
    clearQA();
    base.mediaUrl = "";
    base.mediaKey = "";
  } else if (t === "video" || t === "audio") {
    base.content = "";
    clearQA();
    clearMatching();
  }
  return base;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
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

  // آپلود S3 برای video/audio
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // آپلود برای گام توضیحی (فقط کمک برای کپی لینک)
  const helperRef = useRef(null);
  const [helperUploading, setHelperUploading] = useState(false);
  const [helperKey, setHelperKey] = useState("");
  const [helperSigned, setHelperSigned] = useState("");

  // پیش‌نمایش ویدیو/صوت (URL امضاشده بر اساس ایندکس گام)
  const [previewMap, setPreviewMap] = useState({}); // { [index]: signedUrl }

  const QUESTION_TYPES = ["multiple-choice", "multi-answer"];
  const SHOW_FEEDBACK = QUESTION_TYPES.includes(form.type);

  const save = async (newSteps) => {
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, steps: newSteps };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    const res = await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      notify("ذخیره‌سازی با خطا مواجه شد", "error");
      return;
    }
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
    setHelperKey("");
    setHelperSigned("");
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

  // ====== افزودن/حذف گزینه‌ها برای تست‌ها ======
  const addOption = () =>
    setForm((f) => ({ ...f, options: [...(f.options || []), ""] }));

  const removeOption = (idx) =>
    setForm((f) => {
      const opts = [...(f.options || [])];
      if (opts.length <= 2) return f;
      opts.splice(idx, 1);

      let correctIndex = f.correctIndex ?? 0;
      if (f.type === "multiple-choice") {
        if (correctIndex === idx) correctIndex = 0;
        else if (correctIndex > idx) correctIndex -= 1;
      }
      let correctIndexes = Array.isArray(f.correctIndexes)
        ? f.correctIndexes
        : [];
      correctIndexes = correctIndexes
        .filter((i) => i !== idx)
        .map((i) => (i > idx ? i - 1 : i));

      return { ...f, options: opts, correctIndex, correctIndexes };
    });

  // ====== آپلود برای video/audio ======
  const handlePickAndUpload = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isVideo = form.type === "video";
    const isAudio = form.type === "audio";
    if (!isVideo && !isAudio) return;

    const okVideo = /(mp4|webm|ogv)$/i.test(file.name);
    const okAudio = /(mp3|wav|ogg)$/i.test(file.name);
    if ((isVideo && !okVideo) || (isAudio && !okAudio)) {
      notify("فرمت فایل با نوع گام سازگار نیست.", "warning");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, mediaKey: data.key, mediaUrl: "" }));
      notify("آپلود انجام شد ✅");
    } catch {
      notify("خطا در آپلود فایل", "error");
    } finally {
      setUploading(false);
    }
  };

  // ====== آپلود کمکی برای توضیحی ======
  const helperPick = () => helperRef.current?.click();
  const helperChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setHelperUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setHelperKey(data.key);
      setHelperSigned("");
      notify("آپلود انجام شد ✅ — روی «گرفتن لینک موقت» بزنید");
    } catch {
      notify("خطا در آپلود فایل", "error");
    } finally {
      setHelperUploading(false);
    }
  };
  const getSigned = async () => {
    if (!helperKey) return;
    const r = await fetch("/api/storage/presigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: helperKey }),
    });
    const data = await r.json();
    setHelperSigned(data?.url || "");
    if (data?.url) {
      await copy(data.url);
      notify("لینک در کلیپ‌بورد کپی شد ✨");
    }
  };

  // ====== آماده‌سازی پیش‌نمایش مدیا (URL امضاشده) هنگام باز شدن آیتم ======
  useEffect(() => {
    const fetchSigned = async () => {
      if (openIdx === null) return;
      const st = (unit.steps || [])[openIdx];
      if (!st) return;
      if (
        (st.type === "video" || st.type === "audio") &&
        st.mediaKey &&
        !previewMap[openIdx] &&
        !st.mediaUrl
      ) {
        try {
          const r = await fetch("/api/storage/presigned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: st.mediaKey }),
          });
          const data = await r.json();
          if (data?.url) {
            setPreviewMap((m) => ({ ...m, [openIdx]: data.url }));
          }
        } catch {
          /* ignore */
        }
      }
    };
    fetchSigned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIdx, unit?.steps]);

  const isYouTube = (u = "") =>
    u.includes("youtube.com/watch?v=") || u.includes("youtu.be/");
  const isAparat = (u = "") => u.includes("aparat.com/");

  const renderMediaPreview = (st, i) => {
    const external = (st.mediaUrl || "").trim();
    const signed = previewMap[i];
    const src = external || signed;

    // YouTube
    if (external && isYouTube(external)) {
      let id = "";
      try {
        id = external.includes("watch?v=")
          ? new URL(external).searchParams.get("v") || ""
          : external.split("/").pop() || "";
      } catch {}
      return id ? (
        <Box
          sx={{
            position: "relative",
            pt: "56.25%",
            borderRadius: 2,
            overflow: "hidden",
            my: 1,
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            title="youtube"
          />
        </Box>
      ) : null;
    }

    // Aparat
    if (external && isAparat(external)) {
      const id = external.split("/v/")[1]?.split(/[?&#]/)[0] || "";
      return id ? (
        <Box
          sx={{
            position: "relative",
            pt: "56.25%",
            borderRadius: 2,
            overflow: "hidden",
            my: 1,
          }}
        >
          <iframe
            src={`https://www.aparat.com/video/video/embed/videohash/${id}/vt/frame`}
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            title="aparat"
          />
        </Box>
      ) : null;
    }

    // فایل‌های mp4/mp3/... (چه خارجی چه امضاشده)
    if (src) {
      if (st.type === "video")
        return (
          <video
            src={src}
            controls
            style={{ width: "100%", borderRadius: 8, marginTop: 8 }}
          />
        );
      return (
        <audio src={src} controls style={{ width: "100%", marginTop: 8 }} />
      );
    }

    return (
      <Typography variant="caption" color="text.secondary">
        {st.mediaKey ? "در حال آماده‌سازی پیش‌نمایش…" : "بدون فایل"}
      </Typography>
    );
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
              • «توضیحی» متن دارد؛ می‌توانید فایل آپلود کنید و لینک را در متن
              Paste کنید (پیش‌نمایش خودکار). <br />
              • «ویدیویی/صوتی» فقط توضیح کوتاه + فایل/لینک دارند. <br />
              • تست‌ها: چهارگزینه‌ای و چندگزینه‌ای. <br />• «تطبیق» با جفت‌های
              چپ/راست.
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
            setHelperKey("");
            setHelperSigned("");
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
              {(unit.steps || []).map((st, i) => (
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
                        <Stack direction="row" alignItems="center" spacing={1}>
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
                              setHelperKey("");
                              setHelperSigned("");
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
                              <HtmlInlineMedia
                                html={
                                  st.content ||
                                  '<p style="opacity:.6">— بدون محتوا —</p>'
                                }
                              />
                            ) : st.type === "matching" ? (
                              <>
                                <Typography sx={{ mb: 0.75 }}>
                                  سؤال تطبیق:{" "}
                                  {st.matchingQuestion ||
                                    "موارد مناسب را تطبیق دهید."}
                                </Typography>
                                {Array.isArray(st.pairs) && st.pairs.length ? (
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
                                        <div>{p.left || "—"}</div>
                                        <div>{p.right || "—"}</div>
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography sx={{ opacity: 0.6 }}>
                                    — بدون جفت —
                                  </Typography>
                                )}
                              </>
                            ) : st.type === "video" || st.type === "audio" ? (
                              <>
                                {st.text && (
                                  <Typography sx={{ mb: 0.5 }}>
                                    توضیح: {st.text}
                                  </Typography>
                                )}

                                {renderMediaPreview(st, i)}

                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    mt: 0.5,
                                    opacity: 0.7,
                                  }}
                                >
                                  {st.mediaKey
                                    ? `S3 Key: ${st.mediaKey}`
                                    : st.mediaUrl
                                    ? `URL: ${st.mediaUrl}`
                                    : ""}
                                </Typography>
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
                                            {o || "—"}
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
              ))}
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
                setForm((f) => ({ ...f, type: e.target.value }))}
                select
                sx={{ minWidth: 280 }}
              >
                <MenuItem value="explanation">توضیحی</MenuItem>
                <MenuItem value="multiple-choice">چهارگزینه‌ای</MenuItem>
                <MenuItem value="multi-answer">
                  چندگزینه‌ای (چند پاسخ صحیح)
                </MenuItem>
                <MenuItem value="matching">تطبیق</MenuItem>
                <Divider />
                <MenuItem value="video">ویدیویی</MenuItem>
                <MenuItem value="audio">صوتی</MenuItem>
              </TextField>

              {(form.type === "video" || form.type === "audio") && (
                <TextField
                  label="لینک بیرونی (اختیاری)"
                  placeholder="https://aparat.com/... | https://...mp4"
                  value={form.mediaUrl || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mediaUrl: e.target.value }))
                  }
                  fullWidth
                />
              )}
            </Stack>

            {form.type !== "explanation" && (
              <TextField
                label={
                  form.type === "matching"
                    ? "متن/توضیح (اختیاری)"
                    : "متن سؤال/توضیح"
                }
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                multiline
                minRows={2}
              />
            )}

            {form.type === "explanation" && (
              <>
                <Typography fontWeight={700} mt={1}>
                  محتوا:
                </Typography>
                <RichTextEditor
                  value={form.content}
                  onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                />

                <Box
                  sx={{
                    mt: 1.5,
                    border: "2px dashed #d0d7de",
                    borderRadius: 2,
                    p: 1.25,
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 0.5, fontWeight: 800 }}
                  >
                    آپلود مدیا برای درج در متن
                  </Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    gap={1}
                    alignItems="center"
                  >
                    <TextField
                      fullWidth
                      value={helperKey}
                      placeholder="S3 Key — پس از آپلود پر می‌شود"
                      onChange={(e) => setHelperKey(e.target.value)}
                    />
                    <Button
                      onClick={helperPick}
                      disabled={helperUploading}
                      variant="outlined"
                    >
                      {helperUploading
                        ? "در حال آپلود…"
                        : "انتخاب و آپلود فایل"}
                    </Button>
                    <input
                      ref={helperRef}
                      type="file"
                      hidden
                      accept="video/mp4,video/webm,video/ogg,audio/mpeg,audio/wav,audio/ogg,image/*"
                      onChange={helperChange}
                    />
                  </Stack>
                  <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      onClick={getSigned}
                      disabled={!helperKey}
                    >
                      گرفتن لینک موقت
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        if (helperSigned) {
                          await copy(helperSigned);
                          notify("لینک در کلیپ‌بورد کپی شد ✨");
                        }
                      }}
                      disabled={!helperSigned}
                    >
                      کپی لینک
                    </Button>
                  </Stack>
                  {!!helperSigned && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.75,
                        display: "block",
                        direction: "ltr",
                        wordBreak: "break-all",
                      }}
                    >
                      {helperSigned}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    نکته: لینک را داخل ادیتور بالا پیست کنید. اگر لینک mp4/mp3/…
                    باشد، پیش‌نمایش خودکار نمایش داده می‌شود.
                  </Typography>
                </Box>
              </>
            )}

            {(form.type === "video" || form.type === "audio") && (
              <Box
                sx={{
                  border: "2px dashed #d0d7de",
                  borderRadius: 2,
                  p: 1.25,
                  bgcolor: "#f8fafc",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7, mb: 0.75, textAlign: "left" }}
                >
                  S3 Key
                </Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    value={form.mediaKey || ""}
                    placeholder="پس از آپلود پر می‌شود…"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mediaKey: e.target.value }))
                    }
                  />
                  <Button
                    onClick={handlePickAndUpload}
                    disabled={uploading}
                    variant="outlined"
                  >
                    {uploading ? "در حال آپلود…" : "انتخاب و آپلود فایل"}
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept={
                      form.type === "video"
                        ? "video/mp4,video/webm,video/ogg"
                        : "audio/mpeg,audio/wav,audio/ogg"
                    }
                    onChange={onFileChange}
                  />
                </Stack>
              </Box>
            )}

            {form.type === "multiple-choice" && (
              <>
                <Typography fontWeight={700}>گزینه‌ها</Typography>
                <Stack gap={1}>
                  {(form.options || []).map((op, i) => (
                    <Stack key={i} direction="row" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        label={`گزینه ${i + 1}`}
                        value={op}
                        onChange={(e) => {
                          const options = [...(form.options || [])];
                          options[i] = e.target.value;
                          setForm((f) => ({ ...f, options }));
                        }}
                      />
                      <IconButton
                        onClick={() => removeOption(i)}
                        disabled={(form.options?.length || 0) <= 2}
                        aria-label="حذف گزینه"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button size="small" onClick={addOption}>
                    افزودن گزینه
                  </Button>
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
                    <Stack key={i} direction="row" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        label={`گزینه ${i + 1}`}
                        value={op}
                        onChange={(e) => {
                          const options = [...(form.options || [])];
                          options[i] = e.target.value;
                          setForm((f) => ({ ...f, options }));
                        }}
                      />
                      <IconButton
                        onClick={() => removeOption(i)}
                        disabled={(form.options?.length || 0) <= 2}
                        aria-label="حذف گزینه"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button size="small" onClick={addOption}>
                    افزودن گزینه
                  </Button>
                </Stack>
                <TextField
                  label="اندیس‌های صحیح (با ویرگول)"
                  placeholder="مثلاً: 0,2,4"
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
                  label="عنوان سؤال تطبیق (اختیاری)"
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
                        onChange={(e) => {
                          const pairs = [...(form.pairs || [])];
                          pairs[i] = { ...pairs[i], left: e.target.value };
                          setForm((f) => ({ ...f, pairs }));
                        }}
                        fullWidth
                      />
                      <TextField
                        label="سمت چپ"
                        value={p.right}
                        onChange={(e) => {
                          const pairs = [...(form.pairs || [])];
                          pairs[i] = { ...pairs[i], right: e.target.value };
                          setForm((f) => ({ ...f, pairs }));
                        }}
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

            {SHOW_FEEDBACK && (
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
        autoHideDuration={2200}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
      >
        <Alert severity={toast.sev} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
