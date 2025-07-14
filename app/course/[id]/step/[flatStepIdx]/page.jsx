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
} from "@mui/material";

/* ───────────────────────────────────────────── */
export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const flatStepIdx = Number(params.flatStepIdx);

  /* ───── States */
  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(null);
  const [stepMeta, setStepMeta] = useState({});
  const [learning, setLearning] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answer, setAnswer] = useState("");                // برای MC & fill & multi
  const [matchMap, setMatchMap] = useState({});            // برای matching
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const redirected = useRef(false);

  /* ───── fetch course + learning */
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
    ]).then(([courseRes, learningRes]) => {
      setCourse(courseRes);

      const l =
        (learningRes.learning || []).find((lr) => lr.courseId === courseId) ||
        {
          courseId,
          progress: 0,
          correct: [],
          wrongByUnit: {},
          reviewQueue: [],
          xp: 0,
        };
      setLearning(l);

      /* ← ریدایرکت به اولین آیتم صف مرور */
      if (
        l.reviewQueue?.length &&
        l.reviewQueue[0] !== flatStepIdx &&
        !redirected.current
      ) {
        redirected.current = true;
        router.replace(`/course/${courseId}/step/${l.reviewQueue[0]}`);
        return;
      }

      /* پیدا کردن گام جاری + متادیتا */
      let counter = 0,
        found = null,
        meta = {};
      courseRes.sections.forEach((section, secIdx) => {
        section.units.forEach((unit, unitIdx) => {
          unit.steps.forEach((st, stepIdx) => {
            if (counter === flatStepIdx) {
              found = st;
              meta = { secIdx, unitIdx, stepIdx, unit, section };
            }
            counter++;
          });
        });
      });
      setStep(found);
      setStepMeta(meta);
      setLoading(false);
    });
  }, [courseId, flatStepIdx, router]);

  /* ───── Helpers */
  const unitTotal = stepMeta?.unit?.steps?.length || 1;
  const inUnitIdx = stepMeta.stepIdx || 0;
  const unitProgress = Math.floor((inUnitIdx / unitTotal) * 100);

  const totalSteps =
    course?.sections.reduce(
      (acc, s) => acc + s.units.reduce((a, u) => a + u.steps.length, 0),
      0
    ) ?? 0;

  const isLastStep = flatStepIdx === totalSteps - 1;
  const isLastOfUnit = inUnitIdx === unitTotal - 1;
  const unitKey = `${stepMeta.secIdx}-${stepMeta.unitIdx}`;

  const persistLearning = async (payload) => {
    const mobile = localStorage.getItem("student_mobile");
    await fetch("/api/students/learning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, courseId, ...payload }),
    });
  };

  /* ───── Guards */
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

  if (!step)
    return (
      <Box p={4}>
        <Typography color="error" fontWeight="bold">
          گام یافت نشد
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.replace(`/roadmap/${courseId}`)}
        >
          بازگشت
        </Button>
      </Box>
    );

  if ((learning?.progress ?? 0) < flatStepIdx) {
    return (
      <Box p={4}>
        <Typography color="warning.main" fontWeight="bold">
          هنوز به این گام دسترسی ندارید
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.replace(`/roadmap/${courseId}`)}
        >
          بازگشت
        </Button>
      </Box>
    );
  }

  /* ───── Navigation after each step */
  const goNext = (reviewQueue) => {
    if (reviewQueue.length) {
      router.replace(`/course/${courseId}/step/${reviewQueue[0]}`);
    } else if (!isLastStep) {
      router.replace(`/course/${courseId}/step/${flatStepIdx + 1}`);
    } else {
      router.replace(`/roadmap/${courseId}`);
    }
  };

  /* ───── ذخیره + منطق درست/غلط مشترک */
  const handleEvaluation = async (isAnswerCorrect) => {
    let correctArr = [...(learning.correct || [])];
    let wrongByUnit = { ...(learning.wrongByUnit || {}) };
    let reviewQueue = [...(learning.reviewQueue || [])];
    let xp = learning.xp || 0;

    if (isAnswerCorrect) {
      if (wrongByUnit[unitKey])
        wrongByUnit[unitKey] = wrongByUnit[unitKey].filter(
          (idx) => idx !== flatStepIdx
        );
      reviewQueue = reviewQueue.filter((idx) => idx !== flatStepIdx);
      if (!correctArr.includes(flatStepIdx)) correctArr.push(flatStepIdx);
    } else {
      wrongByUnit[unitKey] = wrongByUnit[unitKey] || [];
      if (!wrongByUnit[unitKey].includes(flatStepIdx))
        wrongByUnit[unitKey].push(flatStepIdx);
    }

    /* پایان یونیت ⇒ انتقال باقیمانده‌ها به صف مرور */
    if (isLastOfUnit) {
      const wrongOfUnit = wrongByUnit[unitKey] || [];
      reviewQueue = [...reviewQueue, ...wrongOfUnit];
      wrongByUnit[unitKey] = [];
    }

    const deltaXp = isAnswerCorrect ? 1 : 0;
    xp += deltaXp;

    await persistLearning({
      progress: Math.max(learning.progress, flatStepIdx + 1),
      correct: correctArr,
      wrongByUnit,
      reviewQueue,
      deltaXp,
      finished: isLastStep,
    });

    return reviewQueue;
  };

  /* ───── Submit handlers for kinds */
  const handleSubmitChoice = async () => {
    let correct = false;
    if (step.type === "multiple-choice" || step.type === "fill-in-the-blank")
      correct =
        String(step.correctIndex) === answer ||
        step.options?.[step.correctIndex] === answer;
    else if (step.type === "multi-answer")
      correct = (step.correctIndexes || []).map(String).includes(answer);

    setShowResult(true);
    setIsCorrect(correct);
    const newQueue = await handleEvaluation(correct);

    /* ← اگر درست بود بعد از وقفه برو جلو */
    if (correct) setTimeout(() => goNext(newQueue), 900);
  };

  const handleSubmitMatching = async () => {
    const pairs = step.pairs || [];
    let allCorrect = true;
    pairs.forEach((p, idx) => {
      if (String(matchMap[idx] ?? "") !== String(p.right)) allCorrect = false;
    });

    setShowResult(true);
    setIsCorrect(allCorrect);
    const newQueue = await handleEvaluation(allCorrect);

    if (allCorrect) setTimeout(() => goNext(newQueue), 900);
  };

  /* ───── توضیحِ غیرسؤالی */
  const handleExplanationNext = async () => {
    let wrongByUnit = { ...(learning.wrongByUnit || {}) };
    let reviewQueue = [...(learning.reviewQueue || [])];

    if (isLastOfUnit) {
      reviewQueue = [...reviewQueue, ...(wrongByUnit[unitKey] || [])];
      wrongByUnit[unitKey] = [];
    }

    await persistLearning({
      progress: Math.max(learning.progress, flatStepIdx + 1),
      wrongByUnit,
      reviewQueue,
      finished: isLastStep,
    });

    goNext(reviewQueue);
  };

  /* ───── UI */
  return (
    <Box maxWidth="sm" mx="auto" mt={5}>
      {/* نوار پیشرفت یونیت */}
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
          fontWeight="bold"
          display="block"
          textAlign="center"
          mt={0.5}
        >
          {unitProgress}% از یونیت
        </Typography>
      </Box>

      {/* کارت گام */}
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h6" mb={2} color="#2477F3" fontWeight="bold">
          {step.title}
        </Typography>

        {/* ───── گام توضیحی */}
        {step.type === "explanation" && (
          <Box>
            <div dangerouslySetInnerHTML={{ __html: step.content || "" }} />
            <Button
              variant="contained"
              sx={{ mt: 3, fontWeight: "bold" }}
              onClick={handleExplanationNext}
            >
              {isLastStep ? "پایان دوره" : "مرحله بعد"}
            </Button>
          </Box>
        )}

        {/* ───── MC / fill-in / multi-answer */}
        {["multiple-choice", "fill-in-the-blank", "multi-answer"].includes(
          step.type
        ) && (
          <Box>
            {step.text && (
              <Typography fontSize={17} mb={2}>
                {step.text}
              </Typography>
            )}
            <Box display="flex" flexDirection="column" gap={1}>
              {(step.options || []).map((opt, idx) => (
                <Button
                  key={idx}
                  variant={answer === String(idx) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setAnswer(String(idx))}
                  disabled={showResult}
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
                onClick={handleSubmitChoice}
              >
                ثبت پاسخ
              </Button>
            )}

            {showResult && (
              <Box mt={2}>
                <Typography
                  color={isCorrect ? "success.main" : "error"}
                  fontWeight="bold"
                >
                  {isCorrect
                    ? step.feedbackCorrect || "پاسخ صحیح!"
                    : step.feedbackWrong || "پاسخ اشتباه"}
                </Typography>

                {/* دکمه جلو رفتن برای پاسخ غلط */}
                {!isCorrect && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      goNext(
                        learning.reviewQueue?.length
                          ? learning.reviewQueue
                          : []
                      )
                    }
                  >
                    مرحله بعد
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* ───── گام «matching» */}
        {step.type === "matching" && (
          <Box>
            {step.matchingQuestion && (
              <Typography fontSize={17} mb={2}>
                {step.matchingQuestion}
              </Typography>
            )}

            {/* ستون راست: left items */}
            {(step.pairs || []).map((p, idx) => (
              <Stack
                key={idx}
                direction="row"
                alignItems="center"
                spacing={1}
                mb={1.5}
              >
                <Typography sx={{ minWidth: 140, fontWeight: "bold" }}>
                  {p.left}
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={matchMap[idx] ?? ""}
                    onChange={(e) =>
                      setMatchMap((m) => ({ ...m, [idx]: e.target.value }))
                    }
                    disabled={showResult}
                  >
                    {(step.pairs || []).map((pr, j) => (
                      <MenuItem key={j} value={pr.right}>
                        {pr.right}
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
                onClick={handleSubmitMatching}
              >
                ثبت تطبیق
              </Button>
            )}

            {showResult && (
              <Box mt={2}>
                <Typography
                  color={isCorrect ? "success.main" : "error"}
                  fontWeight="bold"
                >
                  {isCorrect
                    ? step.feedbackCorrect || "عالی! همه جفت‌ها درست بود."
                    : step.feedbackWrong || "برخی تطبیق‌ها نادرست بود."}
                </Typography>

                {!isCorrect && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      goNext(
                        learning.reviewQueue?.length
                          ? learning.reviewQueue
                          : []
                      )
                    }
                  >
                    مرحله بعد
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* بازگشت به نقشه دوره */}
      <Box mt={2} textAlign="center">
        <Button
          variant="text"
          color="info"
          onClick={() => router.replace(`/roadmap/${courseId}`)}
        >
          بازگشت به نقشه راه
        </Button>
      </Box>
    </Box>
  );
}
