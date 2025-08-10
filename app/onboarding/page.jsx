// app/student/onboarding/page.jsx
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
  IconButton,
  useTheme,
  useMediaQuery,
  Grow,
  Fade,
  styled
} from "@mui/material";
import {
  EmojiObjects,
  TrendingUp,
  Schedule,
  Flag,
  School,
  Person,
  ArrowBack,
  ArrowForward
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

// تبدیل اعداد انگلیسی به فارسی
const persianNumbers = ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۱۰'];

// کامپوننت سفارشی برای آیکون مراحل با اعداد فارسی
const CustomStepIcon = (props) => {
  const { active, completed, icon } = props;

  return (
    <Box
      sx={{
        zIndex: 1,
        color: '#fff',
        width: 36,
        height: 36,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: active || completed ? '#4caf50' : '#e0e0e0',
        boxShadow: active ? '0 0 0 8px rgba(76, 175, 80, 0.2)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Typography variant="body1" fontWeight="bold" fontSize="1.1rem">
        {persianNumbers[icon - 1]}
      </Typography>
    </Box>
  );
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [direction, setDirection] = useState("next");
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const m = localStorage.getItem("student_mobile") || "";
    if (!m) {
      router.replace("/");
      return;
    }
    setMobile(m);

    // چک کردن وضعیت onboarding کاربر
    fetch("/api/students/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: m }),
    })
      .then(res => res.json())
      .then(profile => {
        if (profile.onboarding) {
          router.replace("/student");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleChange = (e) =>
    setAnswers({ ...answers, [questions[step].name]: e.target.value });

  const handleNext = () => {
    if (step < questions.length - 1) {
      setDirection("next");
      setStep(step + 1);
    } else {
      submitAnswers();
    }
  };

  const handlePrevious = () => {
    setDirection("prev");
    setStep(step - 1);
  };

  const submitAnswers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, mobile }),
      });
      
      if (res.ok) {
        // انیمیشن انتقال قبل از ریدایرکت
        setTimeout(() => {
          router.replace("/student");
        }, 800);
      } else {
        alert("خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید.");
        setLoading(false);
      }
    } catch (error) {
      alert("خطای شبکه! اتصال اینترنت خود را بررسی کنید.");
      setLoading(false);
    }
  };

  // انیمیشن‌های جهت‌دار
  const variants = {
    next: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 }
    },
    prev: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 }
    }
  };

  return (
    <Container 
      sx={{ 
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        py: 4
      }}
    >
      <Paper 
        elevation={4} 
        sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
          background: "#ffffff",
          border: "1px solid #e0f2fe",
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: "6px",
            borderRadius: "4px 4px 0 0"
          }
        }}
      >
        <Stepper 
          activeStep={step} 
          alternativeLabel
          sx={{ 
            mb: 4,
            "& .MuiStepLabel-label": { 
              fontFamily: "Vazirmatn, sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              color: "#2d3748",
              mt: 1
            },
            "& .MuiStepConnector-line": {
              borderColor: "#e0e0e0",
              borderTopWidth: 2
            },
            "& .Mui-active .MuiStepConnector-line": {
              borderColor: "#4caf50"
            },
            "& .Mui-completed .MuiStepConnector-line": {
              borderColor: "#4caf50"
            }
          }}
        >
          {questions.map((_, i) => (
            <Step key={i}>
              <StepLabel StepIconComponent={CustomStepIcon} />
            </Step>
          ))}
        </Stepper>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants[direction]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              mb={5}
            >
              <Fade in={true} timeout={500}>
                <Box sx={{ 
                  color: "#4caf50", 
                  mb: 3,
                  "& svg": {
                    fontSize: "3.5rem"
                  }
                }}>
                  {questions[step].icon}
                </Box>
              </Fade>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 800, 
                  textAlign: "center",
                  color: "#1e3a8a",
                  fontSize: isMobile ? "1.4rem" : "1.7rem",
                  lineHeight: 1.4,
                  textShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                {questions[step].question}
              </Typography>
              
              <RadioGroup
                value={answers[questions[step].name] || ""}
                onChange={handleChange}
                sx={{ width: "100%", maxWidth: "500px" }}
              >
                {questions[step].options.map((opt, i) => (
                  <Grow in={true} timeout={(i + 1) * 200} key={i}>
                    <FormControlLabel
                      value={opt.value}
                      control={
                        <Radio 
                          sx={{ 
                            ml: 1,
                            color: "#4caf50",
                            "&.Mui-checked": { 
                              color: "#2e7d32",
                              transform: "scale(1.1)"
                            }
                          }} 
                        />
                      }
                      label={
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={2}
                          sx={{ 
                            py: 1.5,
                            px: 2.5,
                            width: "100%",
                            borderRadius: 3,
                            transition: "all 0.3s ease",
                            bgcolor: answers[questions[step].name] === opt.value
                              ? "rgba(76, 175, 80, 0.1)"
                              : "transparent",
                            border: answers[questions[step].name] === opt.value
                              ? "2px solid #4caf50"
                              : "1px solid #e2e8f0",
                            "&:hover": {
                              borderColor: "#4caf50",
                              bgcolor: "rgba(76, 175, 80, 0.05)"
                            },
                          }}
                        >
                          <Box sx={{ 
                            color: answers[questions[step].name] === opt.value 
                              ? "#2e7d32" 
                              : "#718096"
                          }}>
                            {opt.icon}
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: isMobile ? "1rem" : "1.1rem",
                              color: answers[questions[step].name] === opt.value 
                                ? "#2e7d32" 
                                : "#4a5568"
                            }}
                          >
                            {opt.value}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        margin: "12px 0",
                        "& .MuiFormControlLabel-label": {
                          width: "100%"
                        }
                      }}
                    />
                  </Grow>
                ))}
              </RadioGroup>
            </Box>
          </motion.div>
        </AnimatePresence>
        
        <Box 
          display="flex" 
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={handlePrevious}
            disabled={step === 0 || loading}
            sx={{
              minWidth: 110,
              fontWeight: 700,
              fontSize: "1.05rem",
              py: 1.3,
              border: "2px solid #4caf50",
              color: "#2e7d32",
              "&:hover": {
                border: "2px solid #388e3c",
                backgroundColor: "rgba(56, 142, 60, 0.04)"
              },
              "&:disabled": {
                border: "1px solid #e0e0e0",
                color: "#9e9e9e"
              }
            }}
          >
            قبلی
          </Button>
          
          <Button
            variant="contained"
            startIcon={step < questions.length - 1 ? <ArrowBack /> : null}
            onClick={handleNext}
            disabled={!answers[questions[step].name] || loading}
            sx={{
              minWidth: 200,
              fontWeight: 700,
              fontSize: "1.05rem",
              py: 1.5,
              background: "linear-gradient(145deg, #4caf50, #388e3c)",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
              "&:hover": {
                background: "linear-gradient(145deg, #388e3c, #2e7d32)",
                boxShadow: "0 6px 16px rgba(56, 142, 60, 0.5)"
              },
              "&:disabled": {
                background: "linear-gradient(145deg, #a5d6a7, #81c784)",
                boxShadow: "none"
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : step < questions.length - 1 ? (
              "مرحله بعد"
            ) : (
              "پایان و ورود به دوره‌ها"
            )}
          </Button>
        </Box>
        
        <Typography 
          variant="body1" 
          textAlign="center" 
          mt={4}
          fontWeight={600}
          sx={{ color: "#718096" }}
        >
          {persianNumbers[step]} از {persianNumbers[questions.length - 1]}
        </Typography>
      </Paper>
    </Container>
  );
}