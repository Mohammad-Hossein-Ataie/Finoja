"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
} from "@mui/material";

/* ─────────────────────────────────────────────── */
export default function StepPage() {
  /* ----- routing params ----- */
  const { id: courseId, flatStepIdx: idx } = useParams();
  const flatStepIdx = Number(idx);
  const router      = useRouter();

  /* ----- states ----- */
  const [course , setCourse ] = useState(null);
  const [step   , setStep   ] = useState(null);
  const [meta   , setMeta   ] = useState({});
  const [learning, setLearning] = useState(null);
  const [loading , setLoading ] = useState(true);

  const [answer   , setAnswer   ] = useState("");
  const [matchMap , setMatchMap ] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect , setIsCorrect ] = useState(null);

  const [reviewModal, setReviewModal] = useState(false);
  const pendingQueue  = useRef([]);
  const redirected    = useRef(false);

  /* ---------- fetch course + learning ----------- */
  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) { router.replace("/"); return; }

    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch("/api/students/learning", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ mobile }),
      }).then((r) => r.json()),
    ]).then(([c , lRes]) => {
      setCourse(c);

      const l = (lRes.learning || []).find((v) => v.courseId === courseId) || {
        courseId, progress : 0, correct: [], wrongByUnit: {}, reviewQueue: [], xp: 0,
      };
      setLearning(l);

      /* اگر در صف مرور هستیم ولی روی سؤال دیگری، ریدایرکت کن */
      if (l.reviewQueue?.length && l.reviewQueue[0] !== flatStepIdx && !redirected.current) {
        redirected.current = true;
        router.replace(`/course/${courseId}/step/${l.reviewQueue[0]}`);
        return;
      }

      /* یافتن گام و متادیتا */
      let counter = 0, found = null, m = {};
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

  /* ---------- helpers ---------- */
  const unitTotal   = meta.unit?.steps?.length || 1;
  const inUnitIdx   = meta.stIdx || 0;
  const unitProgress= Math.floor((inUnitIdx / unitTotal) * 100);

  const totalSteps  =
    course?.sections.reduce(
      (a, s) => a + s.units.reduce((b, u) => b + u.steps.length, 0),
      0
    ) ?? 0;

  const isLastStep   = flatStepIdx === totalSteps - 1;
  const isLastOfUnit = inUnitIdx   === unitTotal - 1;
  const unitKey      = `${meta.sIdx}-${meta.uIdx}`;

  /* ---------- API helper ---------- */
  const persist = (payload) =>
    fetch("/api/students/learning", {
      method : "PUT",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        mobile : localStorage.getItem("student_mobile"),
        courseId,
        ...payload,
      }),
    });

  /* ---------- modal auto-close ---------- */
  useEffect(() => {
    if (!reviewModal) return;
    const t = setTimeout(() => {
      setReviewModal(false);
      if (pendingQueue.current.length)
        router.replace(`/course/${courseId}/step/${pendingQueue.current[0]}`);
    }, 1500);
    return () => clearTimeout(t);
  }, [reviewModal, courseId]);

  /* ---------- navigation ---------- */
  const goToNext = (queue) => {
    if (queue.length) {
      router.replace(`/course/${courseId}/step/${queue[0]}`);
    } else if (learning.progress < totalSteps) {
      router.replace(`/course/${courseId}/step/${learning.progress}`);
    } else {
      router.replace(`/roadmap/${courseId}`);
    }
  };

  /* ---------- evaluation & save ---------- */
  const evaluate = async ({ ok, awardXp }) => {
    let { correct = [], wrongByUnit = {}, reviewQueue = [], progress } = learning;
    const inReview = reviewQueue.includes(flatStepIdx);

    if (ok) {
      wrongByUnit[unitKey] = (wrongByUnit[unitKey] || []).filter((i) => i !== flatStepIdx);
      reviewQueue          = reviewQueue.filter((i) => i !== flatStepIdx);
      if (!correct.includes(flatStepIdx)) correct.push(flatStepIdx);
    } else if (!inReview) {
      wrongByUnit[unitKey] = wrongByUnit[unitKey] || [];
      if (!wrongByUnit[unitKey].includes(flatStepIdx))
        wrongByUnit[unitKey].push(flatStepIdx);
    }

    /* انتقال باقیمانده‌ها به صف مرور در پایان یونیت */
    if (isLastOfUnit && !inReview) {
      reviewQueue = [...reviewQueue, ...(wrongByUnit[unitKey] || [])];
      wrongByUnit[unitKey] = [];
      if (reviewQueue.length) { pendingQueue.current = reviewQueue; setReviewModal(true); }
    }

    /* پیشرفت */
    const newProgress = inReview ? progress : Math.max(progress, flatStepIdx + 1);

    await persist({
      progress   : newProgress,
      correct,
      wrongByUnit,
      reviewQueue,
      deltaXp    : awardXp ? 1 : 0,   // 👈 تنها وقتی awardXp=true
      finished   : isLastStep,
    });

    learning.progress   = newProgress;   // به‌روز برای ناوبری بعدی
    learning.reviewQueue= reviewQueue;
  };

  /* ---------- submit handlers ---------- */
  const submitChoice = async () => {
    const ok =
      step.type === "multi-answer"
        ? (step.correctIndexes || []).map(String).includes(answer)
        : String(step.correctIndex) === answer ||
          step.options?.[step.correctIndex] === answer;

    setShowResult(true);
    setIsCorrect(ok);
    await evaluate({ ok, awardXp: ok });          // توضیحی نیست؛ فقط پاسخ صحیح
    if (ok) setTimeout(() => goToNext(learning.reviewQueue), 800);
  };

  const submitMatch = async () => {
    const ok = (step.pairs || []).every(
      (p, i) => String(matchMap[i] ?? "") === String(p.right)
    );
    setShowResult(true);
    setIsCorrect(ok);
    await evaluate({ ok, awardXp: ok });
    if (ok) setTimeout(() => goToNext(learning.reviewQueue), 800);
  };

  const nextExplanation = async () => {
    await evaluate({ ok: true, awardXp: false }); // 👈 بدون XP
    goToNext(learning.reviewQueue);
  };

  /* ---------- guards ---------- */
  if (loading) return (
    <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  );

  /* ---------- UI ---------- */
  return (
    <Box maxWidth="sm" mx="auto" mt={5}>
      {/* progress bar */}
      <Box mb={2}>
        <LinearProgress
          variant="determinate"
          value={unitProgress}
          sx={{ height: 10, borderRadius: 5, "& .MuiLinearProgress-bar": { borderRadius: 5 } }}
        />
        <Typography variant="caption" textAlign="center" display="block" fontWeight="bold" mt={0.5}>
          {unitProgress}% از یونیت
        </Typography>
      </Box>

      {/* card */}
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h6" mb={2} fontWeight="bold" color="#2477F3">
          {step.title}
        </Typography>

        {/* explanation */}
        {step.type === "explanation" && (
          <>
            <div dangerouslySetInnerHTML={{ __html: step.content || "" }} />
            <Button variant="contained" sx={{ mt: 3, fontWeight: "bold" }} onClick={nextExplanation}>
              {isLastStep ? "پایان دوره" : "مرحله بعد"}
            </Button>
          </>
        )}

        {/* choice / fill / multi */}
        {["multiple-choice", "fill-in-the-blank", "multi-answer"].includes(step.type) && (
          <>
            {step.text && <Typography fontSize={17} mb={2}>{step.text}</Typography>}
            <Box display="flex" flexDirection="column" gap={1}>
              {(step.options || []).map((opt, i) => (
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
                <Typography mt={2} fontWeight="bold" color={isCorrect ? "success.main" : "error"}>
                  {isCorrect ? step.feedbackCorrect || "پاسخ صحیح!" : step.feedbackWrong || "پاسخ اشتباه"}
                </Typography>
                {!isCorrect && (
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => goToNext(learning.reviewQueue)}>
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
            {step.matchingQuestion && <Typography fontSize={17} mb={2}>{step.matchingQuestion}</Typography>}
            {(step.pairs || []).map((p, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Typography sx={{ minWidth: 140, fontWeight: "bold" }}>{p.left}</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={matchMap[i] ?? ""}
                    disabled={showResult}
                    onChange={(e) => setMatchMap((m) => ({ ...m, [i]: e.target.value }))}
                  >
                    {(step.pairs || []).map((pr, j) => (
                      <MenuItem key={j} value={pr.right}>{pr.right}</MenuItem>
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
                disabled={Object.keys(matchMap).length !== (step.pairs || []).length}
                onClick={submitMatch}
              >
                ثبت تطبیق
              </Button>
            )}
            {showResult && (
              <>
                <Typography mt={2} fontWeight="bold" color={isCorrect ? "success.main" : "error"}>
                  {isCorrect ? "عالی! همه جفت‌ها درست بود." : "برخی تطبیق‌ها نادرست است."}
                </Typography>
                {!isCorrect && (
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => goToNext(learning.reviewQueue)}>
                    مرحله بعد
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </Paper>

      {/* roadmap link */}
      <Box mt={2} textAlign="center">
        <Button variant="text" onClick={() => router.replace(`/roadmap/${courseId}`)}>
          بازگشت به نقشه راه
        </Button>
      </Box>

      {/* review modal */}
      <Dialog open={reviewModal}>
        <DialogTitle fontWeight={900}>مرور اشتباهات</DialogTitle>
        <DialogContent>
          <Typography>یونیت تمام شد؛ بریم سراغ سؤال‌های اشتباه 🤓</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
