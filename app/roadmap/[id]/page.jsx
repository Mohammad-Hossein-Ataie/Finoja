// app/roadmap/[id]/page.jsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListSubheader,
  ListItemButton,
  Divider,
} from "@mui/material";

// آیکن‌های وضعیت و نوع گام
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";
import HelpCenterOutlinedIcon from "@mui/icons-material/HelpCenterOutlined";   // explanation
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";               // multiple-choice
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";     // multi-answer
import ShortTextOutlinedIcon from "@mui/icons-material/ShortTextOutlined";     // fill-in-the-blank
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";               // matching
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const UNIT_COLORS = ["#2477F3", "#66DE93", "#FDA949", "#AC7FF4", "#F35C4A", "#5DC6EE", "#F9C846"];
const positions = ["flex-start", "center", "flex-end", "center"];
const getUnitColor = (i) => UNIT_COLORS[i % UNIT_COLORS.length];

// آیکن متناسب با نوع گام
const typeIcon = (t, sx) => {
  switch (t) {
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

// جداکنندهٔ یونیت
function UnitSeparator({ unitTitle, color }) {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", my: 2 }}>
      <Typography variant="body1" fontWeight="bold" sx={{ color, mb: 1, px: 2, borderRadius: 2 }}>
        {unitTitle}
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: 2,
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
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
  const unitAnchorIndex = useRef({}); // {'sec-unit': firstGlobalStepIndex}

  const [unitPickerOpen, setUnitPickerOpen] = useState(false);

  /* -------- Fetch course + learning -------- */
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
    ]).then(([c, lRes]) => {
      setCourse(c);
      const l = (lRes.learning || []).find((lr) => lr.courseId === courseId) || {};
      setLearning(l || {});
      setLoading(false);
    });
  }, [courseId, router]);

  /* -------- Build roadmap items -------- */
  const { items: roadmapItems, totalSteps } = useMemo(() => {
    let items = [];
    let g = 0;

    if (!course) return { items, totalSteps: 0 };

    const totalSections = course.sections.length;

    course.sections.forEach((section, secIdx) => {
      const totalUnitsInSection = section.units.length;

      section.units.forEach((unit, unitIdx) => {
        // اولین گام این یونیت (برای اسکرول در مدال انتخاب یونیت)
        unitAnchorIndex.current[`${secIdx}-${unitIdx}`] = g;

        unit.steps.forEach((st, stepIdxInUnit) => {
          items.push({
            kind: "step",
            stepType: st.type,
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

        const isLastUnit = secIdx === totalSections - 1 && unitIdx === totalUnitsInSection - 1;
        if (!isLastUnit) {
          items.push({
            kind: "unit-separator",
            unitIdx,
            unitTitle: unit.title,
            color: getUnitColor(unitIdx),
            key: `separator-${secIdx}-${unitIdx}`,
          });
        }
      });
    });

    return { items, totalSteps: g };
  }, [course]);

  /* -------- Active header color on scroll -------- */
  useEffect(() => {
    const onScroll = () => {
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
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [totalSteps]);

  const progress = learning.progress || 0;

  const currentStep =
    roadmapItems.find(
      (it) => it.kind === "step" && it.globalStepIndex === Math.max(activeStepIdx, progress)
    ) || {};

  const headerColor = currentStep.color || UNIT_COLORS[0];

  /* -------- Jump to a unit (from modal) -------- */
  const jumpToUnit = (secIdx, unitIdx) => {
    const firstIdx = unitAnchorIndex.current[`${secIdx}-${unitIdx}`];
    if (typeof firstIdx === "number" && stepRefs.current[firstIdx]) {
      setUnitPickerOpen(false);
      stepRefs.current[firstIdx].scrollIntoView({ behavior: "smooth", block: "center" });
      // بعد از اسکرول کمی هایلایت لطیف
      stepRefs.current[firstIdx].animate(
        [{ filter: "brightness(1.2)" }, { filter: "brightness(1)" }],
        { duration: 800, easing: "ease-out" }
      );
    }
  };

  /* -------- UI -------- */
  if (loading) {
    return (
      <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  if (!course) return <Typography>دوره‌ای یافت نشد</Typography>;

  return (
    <Box maxWidth="40rem" mx="auto" mt={6} px={2} sx={{ minHeight: "100vh" }}>
      {/* هدر چسبان (کلیک = باز شدن مدال انتخاب یونیت/سکشن) */}
      <Box
        role="button"
        aria-label="نمایش سکشن‌ها و یونیت‌ها"
        onClick={() => setUnitPickerOpen(true)}
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
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          transition: "background-color 0.3s",
          cursor: "pointer",
        }}
      >
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {currentStep.sectionTitle || ""}
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, opacity: 0.95 }}>
            {currentStep.unitTitle || ""}
          </Typography>
        </Box>

        {/* دکمه بازگشت به لیست دوره‌ها – کلیک روی آن نباید مدال را باز کند */}
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            router.push("/roadmap");
          }}
          sx={{
            color: "#fff",
            borderColor: "#fff",
            px: 2.2,
            "&:hover": { borderColor: "#fff", background: "rgba(255,255,255,.15)" },
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          بازگشت
          <KeyboardArrowDownIcon sx={{ transform: "rotate(90deg)" }} />
        </Button>
      </Box>

      {/* مسیر سینوسی */}
      <Box margin="auto" maxWidth="18rem" display="flex" flexDirection="column" gap={0.3} alignItems="stretch">
        {roadmapItems.map((item) => {
          if (item.kind === "step") {
            const isDone = (learning.correct || []).includes(item.globalStepIndex);
            const isLocked = item.globalStepIndex > progress;
            const isActive = item.globalStepIndex === progress;
            const alignSelf = positions[item.globalStepIndex % positions.length];

            // آیکن داخل دایره: همیشه آیکن نوع گام، فقط استایل تغییر می‌کند
            const innerIcon = isActive ? (
              <PlayArrowIcon sx={{ fontSize: 30 }} />
            ) : (
              typeIcon(item.stepType, { fontSize: 26 })
            );

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
                    !isLocked && router.push(`/course/${course._id}/step/${item.globalStepIndex}`)
                  }
                  sx={{
                    background: item.color,
                    color: "#fff",
                    borderRadius: "50%",
                    width: 60,
                    height: 60,
                    minWidth: 60,
                    p: 0,
                    mb: 0.1,
                    transition: "transform .2s, box-shadow .2s, opacity .2s, border-color .2s",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.35 : 1,
                    // حلقه‌ها / درخشش‌ها
                    boxShadow: `
                      inset 0 -4px 6px rgba(0,0,0,0.15),
                      inset 0  4px 6px rgba(255,255,255,0.3),
                      ${isActive ? `0 0 18px 6px ${item.color}88` : "none"}
                    `,
                    border: `3px solid ${
                      isActive ? "#fff" : isDone ? "#66DE93" : isLocked ? `${item.color}99` : item.color
                    }`,
                    "&:hover": !isLocked && {
                      transform: "scale(1.1)",
                      boxShadow: `0 0 22px ${item.color}B0`,
                    },
                  }}
                  disableElevation
                >
                  {innerIcon}
                </Button>
              </Box>
            );
          }

          // جداکننده
          return (
            <UnitSeparator key={item.key} unitTitle={item.unitTitle} color={item.color} />
          );
        })}
      </Box>

      {/* مدال انتخاب سکشن/یونیت */}
      <Dialog
        open={unitPickerOpen}
        onClose={() => setUnitPickerOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>پرش سریع به یونیت</DialogTitle>
        <DialogContent dividers>
          <List dense sx={{ width: "100%" }}>
            {course.sections.map((sec, sIdx) => (
              <Box key={sIdx}>
                <ListSubheader
                  disableSticky
                  sx={{ bgcolor: "transparent", color: "text.primary", fontWeight: 800, px: 0 }}
                >
                  {sec.title}
                </ListSubheader>
                {sec.units.map((u, uIdx) => (
                  <ListItemButton
                    key={`${sIdx}-${uIdx}`}
                    sx={{ borderRadius: 2, my: 0.25 }}
                    onClick={() => jumpToUnit(sIdx, uIdx)}
                  >
                    {u.title}
                  </ListItemButton>
                ))}
                {sIdx !== course.sections.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
