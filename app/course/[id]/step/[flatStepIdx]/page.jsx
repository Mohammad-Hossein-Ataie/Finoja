"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  LinearProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";

/* ========== shuffle/choices ========== */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const makeShuffledOptions = (options = []) => {
  const idxs = options.map((_, i) => i);
  const shuffledIdxs = shuffle(idxs);
  return {
    items: shuffledIdxs.map((i) => options[i]),
    displayToOriginal: shuffledIdxs.reduce((m, origIdx, displayIdx) => {
      m[displayIdx] = origIdx;
      return m;
    }, {}),
  };
};

/* ========== media helpers (inline) ========== */
const URL_RE = /(https?:\/\/[^\s"'<>]+)/g;

const isMediaUrl = (u = "") => {
  const low = u.toLowerCase();
  return (
    low.includes("youtube.com/watch?v=") ||
    low.includes("youtu.be/") ||
    low.includes("aparat.com/v/") ||
    /\.(mp3|wav|ogg|mp4|webm|ogv)(\?|#|$)/i.test(low)
  );
};

const MediaEl = ({ src }) => {
  const low = (src || "").toLowerCase();
  if (low.includes("youtube.com/watch?v=") || low.includes("youtu.be/")) {
    let id = "";
    try {
      if (low.includes("watch?v="))
        id = new URL(src).searchParams.get("v") || "";
      else id = src.split("/").pop() || "";
    } catch {}
    return id ? (
      <Box
        sx={{
          position: "relative",
          pt: "56.25%",
          borderRadius: 2,
          overflow: "hidden",
          my: 1.5,
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
  if (low.includes("aparat.com/v/")) {
    const id = src.split("/v/")[1]?.split(/[?&#]/)[0] || "";
    return id ? (
      <Box
        sx={{
          position: "relative",
          pt: "56.25%",
          borderRadius: 2,
          overflow: "hidden",
          my: 1.5,
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
  if (/\.(mp3|wav|ogg)(\?|#|$)/i.test(low)) {
    return (
      <audio src={src} controls style={{ width: "100%", margin: "12px 0" }} />
    );
  }
  if (/\.(mp4|webm|ogv)(\?|#|$)/i.test(low)) {
    return (
      <video
        src={src}
        controls
        style={{ width: "100%", borderRadius: 8, margin: "12px 0" }}
      />
    );
  }
  return null;
};

/* متن ساده + مدیا inline */
const InlineTextWithMedia = ({ text = "" }) => {
  if (!text) return null;
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((chunk, i) => {
        // even indexes = متن، odd = url
        if (i % 2 === 0) return chunk ? <span key={i}>{chunk}</span> : null;
        const url = chunk.replace(/[),.;]+$/, "");
        return isMediaUrl(url) ? (
          <MediaEl key={i} src={url} />
        ) : (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {url}
          </a>
        );
      })}
    </>
  );
};

/* HTML + مدیا inline (جایگزینی a[href] و URL خام داخل متن‌ها) */
const HtmlInlineMedia = ({ html = "" }) => {
  const content = useMemo(() => {
    if (!html) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild;

    const walk = (node, key) => {
      if (node.nodeType === 3) {
        // text node → ممکنه URL خام داشته باشه
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

      // a[href] که مدیا است → خود پلیر
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

      // فقط تگ‌های متداول رو نگه داریم
      const allowed = new Set([
        "p",
        "strong",
        "em",
        "u",
        "br",
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

    return Array.from(root.childNodes).map((n, i) => walk(n, `n-${i}`));
  }, [html]);

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
      {content}
    </Box>
  );
};

/* =============================== PAGE =============================== */
export default function StepPage() {
  const { id: courseId, flatStepIdx: idx } = useParams();
  const flatStepIdx = Number(idx);
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(null);
  const [meta, setMeta] = useState({});
  const [learning, setLearning] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answer, setAnswer] = useState("");
  const [matchMap, setMatchMap] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [displayToOriginal, setDisplayToOriginal] = useState({});
  const [shuffledRights, setShuffledRights] = useState([]);

  const [reviewModal, setReviewModal] = useState(false);
  const pendingQueue = useRef([]);
  const redirected = useRef(false);

  const [rateOpen, setRateOpen] = useState(false);
  const [unitRate, setUnitRate] = useState(0);
  const [unitComment, setUnitComment] = useState("");
  const blockAutoNextRef = useRef(false);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueReason, setIssueReason] = useState("اشتباه محتوایی");
  const [issueText, setIssueText] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    text: "",
    type: "success",
  });

  /* -------- fetch course + learning -------- */
  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) {
      router.replace("/");
      return;
    }
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch("/api/students/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      }).then((r) => r.json()),
    ]).then(([c, lRes]) => {
      setCourse(c);
      const l = (lRes.learning || []).find((v) => v.courseId === courseId) || {
        courseId,
        progress: 0,
        correct: [],
        wrongByUnit: {},
        reviewQueue: [],
        xp: 0,
      };
      setLearning(l);

      if (
        l.reviewQueue?.length &&
        l.reviewQueue[0] !== flatStepIdx &&
        !redirected.current
      ) {
        redirected.current = true;
        router.replace(`/course/${courseId}/step/${l.reviewQueue[0]}`);
        return;
      }

      let counter = 0,
        found = null,
        m = {};
      c.sections.forEach((sec, sIdx) =>
        sec.units.forEach((u, uIdx) =>
          u.steps.forEach((st, stIdx) => {
            if (counter === flatStepIdx) {
              found = st;
              m = { sIdx, uIdx, stIdx, unit: u };
            }
            counter++;
          })
        )
      );
      setStep(found);
      setMeta(m);
      setLoading(false);
    });
  }, [courseId, flatStepIdx, router]);

  /* -------- shuffle on step load -------- */
  useEffect(() => {
    if (!step) return;
    blockAutoNextRef.current = false;

    if (
      ["multiple-choice", "fill-in-the-blank", "multi-answer"].includes(
        step.type
      )
    ) {
      const { items, displayToOriginal } = makeShuffledOptions(
        step.options || []
      );
      setShuffledOptions(items);
      setDisplayToOriginal(displayToOriginal);
      setAnswer("");
      setShowResult(false);
      setIsCorrect(null);
    } else {
      setShuffledOptions([]);
      setDisplayToOriginal({});
    }

    if (step.type === "matching") {
      const rights = (step.pairs || []).map((p) => p.right);
      setShuffledRights(shuffle(rights));
      setMatchMap({});
      setShowResult(false);
      setIsCorrect(null);
    } else {
      setShuffledRights([]);
    }
  }, [step]);

  /* -------- helpers -------- */
  const unitTotal = meta.unit?.steps?.length || 1;
  const inUnitIdx = meta.stIdx || 0;
  const unitProgress = Math.floor((inUnitIdx / unitTotal) * 100);

  const totalSteps =
    course?.sections.reduce(
      (a, s) => a + s.units.reduce((b, u) => b + u.steps.length, 0),
      0
    ) ?? 0;

  const isLastStep = flatStepIdx === totalSteps - 1;
  const isLastOfUnit = inUnitIdx === unitTotal - 1;
  const unitKey = `${meta.sIdx}-${meta.uIdx}`;

  const persist = (payload) =>
    fetch("/api/students/learning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: localStorage.getItem("student_mobile"),
        courseId,
        ...payload,
      }),
    });

  useEffect(() => {
    if (!reviewModal) return;
    const t = setTimeout(() => {
      setReviewModal(false);
      if (pendingQueue.current.length)
        router.replace(`/course/${courseId}/step/${pendingQueue.current[0]}`);
    }, 1400);
    return () => clearTimeout(t);
  }, [reviewModal, courseId, router]);

  const goToNext = (queue) => {
    if (blockAutoNextRef.current) return;
    if (queue.length) router.replace(`/course/${courseId}/step/${queue[0]}`);
    else if (learning.progress < totalSteps)
      router.replace(`/course/${courseId}/step/${learning.progress}`);
    else router.replace(`/roadmap/${courseId}`);
  };

  const evaluate = async ({ ok, awardXp }) => {
    let {
      correct = [],
      wrongByUnit = {},
      reviewQueue = [],
      progress,
    } = learning;
    const inReview = reviewQueue.includes(flatStepIdx);

    if (ok) {
      wrongByUnit[unitKey] = (wrongByUnit[unitKey] || []).filter(
        (i) => i !== flatStepIdx
      );
      reviewQueue = reviewQueue.filter((i) => i !== flatStepIdx);
      if (!correct.includes(flatStepIdx)) correct.push(flatStepIdx);
    } else if (!inReview) {
      wrongByUnit[unitKey] = wrongByUnit[unitKey] || [];
      if (!wrongByUnit[unitKey].includes(flatStepIdx))
        wrongByUnit[unitKey].push(flatStepIdx);
    }

    let openedRate = false;

    if (isLastOfUnit && !inReview) {
      reviewQueue = [...reviewQueue, ...(wrongByUnit[unitKey] || [])];
      wrongByUnit[unitKey] = [];
      if (reviewQueue.length) {
        pendingQueue.current = reviewQueue;
        setReviewModal(true);
        blockAutoNextRef.current = true;
      } else {
        setRateOpen(true);
        blockAutoNextRef.current = true;
        openedRate = true;
      }
    }
    if (inReview && reviewQueue.length === 0) {
      setRateOpen(true);
      blockAutoNextRef.current = true;
      openedRate = true;
    }

    const newProgress = inReview
      ? progress
      : Math.max(progress, flatStepIdx + 1);
    await persist({
      progress: newProgress,
      correct,
      wrongByUnit,
      reviewQueue,
      deltaXp: awardXp ? 1 : 0,
      finished: isLastStep,
    });

    learning.progress = newProgress;
    learning.reviewQueue = reviewQueue;
    return { openedRate };
  };

  const submitChoice = async () => {
    const origIdx = displayToOriginal[Number(answer)];
    let ok = false;
    if (step.type === "multi-answer") {
      ok = (step.correctIndexes || []).includes(origIdx);
    } else {
      ok =
        step.correctIndex === origIdx ||
        step.options?.[step.correctIndex] === shuffledOptions[Number(answer)];
    }
    setShowResult(true);
    setIsCorrect(ok);
    const { openedRate } = await evaluate({ ok, awardXp: ok });
    if (ok && !openedRate)
      setTimeout(() => goToNext(learning.reviewQueue), 800);
  };

  const submitMatch = async () => {
    const ok = (step.pairs || []).every(
      (p, i) => String(matchMap[i] ?? "") === String(p.right)
    );
    setShowResult(true);
    setIsCorrect(ok);
    const { openedRate } = await evaluate({ ok, awardXp: ok });
    if (ok && !openedRate)
      setTimeout(() => goToNext(learning.reviewQueue), 800);
  };

  const nextExplanation = async () => {
    const { openedRate } = await evaluate({ ok: true, awardXp: false });
    if (!openedRate) goToNext(learning.reviewQueue);
  };

  const submitIssue = async () => {
    try {
      await fetch("/api/feedback/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: localStorage.getItem("student_mobile"),
          courseId,
          globalStepIndex: flatStepIdx,
          stepType: step?.type || "",
          message: issueText,
          reason: issueReason,
        }),
      });
      await persist({ deltaXp: 1 });
      setSnack({
        open: true,
        text: "گزارش شما ثبت شد. ممنون! 🌟",
        type: "success",
      });
      setIssueOpen(false);
      setIssueText("");
    } catch {
      setSnack({
        open: true,
        text: "ثبت گزارش با خطا مواجه شد.",
        type: "error",
      });
    }
  };

  const submitUnitRate = async () => {
    try {
      await fetch("/api/feedback/unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: localStorage.getItem("student_mobile"),
          courseId,
          sectionIdx: meta.sIdx,
          unitIdx: meta.uIdx,
          rating: unitRate,
          comment: unitRate <= 2 ? unitComment : "",
        }),
      });
      await persist({ deltaXp: 1 });
      setSnack({
        open: true,
        text: "بازخورد یونیت ثبت شد 💚",
        type: "success",
      });
      setRateOpen(false);
      setUnitRate(0);
      setUnitComment("");
      blockAutoNextRef.current = false;
      goToNext(learning.reviewQueue || []);
    } catch {
      setSnack({
        open: true,
        text: "ثبت بازخورد با خطا مواجه شد.",
        type: "error",
      });
    }
  };

  if (loading)
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box maxWidth="sm" mx="auto" mt={5}>
      {/* progress */}
      <Box mb={2}>
        <LinearProgress
          variant="determinate"
          value={unitProgress}
          sx={{
            height: 10,
            borderRadius: 5,
            "& .MuiLinearProgress-bar": { borderRadius: 5 },
          }}
        />
        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          fontWeight="bold"
          mt={0.5}
        >
          {unitProgress}٪ از یونیت
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 4, position: "relative" }}>
        <Tooltip title="گزارش اشکال این سؤال">
          <IconButton
            onClick={() => setIssueOpen(true)}
            size="small"
            sx={{
              position: "absolute",
              top: 20,
              right: 40,
              bgcolor: "rgba(36,119,243,0.08)",
              border: "1px solid rgba(36,119,243,0.25)",
              "&:hover": { bgcolor: "rgba(36,119,243,0.16)" },
            }}
            aria-label="report-issue"
          >
            <BugReportOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Typography variant="h6" mb={2} fontWeight="bold" color="#2477F3">
          {step.title}
        </Typography>

        {/* explanation → HTML + media inline */}
        {step.type === "explanation" && (
          <>
            <HtmlInlineMedia html={step.content || ""} />
            <Button
              variant="contained"
              sx={{ mt: 3, fontWeight: "bold" }}
              onClick={nextExplanation}
            >
              مرحله بعد
            </Button>
          </>
        )}

        {/* choice / fill / multi → TEXT + media inline */}
        {["multiple-choice", "fill-in-the-blank", "multi-answer"].includes(
          step.type
        ) && (
          <>
            {step.text && (
              <Box mb={2} sx={{ "&, & p": { fontSize: 17, lineHeight: 1.9 } }}>
                <InlineTextWithMedia text={step.text} />
              </Box>
            )}
            <Box display="flex" flexDirection="column" gap={1}>
              {(shuffledOptions || []).map((opt, i) => (
                <Button
                  key={i}
                  variant={answer === String(i) ? "contained" : "outlined"}
                  disabled={showResult}
                  onClick={() => setAnswer(String(i))}
                  sx={{ justifyContent: "flex-end", fontWeight: "bold" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
            {!showResult && (
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2, fontWeight: "bold" }}
                disabled={answer === ""}
                onClick={submitChoice}
              >
                ثبت پاسخ
              </Button>
            )}
            {showResult && (
              <>
                <Typography
                  mt={2}
                  fontWeight="bold"
                  color={isCorrect ? "success.main" : "error"}
                >
                  {isCorrect
                    ? step.feedbackCorrect || "پاسخ صحیح!"
                    : step.feedbackWrong || "پاسخ اشتباه"}
                </Typography>
                {!isCorrect && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => goToNext(learning.reviewQueue)}
                  >
                    مرحله بعد
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {/* matching → TEXT + media inline */}
        {step.type === "matching" && (
          <>
            {step.matchingQuestion && (
              <Box mb={2} sx={{ "&, & p": { fontSize: 17, lineHeight: 1.9 } }}>
                <InlineTextWithMedia text={step.matchingQuestion} />
              </Box>
            )}
            {(step.pairs || []).map((p, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={{ minWidth: 140, fontWeight: "bold" }}>
                  {p.left}
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={matchMap[i] ?? ""}
                    disabled={showResult}
                    onChange={(e) =>
                      setMatchMap((m) => ({ ...m, [i]: e.target.value }))
                    }
                  >
                    {(shuffledRights || []).map((r, j) => (
                      <MenuItem key={j} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            ))}
            {!showResult && (
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2, fontWeight: "bold" }}
                disabled={
                  Object.keys(matchMap).length !== (step.pairs || []).length
                }
                onClick={submitMatch}
              >
                ثبت تطبیق
              </Button>
            )}
            {showResult && (
              <>
                <Typography
                  mt={2}
                  fontWeight="bold"
                  color={isCorrect ? "success.main" : "error"}
                >
                  {isCorrect
                    ? "عالی! همه جفت‌ها درست بود."
                    : "برخی تطبیق‌ها نادرست است."}
                </Typography>
                {!isCorrect && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => goToNext(learning.reviewQueue)}
                  >
                    مرحله بعد
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </Paper>

      <Box mt={2} textAlign="center">
        <Button
          variant="text"
          onClick={() => router.replace(`/roadmap/${courseId}`)}
        >
          بازگشت به نقشه راه
        </Button>
      </Box>

      {/* مرور */}
      <Dialog open={reviewModal}>
        <DialogTitle fontWeight={900}>مرور اشتباهات</DialogTitle>
        <DialogContent>
          <Typography>یونیت تمام شد؛ بریم سراغ سؤال‌های اشتباه 🤓</Typography>
        </DialogContent>
      </Dialog>

      {/* گزارش ایراد سؤال */}
      <Dialog
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>گزارش اشکال این سؤال</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select
              size="small"
              value={issueReason}
              onChange={(e) => setIssueReason(e.target.value)}
            >
              <MenuItem value="اشتباه محتوایی">اشتباه محتوایی</MenuItem>
              <MenuItem value="پیشنهاد محتوایی">پیشنهاد محتوایی</MenuItem>
              <MenuItem value="ابهام در صورت سؤال">ابهام در صورت سؤال</MenuItem>
              <MenuItem value="پاسخ صحیح اشتباه">پاسخ صحیح اشتباه</MenuItem>
              <MenuItem value="مشکل فنی/نمایش">مشکل فنی/نمایش</MenuItem>
              <MenuItem value="سایر">سایر</MenuItem>
            </Select>
          </FormControl>
          <TextField
            multiline
            minRows={3}
            fullWidth
            sx={{ mt: 2 }}
            placeholder="توضیح اختیاری…"
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIssueOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={submitIssue}>
            ارسال
          </Button>
        </DialogActions>
      </Dialog>

      {/* امتیازدهی یونیت */}
      <Dialog
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>تجربه‌ت از این یونیت چطور بود؟</DialogTitle>
        <DialogContent>
          <Stack alignItems="center" sx={{ my: 1 }}>
            <Rating
              value={unitRate}
              onChange={(_, v) => setUnitRate(v)}
              size="large"
            />
          </Stack>
          {unitRate > 0 && unitRate <= 2 && (
            <TextField
              multiline
              minRows={3}
              fullWidth
              sx={{ mt: 1 }}
              placeholder="اگر مورد خاصی اذیت‌ت کرد بنویس (اختیاری)"
              value={unitComment}
              onChange={(e) => setUnitComment(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setRateOpen(false);
              blockAutoNextRef.current = false;
            }}
          >
            بعداً
          </Button>
          <Button
            variant="contained"
            disabled={unitRate === 0}
            onClick={submitUnitRate}
          >
            ثبت
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.type} variant="filled">
          {snack.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
