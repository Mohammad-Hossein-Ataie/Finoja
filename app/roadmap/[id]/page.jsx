"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";

const UNIT_COLORS = [
  "#2477F3", // Blue
  "#66DE93", // Green
  "#FDA949", // Orange
  "#AC7FF4", // Purple
  "#F35C4A", // Red
  "#5DC6EE", // Cyan
  "#F9C846", // Yellow
];

function getUnitColor(index) {
  return UNIT_COLORS[index % UNIT_COLORS.length];
}

export default function CourseRoadmapPage() {
  const params = useParams();
  const courseId = params.id;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [learning, setLearning] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const unitRefs = useRef({});

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const [key, ref] of Object.entries(unitRefs.current)) {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const offsetTop = rect.top + window.scrollY;
          const offsetBottom = offsetTop + rect.height;

          if (scrollPosition >= offsetTop && scrollPosition <= offsetBottom) {
            const [secIdx, unitIdx] = key.split("-").map(Number);
            setCurrentUnit(unitIdx);
            setCurrentSection(secIdx);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [course]);

  if (loading)
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
  if (!course) return <Typography>دوره‌ای یافت نشد</Typography>;

  const headerColor =
    currentUnit !== null ? getUnitColor(currentUnit) : UNIT_COLORS[0];

  let flatStepCounter = 0;
  const stepIndexMap = [];

  course.sections.forEach((section, secIdx) => {
    section.units.forEach((unit, unitIdx) => {
      unit.steps.forEach((step, stepIdx) => {
        stepIndexMap.push({
          secIdx,
          unitIdx,
          stepIdx,
          flatStepIdx: flatStepCounter,
        });
        flatStepCounter++;
      });
    });
  });

  const getFlatStepIndex = (secIdx, unitIdx, stepIdx) => {
    const found = stepIndexMap.find(
      (s) =>
        s.secIdx === secIdx && s.unitIdx === unitIdx && s.stepIdx === stepIdx
    );
    return found ? found.flatStepIdx : 0;
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={6} px={2} sx={{ minHeight: "100vh" }}>
      {/* Sticky Header */}
      <Box
        position="sticky"
        top={20}
        zIndex={10}
        bgcolor={headerColor}
        color="white"
        py={2}
        px={3}
        boxShadow={2}
        sx={{
          borderRadius: "12px 12px 12px 12px",
          transition: "background-color 0.3s ease",
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center">
          {currentSection !== null
            ? course.sections[currentSection]?.title
            : course.sections[0]?.title}
        </Typography>
        <Typography variant="subtitle1" textAlign="center">
          {currentUnit !== null
            ? course.sections[currentSection]?.units[currentUnit]?.title
            : course.sections[0]?.units[0]?.title}
        </Typography>
      </Box>

      <Typography
        variant="h5"
        fontWeight="bold"
        mb={2}
        textAlign="center"
        color="#2477F3"
      >
        {course.title}
      </Typography>
      <Typography color="#1A2233" fontSize={18} mb={4} textAlign="center">
        {course.description}
      </Typography>

      {course.sections.map((section, secIdx) => (
        <Box key={section._id} mb={6}>
          <Typography fontWeight="bold" fontSize={20} mb={2} color="#2477F3">
            {section.title}
          </Typography>

          <Box display="flex" flexDirection="column" gap={5}>
            {section.units.map((unit, unitIdx) => {
              const unitColor = getUnitColor(unitIdx);
              return (
                <Paper
                  key={unit._id}
                  ref={(el) => (unitRefs.current[`${secIdx}-${unitIdx}`] = el)}
                  sx={{
                    width: "100%",
                    maxWidth: 400,
                    mx: "auto",
                    px: 2,
                    py: 2,
                    borderRadius: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    background: "#fff",
                    borderLeft: `8px solid ${unitColor}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.3s",
                  }}
                >
                  <Typography
                    fontWeight={900}
                    fontSize={16}
                    mb={2}
                    color={unitColor}
                    textAlign="center"
                    sx={{
                      letterSpacing: 1.1,
                      textTransform: "uppercase",
                    }}
                  >
                    {unit.title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {unit.steps.map((step, stepIdx) => {
                      const flatIdx = getFlatStepIndex(
                        secIdx,
                        unitIdx,
                        stepIdx
                      );
                      const isDone = (learning.correct || []).includes(flatIdx);
                      const isLocked = flatIdx > (learning.progress || 0);
                      const isActive = flatIdx === (learning.progress || 0);
                      const isRight = stepIdx % 2 === 0;

                      return (
                        <Box
                          key={step._id || stepIdx}
                          position="relative"
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: isRight ? "flex-end" : "flex-start",
                            alignItems: "center",
                            minHeight: 100,
                            position: "relative",
                            my: 1,
                          }}
                        >
                          {/* Zigzag connector */}
                          {stepIdx !== 0 && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: -50,
                                height: 50,
                                width: 4,
                                background: "#e2eafc",
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 0,
                                "&::before": {
                                  content: '""',
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background: "#e2eafc",
                                },
                              }}
                            />
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isRight ? "flex-end" : "flex-start",
                              width: "100%",
                              zIndex: 1,
                            }}
                          >
                            <Button
                              onClick={() =>
                                !isLocked &&
                                router.push(
                                  `/course/${course._id}/step/${flatIdx}`
                                )
                              }
                              sx={{
                                background: isActive
                                  ? unitColor
                                  : isDone
                                  ? "#66DE93"
                                  : isLocked
                                  ? "#F5F9FF"
                                  : "#fff",
                                color: isLocked
                                  ? "#90a4ae"
                                  : isActive
                                  ? "#fff"
                                  : isDone
                                  ? "#fff"
                                  : unitColor,
                                border: `3px solid ${
                                  isLocked ? "#D2E7FF" : unitColor
                                }`,
                                boxShadow: isActive
                                  ? `0 0 14px 2px ${unitColor}80`
                                  : isDone
                                  ? "0 0 10px 1px #5be58455"
                                  : "none",
                                borderRadius: "50%",
                                width: 50,
                                height: 50,
                                minWidth: 50,
                                fontWeight: 700,
                                fontSize: 17,
                                mb: 1,
                                transition: "all 0.2s",
                                cursor: isLocked ? "not-allowed" : "pointer",
                                p: 0,
                                "&:hover": !isLocked && {
                                  transform: "scale(1.1)",
                                  boxShadow: `0 0 15px ${unitColor}80`,
                                },
                              }}
                              disableElevation
                            >
                              {isDone ? (
                                <CheckCircleIcon sx={{ fontSize: 24 }} />
                              ) : isLocked ? (
                                <LockIcon sx={{ fontSize: 24 }} />
                              ) : isActive ? (
                                <PlayArrowIcon sx={{ fontSize: 24 }} />
                              ) : (
                                <StarIcon sx={{ fontSize: 22 }} />
                              )}
                            </Button>

                            <Typography
                              fontWeight="bold"
                              fontSize={14}
                              color={isLocked ? "#90a4ae" : unitColor}
                              textAlign={isRight ? "right" : "left"}
                              sx={{
                                mt: 1,
                                minHeight: 40,
                                maxWidth: 180,
                              }}
                            >
                              {step.title}
                            </Typography>

                            <Typography
                              fontSize={12}
                              color="#6a6a6a"
                              textAlign={isRight ? "right" : "left"}
                              sx={{ maxWidth: 180 }}
                            >
                              {step.type === "explanation"
                                ? "توضیح"
                                : step.type === "multiple-choice"
                                ? "چندگزینه‌ای"
                                : step.type === "multi-answer"
                                ? "چندجوابی"
                                : step.type === "fill-in-the-blank"
                                ? "جای‌خالی"
                                : step.type === "matching"
                                ? "وصل‌کردنی"
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      ))}

      <Box display="flex" justifyContent="center" mt={4} mb={6}>
        <Button
          size="large"
          variant="contained"
          sx={{
            background: "#66DE93",
            color: "#fff",
            fontWeight: 900,
            fontSize: 18,
            px: 6,
            borderRadius: 3,
            "&:hover": {
              background: "#4dca80",
              boxShadow: "0 4px 12px rgba(102, 222, 147, 0.4)",
            },
          }}
          onClick={() => router.push("/roadmap")}
        >
          بازگشت به همه دوره‌ها
        </Button>
      </Box>
    </Box>
  );
}
