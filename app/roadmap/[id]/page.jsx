"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";

const UNIT_COLORS = [
  "#2477F3", "#66DE93", "#FDA949", "#AC7FF4",
  "#F35C4A", "#5DC6EE", "#F9C846"
];
function getUnitColor(index) {
  return UNIT_COLORS[index % UNIT_COLORS.length];
}
const positions = ["flex-start", "center", "flex-end", "center"];

export default function CourseRoadmapPage() {
  const params = useParams();
  const courseId = params.id;
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [learning, setLearning] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const stepRefs = useRef([]);

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
        {};
      setLearning(l);
      setLoading(false);
    });
  }, [courseId]);

  let steps = [];
  if (course)
    course.sections.forEach((section, secIdx) => {
      section.units.forEach((unit, unitIdx) => {
        unit.steps.forEach((step, stepIdx) => {
          steps.push({
            ...step,
            secIdx,
            unitIdx,
            stepIdx,
            unitTitle: unit.title,
            sectionTitle: section.title,
            color: getUnitColor(unitIdx),
          });
        });
      });
    });

  useEffect(() => {
    const handleScroll = () => {
      let minDiff = Infinity;
      let activeIdx = 0;
      stepRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const diff = Math.abs(rect.top - 170);
        if (diff < minDiff) {
          minDiff = diff;
          activeIdx = idx;
        }
      });
      setActiveStepIdx(activeIdx);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [steps.length]);

  const progress = learning.progress || 0;
  const currentStep =
    steps[Math.max(activeStepIdx, progress)] || steps[0] || {};
  const headerColor = currentStep.color || UNIT_COLORS[0];

  if (loading)
    return (
      <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (!course) return <Typography>دوره‌ای یافت نشد</Typography>;

  return (
    <Box maxWidth="40rem" mx="auto" mt={6} px={2} sx={{ minHeight: "100vh" }}>
      {/* استیکی باکس بزرگ و رنگی */}
      <Box
        position="sticky"
        top={12}
        zIndex={20}
        bgcolor={headerColor}
        color="white"
        py={3}
        px={4}
        boxShadow={4}
        sx={{
          borderRadius: "22px",
          mb: 6,
          minHeight: 94,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.3s"
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          sx={{ letterSpacing: "1px" }}
        >
          {currentStep.sectionTitle || ""}
        </Typography>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          {currentStep.unitTitle || ""}
        </Typography>
      </Box>

      {/* رودمپ سینوسی */}
      <Box margin="auto" maxWidth="18rem" display="flex" flexDirection="column" gap={0.3} alignItems="stretch">
        {steps.map((step, i) => {
          const isDone = (learning.correct || []).includes(i);
          const isLocked = i > progress;
          const isActive = i === progress;
          const alignSelf = positions[i % positions.length];

          return (
            <Box
              key={step._id || i}
              display="flex"
              flexDirection="column"
              alignItems={alignSelf}
              sx={{ width: "100%" }}
              mb={0.1}
              ref={el => (stepRefs.current[i] = el)}
            >
              <Button
                onClick={() =>
                  !isLocked && router.push(`/course/${course._id}/step/${i}`)
                }
                sx={{
                  background: step.color,
                  color: "#fff",
                  // حالت سه بعدی با سایه‌های داخلی
                  boxShadow: `
                    inset 0 -4px 6px rgba(0,0,0,0.15),
                    inset 0 4px 6px rgba(255,255,255,0.3),
                    ${isActive ? `0 0 18px 6px ${step.color}88` : 
                     isDone ? "0 0 13px 4px #66DE9370" : 
                     isLocked ? `0 0 10px 3px ${step.color}66` : "none"}
                  `,
                  border: isActive
                    ? `3px solid #fff`
                    : isDone
                    ? `3px solid #66DE93`
                    : isLocked
                    ? `3px solid ${step.color}99` // شفافیت بیشتر برای قفل‌ها
                    : `3px solid ${step.color}`,
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  minWidth: 60,
                  fontWeight: 700,
                  fontSize: 17,
                  p: 0,
                  mb: 0.1,
                  transition: "all 0.2s",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.1 : 1,
                  "&:hover": !isLocked && {
                    transform: "scale(1.1)",
                    boxShadow: `
                      inset 0 -4px 6px rgba(0,0,0,0.15),
                      inset 0 4px 6px rgba(255,255,255,0.3),
                      0 0 22px ${step.color}B0
                    `
                  }
                }}
                disableElevation
              >
                {isDone ? (
                  <CheckCircleIcon sx={{ fontSize: 31 }} />
                ) : isLocked ? (
                  <LockIcon sx={{ fontSize: 29, color: "#eee" }} />
                ) : isActive ? (
                  <PlayArrowIcon sx={{ fontSize: 30 }} />
                ) : (
                  <StarIcon sx={{ fontSize: 26 }} />
                )}
              </Button>
            </Box>
          );
        })}
      </Box>

      {/* دکمه برگشت */}
      <Box display="flex" justifyContent="center" mt={7} mb={8}>
        <Button
          size="large"
          variant="contained"
          sx={{
            background: headerColor,
            color: "#fff",
            fontWeight: 900,
            fontSize: 22,
            px: 8,
            py: 2,
            borderRadius: 6,
            minHeight: 56,
            boxShadow: `0 0 24px 3px ${headerColor}70`,
            transition: "background-color 0.3s",
            "&:hover": {
              background: "#222",
              color: headerColor,
              boxShadow: `0 0 30px 4px ${headerColor}80`
            }
          }}
          onClick={() => router.push("/roadmap")}
        >
          بازگشت به همه دوره‌ها
        </Button>
      </Box>
    </Box>
  );
}