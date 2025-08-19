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
  Tooltip,
  IconButton,
} from "@mui/material";

// آیکن‌ها برای نوع گام
import StarIcon from "@mui/icons-material/Star";
import HelpCenterOutlinedIcon from "@mui/icons-material/HelpCenterOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ShortTextOutlinedIcon from "@mui/icons-material/ShortTextOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

const UNIT_COLORS = ["#2477F3", "#66DE93", "#FDA949", "#AC7FF4", "#F35C4A", "#5DC6EE", "#F9C846"];
const positions = ["flex-start", "center", "flex-end", "center"];
const getUnitColor = (i) => UNIT_COLORS[i % UNIT_COLORS.length];

const typeFa = (t) => {
  switch (t) {
    case "explanation":
      return "توضیح";
    case "multiple-choice":
      return "چهارجوابی";
    case "multi-answer":
      return "چندپاسخی";
    case "fill-in-the-blank":
      return "جای‌خالی";
    case "matching":
      return "تطبیق";
    default:
      return "گام";
  }
};
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

function UnitSeparator({ unitTitle, color }) {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", my: 2 }}>
      <Typography variant="body1" fontWeight="bold" sx={{ color, mb: 1, px: 2, borderRadius: 2 }}>
        {unitTitle}
      </Typography>
      <Box sx={{ width: "100%", height: 2, background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
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
  const unitAnchorIndex = useRef({});
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);

  // اندازه هدر برای offset اسکرول
  const headerRef = useRef(null);
  const [headerOffset, setHeaderOffset] = useState(120);
  useEffect(() => {
    const measure = () => {
      if (!headerRef.current) return;
      const h = headerRef.current.getBoundingClientRect().height;
      setHeaderOffset(h + 24);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // دریافت داده
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

  // ساخت آیتم‌ها
  const { items: roadmapItems, totalSteps } = useMemo(() => {
    let items = [];
    let g = 0;
    unitAnchorIndex.current = {};

    if (!course) return { items, totalSteps: 0 };

    course.sections.forEach((section, secIdx) => {
      section.units.forEach((unit, unitIdx) => {
        items.push({
          kind: "unit-separator",
          key: `separator-${secIdx}-${unitIdx}`,
          unitIdx,
          unitTitle: unit.title,
          color: getUnitColor(unitIdx),
        });
        unitAnchorIndex.current[`${secIdx}-${unitIdx}`] = g;

        unit.steps.forEach((st, stepIdxInUnit) => {
          items.push({
            kind: "step",
            stepType: st.type,
            stepTitle: st.title || "",
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
      });
    });

    return { items, totalSteps: g };
  }, [course]);

  // اسکرول اولیه به progress
  const progress = learning.progress || 0;
  const didInitialScroll = useRef(false);

  const scrollToIndex = (idx, { behavior = "smooth" } = {}) => {
    const el = stepRefs.current[idx];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior });
    try {
      el.animate([{ filter: "brightness(1.2)" }, { filter: "brightness(1)" }], { duration: 800, easing: "ease-out" });
    } catch {}
  };

  useEffect(() => {
    if (loading || !totalSteps || didInitialScroll.current) return;
    const target = Math.min(Math.max(progress, 0), totalSteps - 1);
    requestAnimationFrame(() => {
      scrollToIndex(target, { behavior: "auto" });
      setTimeout(() => scrollToIndex(target), 30);
    });
    didInitialScroll.current = true;
  }, [loading, totalSteps, progress, headerOffset]);

  // محاسبه استپ فعال برای بنر
  useEffect(() => {
    const onScroll = () => {
      const anchor = headerOffset + 8;
      let minDiff = Infinity;
      let activeIdx = 0;
      stepRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const diff = Math.abs(ref.getBoundingClientRect().top - anchor);
        if (diff < minDiff) {
          minDiff = diff;
          activeIdx = idx;
        }
      });
      setActiveStepIdx(activeIdx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerOffset, totalSteps]);

  const currentStep =
    useMemo(
      () =>
        roadmapItems.find(
          (it) => it.kind === "step" && it.globalStepIndex === activeStepIdx
        ) || {},
      [roadmapItems, activeStepIdx]
    );

  const headerColor = currentStep.color || UNIT_COLORS[0];

  // پرش سریع به یونیت
  const jumpToUnit = (secIdx, unitIdx) => {
    const firstIdx = unitAnchorIndex.current[`${secIdx}-${unitIdx}`];
    if (typeof firstIdx === "number") {
      setUnitPickerOpen(false);
      setTimeout(() => scrollToIndex(firstIdx), 10);
    }
  };

  if (loading) {
    return (
      <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  if (!course) return <Typography>دوره‌ای یافت نشد</Typography>;

  const CIRCLE_SIZE = 66; // px
  const LOCKED_OPACITY = 0.45;

  return (
    <Box maxWidth="40rem" mx="auto" mt={6} px={2} sx={{ minHeight: "100vh" }}>
      {/* هدر چسبان */}
      <Box
        ref={headerRef}
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
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          transition: "background-color 0.3s",
          cursor: "pointer",
        }}
      >
        <Tooltip title="فهرست سکشن‌ها و یونیت‌ها">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setUnitPickerOpen(true);
            }}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,.18)",
              "&:hover": { bgcolor: "rgba(255,255,255,.28)" },
              mr: 1,
            }}
            aria-label="باز کردن فهرست یونیت‌ها"
          >
            <MenuBookOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5, opacity: 0.95 }}>
            {currentStep.unitTitle || ""}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {currentStep.sectionTitle || ""}
          </Typography>
        </Box>

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

      {/* مسیر */}
      <Box margin="auto" maxWidth="18rem" display="flex" flexDirection="column" gap={0.5} alignItems="stretch">
        {roadmapItems.map((item) => {
          if (item.kind === "unit-separator") {
            return <UnitSeparator key={item.key} unitTitle={item.unitTitle} color={item.color} />;
          }

          const isDone = (learning.correct || []).includes(item.globalStepIndex);
          const isLocked = item.globalStepIndex > progress;
          const isProgressStep = item.globalStepIndex === progress;
          const alignSelf = positions[item.globalStepIndex % positions.length];

          const tooltipText = `${typeFa(item.stepType)}${item.stepTitle ? " — " + item.stepTitle : ""}`;
          const baseColor = item.color;

          // رنگ حاشیه
          const borderColor = isProgressStep
            ? "#fff"
            : isDone
            ? "#66DE93"
            : baseColor;

          return (
            <Box
              key={`${item.secIdx}-${item.unitIdx}-${item.stepIdx}`}
              display="flex"
              flexDirection="column"
              alignItems={alignSelf}
              sx={{ width: "100%", position: "relative" }}
              mb={0.4}
              ref={(el) => (stepRefs.current[item.globalStepIndex] = el)}
            >
              {/* بالون شروع فقط روی progress */}
              {isProgressStep && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    px: 1.8,
                    py: 0.6,
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#0b2",
                    bgcolor: "#E9FFE9",
                    border: "2px solid #0b2",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                    letterSpacing: ".5px",
                    textTransform: "uppercase",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderTop: "8px solid #E9FFE9",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      bottom: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderTop: "10px solid #0b2",
                      zIndex: -1,
                    },
                  }}
                >
                  شروع
                </Box>
              )}

              <Tooltip title={tooltipText}>
                <span>
                  <Button
                    onClick={() =>
                      !isLocked && router.push(`/course/${course._id}/step/${item.globalStepIndex}`)
                    }
                    sx={{
                      width: CIRCLE_SIZE,
                      height: CIRCLE_SIZE,
                      minWidth: CIRCLE_SIZE,
                      borderRadius: "50%",
                      p: 0,
                      mb: 0.1,
                      // پس‌زمینه همیشه رنگ یونیت باشد (برای قفل‌ها هم)
                      background: `radial-gradient(circle at 30% 30%, ${baseColor} 0%, ${baseColor}CC 70%, ${baseColor}BB 100%)`,
                      color: "#fff",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      opacity: isLocked ? LOCKED_OPACITY : 1, // ← فقط کم‌رنگ
                      transition: "transform .2s, box-shadow .2s, border-color .2s, opacity .2s",
                      boxShadow: `
                        0 6px 0 ${isLocked ? `${baseColor}33` : `${baseColor}66`},
                        0 12px 18px ${isLocked ? `${baseColor}26` : `${baseColor}4D`},
                        inset 0 -6px 8px rgba(0,0,0,0.18),
                        inset 0  6px 8px rgba(255,255,255,0.25)
                        ${isProgressStep ? `, 0 0 24px ${baseColor}80` : ""}
                      `,
                      border: `4px solid ${
                        isLocked ? `${baseColor}99` : borderColor
                      }`,
                      "&:hover": !isLocked && {
                        transform: "translateY(-3px) scale(1.06)",
                        boxShadow: `0 10px 20px ${baseColor}80, inset 0 -6px 8px rgba(0,0,0,.18), inset 0 6px 8px rgba(255,255,255,.28)`,
                      },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    disableElevation
                    disabled={isLocked}
                    aria-label={tooltipText}
                  >
                    {typeIcon(item.stepType, { fontSize: 28 })}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* مدال انتخاب سکشن/یونیت */}
      <Dialog open={unitPickerOpen} onClose={() => setUnitPickerOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>پرش سریع به یونیت</DialogTitle>
        <DialogContent dividers>
          <List dense sx={{ width: "100%" }}>
            {course.sections.map((sec, sIdx) => (
              <Box key={sIdx}>
                <ListSubheader disableSticky sx={{ bgcolor: "transparent", color: "text.primary", fontWeight: 800, px: 0 }}>
                  {sec.title}
                </ListSubheader>
                {sec.units.map((u, uIdx) => (
                  <ListItemButton key={`${sIdx}-${uIdx}`} sx={{ borderRadius: 2, my: 0.25 }} onClick={() => jumpToUnit(sIdx, uIdx)}>
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
