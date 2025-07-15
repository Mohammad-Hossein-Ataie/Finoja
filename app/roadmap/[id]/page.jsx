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

// کامپوننت جداکننده واحدها
function UnitSeparator({ unitTitle, color }) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        my: 2
      }}
    >
      <Typography 
        variant="body1" 
        fontWeight="bold" 
        sx={{ 
          color: color, 
          mb: 1,
          px: 2,
          borderRadius: 2,
          zIndex: 10
        }}
      >
        {unitTitle}
      </Typography>
      <Box 
        sx={{ 
          width: '100%', 
          height: 2, 
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          my: 1
        }} 
      />
    </Box>
  );
}

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

  // محاسبه totalSteps و ساختار roadmapItems
  let totalSteps = 0;
  let roadmapItems = [];
  
  if (course) {
    // محاسبه تعداد کل گام‌ها
    totalSteps = course.sections.reduce((total, section) => 
      total + section.units.reduce((unitTotal, unit) => 
        unitTotal + unit.steps.length, 0), 0);

    // ساختار roadmapItems با جداکننده‌های واحد
    let globalStepIndex = 0;
    const totalSections = course.sections.length;
    
    course.sections.forEach((section, secIdx) => {
      const totalUnitsInSection = section.units.length;
      
      section.units.forEach((unit, unitIdx) => {
        // افزودن گام‌های واحد فعلی
        unit.steps.forEach((step, stepIdxInUnit) => {
          roadmapItems.push({
            ...step,
            secIdx,
            unitIdx,
            stepIdx: stepIdxInUnit,
            unitTitle: unit.title,
            sectionTitle: section.title,
            color: getUnitColor(unitIdx),
            type: 'step',
            globalStepIndex: globalStepIndex
          });
          globalStepIndex++;
        });

        // افزودن جداکننده بعد از هر واحد (به جز آخرین واحد)
        const isLastUnit = (secIdx === totalSections - 1) && 
                          (unitIdx === totalUnitsInSection - 1);
        
        if (!isLastUnit) {
          roadmapItems.push({
            type: 'unit-separator',
            unitIdx,
            unitTitle: unit.title,
            color: getUnitColor(unitIdx),
            key: `separator-${secIdx}-${unitIdx}`
          });
        }
      });
    });
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
  }, [totalSteps]); // وابستگی به totalSteps

  const progress = learning.progress || 0;
  const currentStep = roadmapItems.find(item => 
    item.type === 'step' && item.globalStepIndex === Math.max(activeStepIdx, progress)
  ) || {};
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

      {/* رودمپ سینوسی با جداکننده‌های واحد */}
      <Box margin="auto" maxWidth="18rem" display="flex" flexDirection="column" gap={0.3} alignItems="stretch">
        {roadmapItems.map((item, idx) => {
          if (item.type === 'step') {
            const isDone = (learning.correct || []).includes(item.globalStepIndex);
            const isLocked = item.globalStepIndex > progress;
            const isActive = item.globalStepIndex === progress;
            const alignSelf = positions[item.globalStepIndex % positions.length];

            return (
              <Box
                key={`${item.secIdx}-${item.unitIdx}-${item.stepIdx}`}
                display="flex"
                flexDirection="column"
                alignItems={alignSelf}
                sx={{ width: "100%" }}
                mb={0.1}
                ref={el => (stepRefs.current[item.globalStepIndex] = el)}
              >
                <Button
                  onClick={() =>
                    !isLocked && router.push(`/course/${course._id}/step/${item.globalStepIndex}`)
                  }
                  sx={{
                    background: item.color,
                    color: "#fff",
                    boxShadow: `
                      inset 0 -4px 6px rgba(0,0,0,0.15),
                      inset 0 4px 6px rgba(255,255,255,0.3),
                      ${isActive ? `0 0 18px 6px ${item.color}88` : 
                       isDone ? "0 0 13px 4px #66DE9370" : 
                       isLocked ? `0 0 10px 3px ${item.color}66` : "none"}
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
                    opacity: isLocked ? 0.3 : 1,
                    "&:hover": !isLocked && {
                      transform: "scale(1.1)",
                      boxShadow: `
                        inset 0 -4px 6px rgba(0,0,0,0.15),
                        inset 0 4px 6px rgba(255,255,255,0.3),
                        0 0 22px ${item.color}B0
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
          } else if (item.type === 'unit-separator') {
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