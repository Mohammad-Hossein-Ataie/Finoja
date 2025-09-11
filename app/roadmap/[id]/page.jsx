// ===============================
// FILE: app/roadmap/[id]/page.jsx
// ===============================
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

/* ---------- Icons ---------- */
import StarIcon from "@mui/icons-material/Star";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ShortTextOutlinedIcon from "@mui/icons-material/ShortTextOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import SmartDisplayOutlinedIcon from "@mui/icons-material/SmartDisplayOutlined";
import GraphicEqOutlinedIcon from "@mui/icons-material/GraphicEqOutlined";

/* ---------- Labels (FA) ---------- */
const TYPE_LABELS = {
  explanation: "توضیحی",
  "multiple-choice": "چهارگزینه‌ای",
  "multi-answer": "چندگزینه‌ای (چند پاسخ صحیح)",
  matching: "تطبیق",
  video: "ویدیویی",
  audio: "صوتی",
  "fill-in-the-blank": "جای‌خالی",
};
const typeLabel = (t) => TYPE_LABELS[t] || "گام";

/* ---------- Icon mapper ---------- */
const typeIcon = (t, sx) => {
  switch (t) {
    case "explanation":
      return <MenuBookOutlinedIcon sx={sx} />;
    case "multiple-choice":
      return <QuizOutlinedIcon sx={sx} />;
    case "multi-answer":
      return <FactCheckOutlinedIcon sx={sx} />;
    case "fill-in-the-blank":
      return <ShortTextOutlinedIcon sx={sx} />;
    case "matching":
      return <LinkOutlinedIcon sx={sx} />;
    case "video":
      return <SmartDisplayOutlinedIcon sx={sx} />;
    case "audio":
      return <GraphicEqOutlinedIcon sx={sx} />;
    default:
      return <StarIcon sx={sx} />;
  }
};

/* ---------- Colors ---------- */
const UNIT_COLORS = ["#2477F3", "#66DE93", "#FDA949", "#AC7FF4", "#F35C4A", "#5DC6EE", "#F9C846"];
const getUnitColor = (i) => UNIT_COLORS[i % UNIT_COLORS.length];
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};
const withAlpha = (hex, a) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/* ---------- Smooth serpentine path ---------- */
/** تنظیمات موج (می‌تونی با این 3 تا بازی کنی تا دقیقاً به حس دلخواهت برسه) */
const WAVE_CENTER = 0.5;     // مرکز موج (نسبت عرض ظرف)
const WAVE_AMPL = 0.38;      // دامنه موج (0..0.5) → هرچه بیشتر، نزدیک‌تر به لبه‌ها
const WAVE_PERIOD = 9;       // هر چند «گام» یک سیکل کامل بزند (بزرگ‌تر = نرم‌تر)

/** موقعیت افقی نرم بین 0..1 (RTL/LTR-safe چون بعداً insetInlineStart می‌زنیم) */
const softPhase = (i) => {
  const t = (i / WAVE_PERIOD) * 2 * Math.PI;      // 0..2π
  // موج اصلی + هارمونیک دوم خیلی کم برای حس «S» طبیعی‌تر
  const s = Math.sin(t) * 0.9 + Math.sin(2 * t) * 0.1;
  // Clamp تا به لبه ظرف نچسبد
  const p = WAVE_CENTER + WAVE_AMPL * s;
  return Math.min(0.92, Math.max(0.08, p));
};

/* ---------- Components ---------- */
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

/* =================================================================== */
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

  /* ---------- Fetch course + learning ---------- */
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

  /* ---------- Build flattened items ---------- */
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
          const stepId = (st._id || `${secIdx}-${unitIdx}-${stepIdxInUnit}`).toString();
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
            stepId,
          });
          g++;
        });
      });
    });
    return { items, totalSteps: g };
  }, [course]);

  /* ---------- Progress & section-of-progress ---------- */
  const rawProgress = learning.progress || 0;
  const startIndex = useMemo(
    () => (totalSteps > 0 ? Math.min(Math.max(rawProgress, 0), totalSteps - 1) : 0),
    [rawProgress, totalSteps]
  );
  const progressStep = useMemo(
    () => roadmapItems.find((it) => it.kind === "step" && it.globalStepIndex === startIndex),
    [roadmapItems, startIndex]
  );
  const progressSecIdx = progressStep?.secIdx ?? 0;

  /* ---------- Initial scroll to start ---------- */
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
    requestAnimationFrame(() => {
      scrollToIndex(startIndex, { behavior: "auto" });
      setTimeout(() => scrollToIndex(startIndex), 30);
    });
    didInitialScroll.current = true;
  }, [loading, totalSteps, startIndex, headerOffset]);

  /* ---------- Keep header colored & centered ---------- */
  useEffect(() => {
    const onScroll = () => {
      const anchor = headerOffset + 8;
      let minDiff = Infinity, activeIdx = 0;
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

  const currentStep = useMemo(
    () => roadmapItems.find((it) => it.kind === "step" && it.globalStepIndex === activeStepIdx) || {},
    [roadmapItems, activeStepIdx]
  );
  const headerColor = currentStep.color || UNIT_COLORS[0];

  /* ---------- Quick jumps ---------- */
  const jumpToUnit = (secIdx, unitIdx) => {
    const firstIdx = unitAnchorIndex.current[`${secIdx}-${unitIdx}`];
    if (typeof firstIdx === "number") {
      setUnitPickerOpen(false);
      setTimeout(() => scrollToIndex(firstIdx), 10);
    }
  };
  const jumpToStart = () => scrollToIndex(startIndex);

  /* ---------- Floating arrow visibility ---------- */
  const [showJump, setShowJump] = useState(false);
  const [jumpDown, setJumpDown] = useState(true);
  useEffect(() => {
    const evaluate = () => {
      const el = stepRefs.current[startIndex];
      if (!el) {
        setShowJump(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      const pageYOfStart = rect.top + window.scrollY - headerOffset;
      const scrollY = window.scrollY;

      const startVisible = rect.top < window.innerHeight - 60 && rect.bottom > headerOffset - 60;

      if (scrollY + 20 < pageYOfStart) setJumpDown(true);
      else if (scrollY - 20 > pageYOfStart) setJumpDown(false);

      setShowJump(!startVisible && totalSteps > 0);
    };
    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [startIndex, headerOffset, totalSteps]);

  /* ---------- Loading / not-found ---------- */
  if (loading) {
    return (
      <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  if (!course) return <Typography>دوره‌ای یافت نشد</Typography>;

  /* ---------- Sets for status ---------- */
  const CIRCLE_SIZE = 66;
  const ROW_HEIGHT = 84; // کمی بیشتر، تا موج نرم‌تر دیده شود
  const doneIdsSet = new Set(learning.doneIds || []);
  const correctIdsSet = new Set(learning.correctIds || []);
  const legacyCorrectIdxs = new Set(learning.correct || []);
  const isGradable = (t) =>
    t === "multiple-choice" || t === "multi-answer" || t === "matching" || t === "fill-in-the-blank";

  return (
    <Box maxWidth="40rem" mx="auto" mt={6} px={2} sx={{ minHeight: "100vh" }}>
      {/* Header */}
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
          transition: "background-color .3s",
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
            "&:hover": {
              borderColor: "#fff",
              background: "rgba(255,255,255,.15)",
            },
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          بازگشت
          <KeyboardArrowDownIcon sx={{ transform: "rotate(90deg)" }} />
        </Button>
      </Box>

      {/* Path */}
      <Box margin="auto" maxWidth="18rem" display="flex" flexDirection="column" gap={0.5} alignItems="stretch">
        {roadmapItems.map((item) => {
          if (item.kind === "unit-separator") {
            return <UnitSeparator key={item.key} unitTitle={item.unitTitle} color={item.color} />;
          }

          // وضعیت‌ها
          const isDone =
            doneIdsSet.has(item.stepId) ||
            correctIdsSet.has(item.stepId) ||
            legacyCorrectIdxs.has(item.globalStepIndex);

          const isFirstStepOfUnit = item.stepIdx === 0;
          const inCurrentSection = item.secIdx === progressSecIdx;
          const isProgressStep = item.globalStepIndex === startIndex;

          // 🔒 قفل/باز
          const isUnlocked = isDone || isProgressStep || (inCurrentSection && isFirstStepOfUnit);
          const isLocked = !isUnlocked;

          // ❌ پاسخِ غلط (فقط برای گام‌های قابل تصحیح)
          const isWrong =
            isGradable(item.stepType) &&
            doneIdsSet.has(item.stepId) &&
            !correctIdsSet.has(item.stepId) &&
            !legacyCorrectIdxs.has(item.globalStepIndex);

          const baseColor = item.color;
          const ringColor = isProgressStep ? "#fff" : isWrong ? "#FF6B6B" : isDone ? "#66DE93" : baseColor;
          const glowColor = isWrong ? "#FF6B6B" : baseColor;

          const tooltipText = `${typeLabel(item.stepType)}${item.stepTitle ? " — " + item.stepTitle : ""}`;

          // ← موقعیت افقی نرم (مثل دولینگو)
          const phase = softPhase(item.globalStepIndex); // 0..1
          const inlinePos = `calc(${(phase * 100).toFixed(2)}% - ${CIRCLE_SIZE / 2}px)`;
          const topPos = `calc((${ROW_HEIGHT}px - ${CIRCLE_SIZE}px)/2)`;

          return (
            <Box
              key={`${item.secIdx}-${item.unitIdx}-${item.stepIdx}`}
              sx={{ width: "100%", position: "relative", height: ROW_HEIGHT }}
              ref={(el) => (stepRefs.current[item.globalStepIndex] = el)}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: topPos,
                  insetInlineStart: inlinePos, // RTL/LTR-safe
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Badge "شروع" */}
                {isProgressStep && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -40,
                      insetInlineStart: "50%",
                      transform: "translateX(-50%)",
                      px: 1.8,
                      py: 0.6,
                      fontSize: 12,
                      fontWeight: 900,
                      color: baseColor,
                      bgcolor: withAlpha(baseColor, 0.12),
                      border: `2px solid ${baseColor}`,
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                      letterSpacing: ".5px",
                      textTransform: "uppercase",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -8,
                        insetInlineStart: "50%",
                        transform: "translateX(-50%)",
                        borderInlineStart: "8px solid transparent",
                        borderInlineEnd: "8px solid transparent",
                        borderTop: `8px solid ${withAlpha(baseColor, 0.12)}`,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        bottom: -10,
                        insetInlineStart: "50%",
                        transform: "translateX(-50%)",
                        borderInlineStart: "10px solid transparent",
                        borderInlineEnd: "10px solid transparent",
                        borderTop: `10px solid ${baseColor}`,
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
                        background: `radial-gradient(circle at 30% 30%, ${baseColor} 0%, ${baseColor}CC 70%, ${baseColor}BB 100%)`,
                        color: "#fff",
                        cursor: isLocked ? "not-allowed" : "pointer",
                        opacity: isLocked ? 0.45 : 1,
                        transition: "transform .2s, box-shadow .2s, border-color .2s, opacity .2s",
                        boxShadow: `
                          0 6px 0 ${isLocked ? `${glowColor}33` : `${glowColor}66`},
                          0 12px 18px ${isLocked ? `${glowColor}26` : `${glowColor}4D`},
                          inset 0 -6px 8px rgba(0,0,0,0.18),
                          inset 0  6px 8px rgba(255,255,255,0.25)
                          ${isProgressStep ? `, 0 0 24px ${glowColor}80` : ""}
                        `,
                        border: `4px solid ${isLocked ? `${baseColor}99` : ringColor}`,
                        "&:hover": !isLocked && {
                          transform: "translateY(-3px) scale(1.06)",
                          boxShadow: `0 10px 20px ${glowColor}80, inset 0 -6px 8px rgba(0,0,0,.18), inset 0 6px 8px rgba(255,255,255,.28)`,
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
            </Box>
          );
        })}
      </Box>

      {/* Floating jump-to-start */}
      {showJump && (
        <Tooltip title={jumpDown ? "پرش به پایین به «شروع»" : "پرش به بالا به «شروع»"} placement="right">
          <Box
            onClick={jumpToStart}
            role="button"
            aria-label="پرش به شروع"
            sx={{
              position: "fixed",
              bottom: 24,
              left: 24,
              zIndex: 40,
              width: 56,
              height: 56,
              borderRadius: 14,
              bgcolor: "rgba(10,16,24,.85)",
              border: "1px solid rgba(255,255,255,.08)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 10px 25px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform .15s ease, background .2s ease",
              "&:hover": { transform: "translateY(-2px)", bgcolor: "rgba(10,16,24,.92)" },
              "&:active": { transform: "translateY(0)" },
            }}
          >
            <ArrowUpwardRoundedIcon
              sx={{
                color: "#21A1FF",
                fontSize: 28,
                transform: jumpDown ? "rotate(180deg)" : "none",
                transition: "transform .15s ease",
              }}
            />
          </Box>
        </Tooltip>
      )}

      {/* Unit picker dialog */}
      <Dialog open={unitPickerOpen} onClose={() => setUnitPickerOpen(false)} fullWidth maxWidth="sm">
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
