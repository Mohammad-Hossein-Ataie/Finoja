"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import BookIcon from "@mui/icons-material/Book";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

/* ---------- Finoja Palette ---------- */
const colors = {
  primary: "#2477F3",
  secondary: "#D2E7FF",
  accent: "#66DE93",
  background: "#F9FAFB",
  text: "#1A2233",
};

export default function RoadmapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [learningMap, setLearningMap] = useState({});
  const [profile, setProfile] = useState(null);

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) {
      router.replace("/");
      return;
    }

    (async () => {
      /* پروفایل → اگر آنبوردینگ کامل نبود ریدایرکت شود */
      const prof = await fetch("/api/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      }).then((r) => r.json());

      if (!prof.onboarding) {
        router.replace("/onboarding");
        return;
      }
      setProfile(prof);

      /* دوره‌ها و وضعیت یادگیری */
      const [coursesRes, learningRes] = await Promise.all([
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/students/learning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile }),
        }).then((r) => r.json()),
      ]);

      setCourses(Array.isArray(coursesRes) ? coursesRes : []);
      const map = {};
      (learningRes.learning || []).forEach((l) => (map[l.courseId] = l));
      setLearningMap(map);
      setLoading(false);
    })();
  }, [router]);

  /* ---------- Helpers ---------- */
  const getTotalSteps = (course) =>
    course.sections?.reduce(
      (acc, sec) =>
        acc +
        sec.units?.reduce(
          (uAcc, u) => uAcc + (u.steps ? u.steps.length : 0),
          0
        ),
      0
    ) ?? 0;

  const handleStart = async (course) => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) return;

    if (!learningMap[course._id]) {
      await fetch("/api/students/learning", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          courseId: course._id,
          progress: 0,
          correct: [],
          wrong: [],
          finished: false,
        }),
      });
    }
    router.push(`/roadmap/${course._id}`);
  };

  /** کارت دوره (یک ستون) */
  const CourseCard = ({ course }) => {
    const learn = learningMap[course._id] || {};
    const total = getTotalSteps(course);
    const progress = total
      ? Math.floor(((learn.progress || 0) / total) * 100)
      : 0;
    const isDone = !!learn.finished;
    const isInProgress = !!learn && !isDone;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          borderLeft: `4px solid ${
            isDone ? colors.accent : isInProgress ? colors.primary : colors.text
          }`,
          background: `linear-gradient(135deg,${colors.background} 0%,${colors.secondary} 120%)`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            width={56}
            height={56}
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              bgcolor: `${
                isDone
                  ? colors.accent
                  : isInProgress
                  ? colors.primary
                  : colors.text
              }22`,
            }}
          >
            {isDone ? (
              <CheckCircleIcon sx={{ color: colors.accent }} />
            ) : isInProgress ? (
              <TrendingUpIcon sx={{ color: colors.primary }} />
            ) : (
              <BookIcon sx={{ color: colors.text }} />
            )}
          </Box>

          <Box flexGrow={1}>
            <Typography fontWeight="bold" color={colors.text}>
              {course.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.8 }}
              color={colors.text}
            >
              {course.description}
            </Typography>

            {isInProgress && (
              <Box mt={1}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 2,
                    backgroundColor: colors.secondary,
                    "& .MuiLinearProgress-bar": { bgcolor: colors.primary },
                  }}
                />
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color={colors.primary}
                >
                  {progress.toLocaleString("fa-IR")}%
                </Typography>
              </Box>
            )}

            {isDone && (
              <Chip
                size="small"
                label="تکمیل‌شده"
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  mt: 1,
                  bgcolor: `${colors.accent}22`,
                  color: colors.accent,
                  fontWeight: "bold",
                }}
              />
            )}
          </Box>

          <Button
            variant={isDone ? "outlined" : "contained"}
            size="small"
            startIcon={!isDone && <PlayCircleFilledWhiteIcon />}
            onClick={() => handleStart(course)}
            sx={{
              whiteSpace: "nowrap",
              bgcolor: isDone ? "transparent" : colors.primary,
              color: isDone ? colors.primary : "#fff",
              borderColor: colors.primary,
              "&:hover": {
                bgcolor: isDone ? `${colors.primary}11` : colors.primary,
              },
            }}
          >
            {isDone ? "مشاهده" : isInProgress ? "ادامه" : "شروع"}
          </Button>
        </Stack>
      </Paper>
    );
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <Box
        minHeight="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  /* ---------- تقسیم‌بندی دوره‌ها ---------- */
  const doneCourses = courses.filter((c) => learningMap[c._id]?.finished);
  const working = courses.filter((c) => {
    const l = learningMap[c._id];
    return l && !l.finished; // وجود رکورد کافی‌ست
  });
  const fresh = courses.filter((c) => !learningMap[c._id]); // فقط بدون رکورد

  /* ---------- UI ---------- */
  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 4,
        minHeight: "100vh",
      }}
    >
      {/* تیتر اصلی */}
      <Stack
        mb={3}
        sx={{
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
          spacing: 10,
          mt: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color={colors.text}>
          نقشه یادگیری شما
        </Typography>
        {profile && (
          <Typography
            variant="subtitle2"
            color={colors.text}
            sx={{ opacity: 0.8, mt: 1 }}
          >
            سلام {profile.name} عزیز! بیا ادامه بدیم
          </Typography>
        )}
      </Stack>

      <Stack spacing={5}>
        {/* در حال یادگیری */}
        {working.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <TrendingUpIcon sx={{ color: colors.primary }} />
              <Typography variant="h6" fontWeight="bold" color={colors.text}>
                در حال یادگیری
              </Typography>
            </Stack>
            <Stack spacing={3}>
              {working.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </Stack>
          </Box>
        )}

        {/* دوره‌های جدید */}
        {fresh.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <BookIcon sx={{ color: colors.text }} />
              <Typography variant="h6" fontWeight="bold" color={colors.text}>
                دوره‌های جدید
              </Typography>
            </Stack>
            <Stack spacing={3}>
              {fresh.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </Stack>
          </Box>
        )}

        {/* تکمیل شده‌ها */}
        {doneCourses.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <CheckCircleIcon sx={{ color: colors.accent }} />
              <Typography variant="h6" fontWeight="bold" color={colors.text}>
                دوره‌های تکمیل‌شده
              </Typography>
            </Stack>
            <Stack spacing={3}>
              {doneCourses.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
