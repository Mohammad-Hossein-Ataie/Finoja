// app/roadmap/[id]/page.jsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";

// آیکن‌های نوع گام
import HelpCenterOutlinedIcon from "@mui/icons-material/HelpCenterOutlined"; // explanation
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined"; // multiple-choice
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"; // multi-answer
import ShortTextOutlinedIcon from "@mui/icons-material/ShortTextOutlined"; // fill-in-the-blank
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined"; // matching

const UNIT_COLORS = [
  "#2477F3",
  "#66DE93",
  "#FDA949",
  "#AC7FF4",
  "#F35C4A",
  "#5DC6EE",
  "#F9C846",
];
const positions = ["flex-start", "center", "flex-end", "center"];
const getUnitColor = (i) => UNIT_COLORS[i % UNIT_COLORS.length];

// آیکن متناسب با نوع گام
const typeIcon = (stepType, sx = {}) => {
  switch (stepType) {
    case "explanation":
      return <HelpCenterOutlinedIcon sx={sx} />;
    case "multiple-choice":
      return <QuizOutlinedIcon sx={sx} />;
    case "multi-answer":
      return <FactCheckOutlinedIcon sx={sx} />;
    case "fill-in-the-blank":
      return <ShortTextOutlinedIcon sx={sx} />;
    case "matching":
      return <LinkOutlinedIcon sx={sx} />;
    default:
      return <StarIcon sx={sx} />;
  }
};

// جداکننده واحدها
function UnitSeparator({ unitTitle, color }) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        my: 2,
      }}
    >
      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{ color, mb: 1, px: 2, borderRadius: 2, zIndex: 10 }}
      >
        {unitTitle}
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: 2,
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          my: 1,
        }}
      />
    </Box>
  );
}

export default function CourseRoadmapPage() {
  const { id: courseId } = useParams();
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
  }, [courseId, router]);

  // ساخت آیتم‌ها
  let totalSteps = 0;
  let roadmapItems = [];
  if (course) {
    let g = 0;
    const totalSections = course.sections.length;

    course.sections.forEach((section, secIdx) => {
      const totalUnitsInSection = section.units.length;

      section.units.forEach((unit, unitIdx) => {
        unit.steps.forEach((st, stepIdxInUnit) => {
          roadmapItems.push({
            ...st,
            stepType: st.type, // نوع واقعی گام را نگه می‌داریم
            kind: "step", // نوع آیتم
            secIdx,
            unitIdx,
            stepIdx: stepIdxInUnit,
            unitTitle: unit.title,
            sectionTitle: section.title,
            color: getUnitColor(unitIdx),
            globalStepIndex: g,
          });
          g++;
        });

        const isLastUnit =
          secIdx === totalSections - 1 && unitIdx === totalUnitsInSection - 1;
        if (!isLastUnit) {
          roadmapItems.push({
            kind: "unit-separator",
            unitIdx,
            unitTitle: unit.title,
            color: getUnitColor(unitIdx),
            key: `separator-${secIdx}-${unitIdx}`,
          });
        }
      });
    });

    totalSteps = g;
  }

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
  }, [totalSteps]);

  const progress = learning.progress || 0;
  const currentStep =
    roadmapItems.find(
      (it) =>
        it.kind === "step" &&
        it.globalStepIndex === Math.max(activeStepIdx, progress)
    ) || {};
  const headerColor = currentStep.color || UNIT_COLORS[0];

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

  return (
    <Box maxWidth="40rem" mx="auto" mt={6} px={2} sx={{ minHeight: "100vh" }}>
      {/* هدر چسبان */}
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
          transition: "background-color 0.3s",
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center">
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

      {/* مسیر سینوسی */}
      <Box
        margin="auto"
        maxWidth="18rem"
        display="flex"
        flexDirection="column"
        gap={0.3}
        alignItems="stretch"
      >
        {roadmapItems.map((item, idx) => {
          if (item.kind === "step") {
            const isDone = (learning.correct || []).includes(
              item.globalStepIndex
            );
            const isLocked = item.globalStepIndex > progress;
            const isActive = item.globalStepIndex === progress;
            const alignSelf =
              positions[item.globalStepIndex % positions.length];

            // آیکن قابل نمایش داخل دایره
            const iconEl = isDone ? (
              <CheckCircleIcon sx={{ fontSize: 31 }} />
            ) : isActive ? (
              <PlayArrowIcon sx={{ fontSize: 30 }} />
            ) : (
              typeIcon(item.stepType, { fontSize: 26 })
            ); // <-- حتی وقتی قفل است

            return (
              <Box
                key={`${item.secIdx}-${item.unitIdx}-${item.stepIdx}`}
                display="flex"
                flexDirection="column"
                alignItems={alignSelf}
                sx={{ width: "100%" }}
                mb={0.1}
                ref={(el) => (stepRefs.current[item.globalStepIndex] = el)}
              >
                <Button
                  onClick={() =>
                    !isLocked &&
                    router.push(
                      `/course/${course._id}/step/${item.globalStepIndex}`
                    )
                  }
                  sx={{
                    background: item.color,
                    color: "#fff",
                    boxShadow: `
                      inset 0 -4px 6px rgba(0,0,0,0.15),
                      inset 0 4px 6px rgba(255,255,255,0.3),
                      ${
                        isActive
                          ? `0 0 18px 6px ${item.color}88`
                          : isDone
                          ? "0 0 13px 4px #66DE9370"
                          : isLocked
                          ? `0 0 10px 3px ${item.color}66`
                          : "none"
                      }
                    `,
                    border: isActive
                      ? `3px solid #fff`
                      : isDone
                      ? `3px solid #66DE93`
                      : isLocked
                      ? `3px solid ${item.color}99`
                      : `3px solid ${item.color}`,
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
                    opacity: isLocked ? 0.35 : 1, // قفل فقط با دیسِیبل/شفافیت مشخص می‌شود
                    "&:hover": !isLocked && {
                      transform: "scale(1.1)",
                      boxShadow: `0 0 22px ${item.color}B0`,
                    },
                  }}
                  disableElevation
                >
                  {iconEl}
                </Button>
              </Box>
            );
          }

          if (item.kind === "unit-separator") {
            return (
              <UnitSeparator
                key={item.key}
                unitTitle={item.unitTitle}
                color={item.color}
              />
            );
          }
          return null;
        })}
      </Box>

      {/* بازگشت */}
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
              boxShadow: `0 0 30px 4px ${headerColor}80`,
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
