// ===============================
// FILE: app/course/[id]/step/[flatStepIdx]/page.jsx
// ===============================
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
  IconButton,
  Tooltip,
  TextField,
  Rating,
  Snackbar,
  Alert,
  DialogActions,
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

const InlineTextWithMedia = ({ text = "" }) => {
  if (!text) return null;
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((chunk, i) => {
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

const HtmlInlineMedia = ({ html = "" }) => {
  const content = useMemo(() => {
    if (!html) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild;

    const walk = (node, key) => {
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

/* =============================== Helpers =============================== */
function flattenCourse(course) {
  const flat = [];
  let idx = 0;
  course.sections.forEach((sec, sIdx) =>
    sec.units.forEach((u, uIdx) => {
      const unitId = (u._id || `${sIdx}-${uIdx}`).toString();
      u.steps.forEach((st, stIdx) => {
        const stepId = (st._id || `${sIdx}-${uIdx}-${stIdx}`).toString();
        flat.push({
          index: idx++,
          stepId,
          unitId,
          sIdx,
          uIdx,
          stIdx,
          step: st,
          unit: u,
        });
      });
    })
  );
  return flat;
}

const arrayToSet = (arr) => new Set(Array.isArray(arr) ? arr : []);

const nextIndexFromStateLocal = (lrn, flatLocal, indexByIdLocal) => {
  if (lrn?.reviewQueueIds?.length) {
    const id = lrn.reviewQueueIds[0];
    const idx = indexByIdLocal[id];
    if (typeof idx === "number") return idx;
  }
  if (Array.isArray(lrn?.doneIds) && lrn.doneIds.length) {
    const done = new Set(lrn.doneIds);
    for (let i = 0; i < flatLocal.length; i++) {
      if (!done.has(flatLocal[i].stepId)) return i;
    }
    return flatLocal.length;
  }
  if (Number.isFinite(lrn?.progress)) {
    return Math.min(Math.max(0, lnr.progress), flatLocal.length);
  }
  return 0;
};

export default function StepPage() {
  const { id: courseId, flatStepIdx: idxStr } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [flat, setFlat] = useState([]);
  const [indexById, setIndexById] = useState({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState(null);
  const [meta, setMeta] = useState({
    sIdx: 0,
    uIdx: 0,
    stIdx: 0,
    unit: null,
    unitId: "",
    stepId: "",
  });

  const [learning, setLearning] = useState(null);
  const [loading, setLoading] = useState(true);

  // local UI states
  const [answer, setAnswer] = useState("");
  const [matchMap, setMatchMap] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [displayToOriginal, setDisplayToOriginal] = useState({});
  const [shuffledRights, setShuffledRights] = useState([]);

  const [reviewModal, setReviewModal] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [unitRate, setUnitRate] = useState(0);
  const [unitComment, setUnitComment] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueReason, setIssueReason] = useState("اشتباه محتوایی");
  const [issueText, setIssueText] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    text: "",
    type: "success",
  });

  // صف فعلی مرور برای جلوگیری از race با setState
  const pendingQueueRef = useRef([]);

  /* -------- persist helper -------- */
  const persist = async (payload) => {
    await fetch("/api/students/learning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: localStorage.getItem("student_mobile"),
        courseId,
        ...payload,
      }),
    });
  };

  /* -------- fetch course + learning (فقط به courseId وابسته!) -------- */
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
    ]).then(async ([c, lRes]) => {
      setCourse(c);

      const flat_ = flattenCourse(c);
      setFlat(flat_);
      const idxMap = flat_.reduce((m, n) => ((m[n.stepId] = n.index), m), {});
      setIndexById(idxMap);

      const raw = (lRes.learning || []).find(
        (v) => v.courseId === courseId
      ) || {
        courseId,
        doneIds: [],
        correctIds: [],
        wrongByUnitIds: {},
        reviewQueueIds: [],
        carryOverIds: [],
        progress: 0,
        correct: [],
        wrongByUnit: {},
        reviewQueue: [],
        xp: 0,
        finished: false,
      };

      // مهاجرت اندیس→شناسه
      const idByIndex = flat_.reduce(
        (m, n) => ((m[n.index] = n.stepId), m),
        {}
      );
      const migrated = { ...raw };
      let changed = false;

      if (
        (!migrated.correctIds || !Array.isArray(migrated.correctIds)) &&
        Array.isArray(migrated.correct)
      ) {
        const ids = migrated.correct.map((i) => idByIndex[i]).filter(Boolean);
        migrated.correctIds = Array.from(
          new Set([...(migrated.correctIds || []), ...ids])
        );
        changed = true;
      }
      if (!Array.isArray(migrated.correctIds)) migrated.correctIds = [];

      if (
        (!migrated.reviewQueueIds || !Array.isArray(migrated.reviewQueueIds)) &&
        Array.isArray(migrated.reviewQueue)
      ) {
        const ids = migrated.reviewQueue
          .map((i) => idByIndex[i])
          .filter(Boolean);
        migrated.reviewQueueIds = Array.from(
          new Set([...(migrated.reviewQueueIds || []), ...ids])
        );
        changed = true;
      }
      if (!Array.isArray(migrated.reviewQueueIds)) migrated.reviewQueueIds = [];

      if (!migrated.wrongByUnitIds && migrated.wrongByUnit) {
        const obj = {};
        Object.entries(migrated.wrongByUnit).forEach(([uKey, arr]) => {
          const ids = (arr || []).map((i) => idByIndex[i]).filter(Boolean);
          obj[uKey] = Array.from(new Set(ids));
        });
        migrated.wrongByUnitIds = obj;
        changed = true;
      }
      if (!migrated.wrongByUnitIds) migrated.wrongByUnitIds = {};

      if (!Array.isArray(migrated.doneIds)) migrated.doneIds = [];
      if (!Array.isArray(migrated.carryOverIds)) migrated.carryOverIds = [];

      if (changed) {
        await persist({
          doneIds: migrated.doneIds,
          correctIds: migrated.correctIds,
          wrongByUnitIds: migrated.wrongByUnitIds,
          reviewQueueIds: migrated.reviewQueueIds,
          carryOverIds: migrated.carryOverIds,
        });
      }

      setLearning(migrated);

      const requestedIdx = Number(idxStr);
      const nextIdx = nextIndexFromStateLocal(migrated, flat_, idxMap);
      const forcedReviewIdx = migrated.reviewQueueIds?.length
        ? idxMap[migrated.reviewQueueIds[0]]
        : undefined;

      let targetIdx;
      if (typeof forcedReviewIdx === "number") targetIdx = forcedReviewIdx;
      else if (
        Number.isFinite(requestedIdx) &&
        requestedIdx >= 0 &&
        requestedIdx <= flat_.length
      )
        targetIdx = requestedIdx;
      else targetIdx = nextIdx;

      if (targetIdx >= flat_.length) {
        router.replace(`/roadmap/${courseId}`);
        return;
      }

      const node = flat_[targetIdx];
      setCurrentIndex(node.index);
      setStep(node.step);
      setMeta({
        sIdx: node.sIdx,
        uIdx: node.uIdx,
        stIdx: node.stIdx,
        unit: node.unit,
        unitId: node.unitId,
        stepId: node.stepId,
      });

      if (Number.isFinite(requestedIdx) && targetIdx !== requestedIdx) {
        router.replace(`/course/${courseId}/step/${targetIdx}`);
      }

      setLoading(false);
    });
  }, [courseId, router]);

  /* -------- sync local index when URL param changes -------- */
  useEffect(() => {
    const p = Number(idxStr);
    if (!loading && flat.length && Number.isFinite(p)) {
      const clamped = Math.max(0, Math.min(p, flat.length - 1));
      if (clamped !== currentIndex) setCurrentIndex(clamped);
    }
  }, [idxStr, loading, flat, currentIndex]);

  /* -------- shuffle on step load -------- */
  const [multiSelected, setMultiSelected] = useState(new Set());
  useEffect(() => {
    if (!step) return;

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

    if (step.type === "multi-answer") setMultiSelected(new Set());
  }, [step]);

  /* -------- computed UI helpers -------- */
  const unitTotal = meta.unit?.steps?.length || 1;
  const inUnitIdx = meta.stIdx || 0;
  const unitProgress = Math.floor((inUnitIdx / unitTotal) * 100);

  /* -------- queue modal auto-close -------- */
  useEffect(() => {
    if (!reviewModal) return;
    const t = setTimeout(() => setReviewModal(false), 1200);
    return () => clearTimeout(t);
  }, [reviewModal]);

  /* -------- goToNext (stateOverride اختیاری) -------- */
  const goToNext = (queueIds, stateOverride) => {
    const lrn = stateOverride || learning;
    let targetIdx;

    if (queueIds?.length) {
      const firstId = queueIds[0];
      targetIdx = indexById[firstId];
    } else if (lrn?.reviewQueueIds?.length) {
      const id = lrn.reviewQueueIds[0];
      targetIdx = indexById[id];
    } else {
      const done = arrayToSet(lrn?.doneIds);
      targetIdx = flat.findIndex((n) => !done.has(n.stepId));
      if (targetIdx === -1) targetIdx = flat.length;
    }

    if (typeof targetIdx !== "number") targetIdx = currentIndex + 1;

    if (targetIdx >= flat.length) router.replace(`/roadmap/${courseId}`);
    else router.replace(`/course/${courseId}/step/${targetIdx}`);
  };

  /* -------- evaluate (مرور قبل از نظرسنجی + بازگشت state) -------- */
  const evaluate = async ({ ok, awardXp, treatExplanation = false }) => {
    const l = { ...(learning || {}) };

    const done = new Set(l.doneIds || []);
    const correctSet = new Set(l.correctIds || []);
    const carryOver = new Set(l.carryOverIds || []);
    const reviewQ = [...(l.reviewQueueIds || [])];
    const wbu = { ...(l.wrongByUnitIds || {}) };

    const stepId = meta.stepId;
    const unitId = (
      meta.unit?._id ||
      meta.unitId ||
      `${meta.sIdx}-${meta.uIdx}`
    ).toString();

    const inReview = reviewQ.includes(stepId);

    // هر گام دیده‌شده به done می‌رود
    if (!done.has(stepId)) done.add(stepId);

    if (!treatExplanation) {
      if (ok) {
        correctSet.add(stepId);
        if (Array.isArray(wbu[unitId]))
          wbu[unitId] = wbu[unitId].filter((id) => id !== stepId);
        for (let i = reviewQ.length - 1; i >= 0; i--)
          if (reviewQ[i] === stepId) reviewQ.splice(i, 1);
        carryOver.delete(stepId);
      } else {
        if (inReview) {
          for (let i = reviewQ.length - 1; i >= 0; i--)
            if (reviewQ[i] === stepId) reviewQ.splice(i, 1);
          carryOver.add(stepId);
        } else {
          const arr = Array.isArray(wbu[unitId]) ? wbu[unitId] : [];
          if (!arr.includes(stepId)) arr.push(stepId);
          wbu[unitId] = arr;
        }
      }
    }

    const isLastOfUnit = inUnitIdx === unitTotal - 1;

    if (isLastOfUnit && !inReview) {
      const unitWrongs = Array.isArray(wbu[unitId]) ? wbu[unitId] : [];
      const newQueue = Array.from(
        new Set([...reviewQ, ...unitWrongs, ...Array.from(carryOver)])
      );
      l.reviewQueueIds = newQueue;
      wbu[unitId] = [];
      l.carryOverIds = [];
    } else {
      l.reviewQueueIds = reviewQ;
      l.carryOverIds = Array.from(carryOver);
    }

    const newProgress = Math.max(l.progress || 0, currentIndex + 1);

    const nextLearning = {
      ...l,
      doneIds: Array.from(done),
      correctIds: Array.from(correctSet),
      wrongByUnitIds: wbu,
      progress: newProgress,
      finished: currentIndex === flat.length - 1,
    };

    setLearning(nextLearning);
    pendingQueueRef.current = nextLearning.reviewQueueIds;

    await persist({
      doneIds: nextLearning.doneIds,
      correctIds: nextLearning.correctIds,
      wrongByUnitIds: nextLearning.wrongByUnitIds,
      reviewQueueIds: nextLearning.reviewQueueIds,
      carryOverIds: nextLearning.carryOverIds,
      progress: nextLearning.progress,
      finished: nextLearning.finished,
      deltaXp: awardXp ? 1 : 0,
    });

    // Side-effects UI
    let openedRate = false;
    if (isLastOfUnit && !inReview) {
      if (nextLearning.reviewQueueIds.length) {
        setReviewModal(true);
        setTimeout(() => {
          setReviewModal(false);
          goToNext(nextLearning.reviewQueueIds, nextLearning);
        }, 800);
      } else {
        setRateOpen(true);
        openedRate = true;
      }
    } else if (inReview && nextLearning.reviewQueueIds.length === 0) {
      setRateOpen(true);
      openedRate = true;
    }

    return {
      openedRate,
      reviewQueueIds: nextLearning.reviewQueueIds,
      nextLearning,
    };
  };

  /* -------- submit handlers -------- */
  const submitChoice = async () => {
    let ok = false;
    if (step.type === "multi-answer") {
      const selectedOriginal = Array.from(multiSelected)
        .map((dIdx) => displayToOriginal[Number(dIdx)])
        .filter((x) => Number.isFinite(x))
        .sort((a, b) => a - b);
      const expected = [...(step.correctIndexes || [])].sort((a, b) => a - b);
      ok =
        selectedOriginal.length > 0 &&
        JSON.stringify(selectedOriginal) === JSON.stringify(expected);
    } else {
      const origIdx = displayToOriginal[Number(answer)];
      ok =
        step.correctIndex === origIdx ||
        step.options?.[step.correctIndex] === shuffledOptions[Number(answer)];
    }

    setShowResult(true);
    setIsCorrect(ok);
    const res = await evaluate({ ok, awardXp: ok });
    if (ok && !res.openedRate)
      setTimeout(() => goToNext(res.reviewQueueIds, res.nextLearning), 700);
  };

  const submitMatch = async () => {
    const ok = (step.pairs || []).every(
      (p, i) => String(matchMap[i] ?? "") === String(p.right)
    );
    setShowResult(true);
    setIsCorrect(ok);
    const res = await evaluate({ ok, awardXp: ok });
    if (ok && !res.openedRate)
      setTimeout(() => goToNext(res.reviewQueueIds, res.nextLearning), 700);
  };

  const nextExplanation = async () => {
    const res = await evaluate({
      ok: true,
      awardXp: false,
      treatExplanation: true,
    });
    if (!res.openedRate) goToNext(res.reviewQueueIds, res.nextLearning);
  };

  /* -------- feedbacks -------- */
  const submitIssue = async () => {
    try {
      await fetch("/api/feedback/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: localStorage.getItem("student_mobile"),
          courseId,
          globalStepIndex: currentIndex,
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
      goToNext(pendingQueueRef.current);
    } catch {
      setSnack({
        open: true,
        text: "ثبت بازخورد با خطا مواجه شد.",
        type: "error",
      });
    }
  };

  /* -------- keep step/meta in sync -------- */
  useEffect(() => {
    const node = flat[currentIndex];
    if (!node) return;
    setStep(node.step);
    setMeta({
      sIdx: node.sIdx,
      uIdx: node.uIdx,
      stIdx: node.stIdx,
      unit: node.unit,
      unitId: node.unitId,
      stepId: node.stepId,
    });
  }, [currentIndex, flat]);

  /* -------- loading UI -------- */
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

        {/* explanation */}
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

        {/* choice / fill / multi */}
        {["multiple-choice", "fill-in-the-blank", "multi-answer"].includes(
          step.type
        ) && (
          <>
            {step.text && (
              <Box mb={2} sx={{ "&, & p": { fontSize: 17, lineHeight: 1.9 } }}>
                <InlineTextWithMedia text={step.text} />
              </Box>
            )}

            {step.type === "multi-answer" ? (
              <Box display="flex" flexDirection="column" gap={1}>
                {(shuffledOptions || []).map((opt, i) => {
                  const key = String(i);
                  const active = multiSelected.has(key);
                  return (
                    <Button
                      key={i}
                      variant={active ? "contained" : "outlined"}
                      disabled={showResult}
                      onClick={() =>
                        setMultiSelected((prev) => {
                          const n = new Set(prev);
                          n.has(key) ? n.delete(key) : n.add(key);
                          return n;
                        })
                      }
                      sx={{ justifyContent: "flex-end", fontWeight: "bold" }}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </Box>
            ) : (
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
            )}

            {!showResult && (
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2, fontWeight: "bold" }}
                disabled={
                  step.type === "multi-answer"
                    ? multiSelected.size === 0
                    : answer === ""
                }
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
                    onClick={() => goToNext(pendingQueueRef.current)}
                  >
                    مرحله بعد
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {/* matching */}
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
                    onClick={() => goToNext(pendingQueueRef.current)}
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
          <Button onClick={() => setRateOpen(false)}>بعداً</Button>
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
