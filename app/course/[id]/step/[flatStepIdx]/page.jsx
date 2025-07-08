"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const flatStepIdx = Number(params.flatStepIdx);

  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(null);
  const [stepMeta, setStepMeta] = useState({});
  const [learning, setLearning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) {
      router.replace("/");
      return;
    }
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((res) => res.json()),
      fetch("/api/students/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      }).then((res) => res.json()),
    ]).then(([courseRes, learningRes]) => {
      setCourse(courseRes);
      const l =
        (learningRes.learning || []).find((lr) => lr.courseId === courseId) ||
        { courseId, progress: 0, correct: [], wrong: [], finished: false };
      setLearning(l);

      // استخراج گام
      let counter = 0,
        found = null,
        meta = {};
      for (let secIdx = 0; secIdx < courseRes.sections.length; secIdx++) {
        const section = courseRes.sections[secIdx];
        for (let unitIdx = 0; unitIdx < section.units.length; unitIdx++) {
          const unit = section.units[unitIdx];
          for (let stepIdx = 0; stepIdx < unit.steps.length; stepIdx++) {
            if (counter === flatStepIdx) {
              found = unit.steps[stepIdx];
              meta = { secIdx, unitIdx, stepIdx, unit, section };
              break;
            }
            counter++;
          }
          if (found) break;
        }
        if (found) break;
      }
      setStep(found);
      setStepMeta(meta);
      setLoading(false);
    });
  }, [courseId, flatStepIdx]);

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
          گام موردنظر یافت نشد.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.replace(`/roadmap/${courseId}`)}
        >
          بازگشت به دوره
        </Button>
      </Box>
    );

  // **کلید: فقط اگه progress جلوتر از flatStepIdx باشه دسترسی نداره!**
  if ((learning?.progress ?? 0) < flatStepIdx) {
    return (
      <Box p={4}>
        <Typography color="warning.main" fontWeight="bold">
          شما هنوز به این گام دسترسی ندارید!
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

  const totalSteps = course.sections.reduce(
    (acc, s) => acc + s.units.reduce((a, u) => a + u.steps.length, 0),
    0
  );
  const isLastStep = flatStepIdx === totalSteps - 1;

  const handleSubmit = async () => {
    let correct = false;
    if (step.type === "multiple-choice" || step.type === "fill-in-the-blank") {
      correct =
        String(step.correctIndex) === answer ||
        step.options?.[step.correctIndex] === answer;
    }
    if (step.type === "multi-answer") {
      correct = (step.correctIndexes || []).map(String).includes(answer);
    }

    setShowResult(true);
    setIsCorrect(correct);

    const mobile = localStorage.getItem("student_mobile");
    let correctArr = learning.correct || [];
    let wrongArr = learning.wrong || [];
    let progress = learning.progress || 0;
    let finished = false;

    if (correct) {
      if (!correctArr.includes(flatStepIdx))
        correctArr = [...correctArr, flatStepIdx];
      wrongArr = wrongArr.filter(idx => idx !== flatStepIdx);
    } else {
      if (!wrongArr.includes(flatStepIdx))
        wrongArr = [...wrongArr, flatStepIdx];
    }

    // همیشه جلو ببر
    progress = Math.max(progress, flatStepIdx + 1);
    if (isLastStep) finished = true;

    await fetch("/api/students/learning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile,
        courseId,
        progress,
        correct: correctArr,
        wrong: wrongArr,
        finished,
      }),
    });

    if (correct && !isLastStep) {
      setTimeout(() => {
        router.replace(`/course/${courseId}/step/${flatStepIdx + 1}`);
      }, 900);
    }
    if (correct && isLastStep) {
      setTimeout(() => {
        router.replace(`/roadmap/${courseId}`);
      }, 900);
    }
  };

  const handleGoNextStep = () => {
    if (!isLastStep) router.replace(`/course/${courseId}/step/${flatStepIdx + 1}`);
    else router.replace(`/roadmap/${courseId}`);
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={5}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h6" mb={2} color="#2477F3" fontWeight="bold">
          {step.title}
        </Typography>
        {step.type === "explanation" && (
          <Box>
            <div dangerouslySetInnerHTML={{ __html: step.content || "" }} />
            <Button
              variant="contained"
              sx={{ mt: 3, fontWeight: "bold" }}
              onClick={async () => {
                const mobile = localStorage.getItem("student_mobile");
                let progress = learning.progress || 0;
                let finished = false;
                if (progress < flatStepIdx + 1) {
                  progress = flatStepIdx + 1;
                }
                if (isLastStep) finished = true;
                await fetch("/api/students/learning", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    mobile,
                    courseId,
                    progress,
                    correct: learning.correct || [],
                    wrong: learning.wrong || [],
                    finished,
                  }),
                });
                if (isLastStep) router.replace(`/roadmap/${courseId}`);
                else
                  router.replace(`/course/${courseId}/step/${flatStepIdx + 1}`);
              }}
            >
              {isLastStep ? "پایان دوره" : "مرحله بعد"}
            </Button>
          </Box>
        )}

        {["multiple-choice", "fill-in-the-blank"].includes(step.type) && (
          <Box>
            <Typography fontSize={17} mb={2}>
              {step.text}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {(step.options || []).map((opt, idx) => (
                <Button
                  key={idx}
                  variant={answer === String(idx) ? "contained" : "outlined"}
                  color="primary"
                  sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    justifyContent: "flex-end",
                  }}
                  onClick={() => setAnswer(String(idx))}
                  disabled={showResult}
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
                onClick={handleSubmit}
              >
                ثبت پاسخ
              </Button>
            )}
            {showResult && (
              <Box>
                <Typography
                  mt={2}
                  color={isCorrect ? "success.main" : "error"}
                  fontWeight="bold"
                >
                  {isCorrect
                    ? step.feedbackCorrect || "پاسخ صحیح!"
                    : step.feedbackWrong || "پاسخ اشتباه"}
                </Typography>
                {!isCorrect && (
                  <Button
                    sx={{ mt: 2 }}
                    onClick={handleGoNextStep}
                    variant="contained"
                    color="primary"
                  >
                    مرحله بعد
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
      <Box mt={2} textAlign="center">
        <Button
          variant="text"
          color="info"
          onClick={() => router.replace(`/roadmap/${courseId}`)}
        >
          بازگشت به نقشه راه دوره
        </Button>
      </Box>
    </Box>
  );
}
