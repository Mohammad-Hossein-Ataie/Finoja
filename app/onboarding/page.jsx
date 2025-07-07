"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { EmojiObjects, TrendingUp, Schedule, Flag, School, Person } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const questions = [
  {
    question: "هدف اصلی شما از یادگیری مالی چیه؟",
    icon: <Flag color="primary" sx={{ fontSize: 40 }} />,
    options: [
      { value: "ورود به بازار کار", icon: <TrendingUp color="info" /> },
      { value: "مدیریت مالی شخصی", icon: <Person color="secondary" /> },
      { value: "سرمایه‌گذاری", icon: <EmojiObjects color="warning" /> },
      { value: "علاقه شخصی", icon: <School color="success" /> },
    ],
    name: "goal",
  },
  {
    question: "سطح فعلی دانش مالی شما چقدره؟",
    icon: <EmojiObjects color="warning" sx={{ fontSize: 40 }} />,
    options: [
      { value: "کاملاً مبتدی", icon: <School /> },
      { value: "مقدماتی", icon: <School color="info" /> },
      { value: "متوسط", icon: <School color="secondary" /> },
      { value: "پیشرفته", icon: <TrendingUp color="success" /> },
    ],
    name: "level",
  },
  {
    question: "روزانه چقدر وقت داری برای یادگیری اختصاص بدی؟",
    icon: <Schedule color="action" sx={{ fontSize: 40 }} />,
    options: [
      { value: "کمتر از ۱۰ دقیقه", icon: <Schedule color="error" /> },
      { value: "۱۰ تا ۲۰ دقیقه", icon: <Schedule color="info" /> },
      { value: "۳۰ دقیقه یا بیشتر", icon: <Schedule color="success" /> },
    ],
    name: "duration",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const router = useRouter();

  useEffect(() => {
    const m = typeof window !== "undefined" ? localStorage.getItem("student_mobile") : "";
    if (!m) {
      router.replace("/");
      return;
    }
    setMobile(m);

    // اگر کاربر قبلاً onboarding انجام داده بود ریدایرکت به roadmap
    fetch("/api/students/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: m }),
    })
      .then(res => res.json())
      .then(profile => {
        if (profile.onboarding) {
          router.replace("/roadmap");
        }
      });
  }, [router]);

  const handleChange = (e) =>
    setAnswers({ ...answers, [questions[step].name]: e.target.value });

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, mobile }),
      });
      setLoading(false);
      if (res.ok) {
        router.replace("/roadmap");
      } else {
        alert("خطا در ثبت اطلاعات. دوباره تلاش کنید.");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 5 }, borderRadius: 5 }}>
        <Stepper activeStep={step} alternativeLabel>
          {questions.map((_, i) => (
            <Step key={i}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>
        <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
          <Box>{questions[step].icon}</Box>
          <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: "bold", textAlign: "center" }}>
            {questions[step].question}
          </Typography>
          <RadioGroup
            value={answers[questions[step].name] || ""}
            onChange={handleChange}
            sx={{ width: "100%" }}
          >
            {questions[step].options.map((opt, i) => (
              <FormControlLabel
                key={i}
                value={opt.value}
                control={<Radio sx={{ ml: 1 }} />}
                label={
                  <Box display="flex" alignItems="center" gap={1.2}>
                    {opt.icon}
                    <span>{opt.value}</span>
                  </Box>
                }
                sx={{
                  bgcolor:
                    answers[questions[step].name] === opt.value
                      ? "#D2E7FF"
                      : "transparent",
                  borderRadius: 2,
                  px: 2,
                  my: 0.5,
                  transition: "background 0.2s",
                }}
              />
            ))}
          </RadioGroup>
        </Box>
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 4, py: 1.5, fontWeight: "bold", fontSize: 16 }}
          disabled={!answers[questions[step].name] || loading}
          onClick={handleNext}
        >
          {loading ? <CircularProgress size={22} /> : step < questions.length - 1 ? "مرحله بعد" : "پایان و ورود به دوره‌ها"}
        </Button>
      </Paper>
    </Container>
  );
}
