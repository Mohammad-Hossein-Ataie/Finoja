"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Pagination,
  useTheme,
  Chip,
  Divider,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// ====== Finoja brand palette (from doc) ======
const BRAND = "#2477F3"; // Finoja Blue
const SKY = "#D2E7FF"; // Sky Blue
const ACC = "#66DE93"; // Lime Green
const BG = "#F9FAFB"; // Off White
const TEXT = "#1A2233"; // Dark Navy
const ERR = "#F35C4A"; // Alert Red

// آدرس پابلیک S3 برای آواتارها (fallback اگر env نبود)
const S3_PUBLIC_BASE =
  process.env.NEXT_PUBLIC_S3_PUBLIC_BASE ||
  `${
    process.env.NEXT_PUBLIC_LIARA_ENDPOINT || "https://storage.c2.liara.space"
  }/${process.env.NEXT_PUBLIC_LIARA_BUCKET || "finoja"}`;

// Helpers: رنگ ثابت برای آواتار حروف
function stringToColor(string) {
  let hash = 0,
    i;
  for (i = 0; i < string.length; i += 1)
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  let color = "#";
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}
function initialsAvatar(name, family) {
  return {
    sx: {
      bgcolor: stringToColor(`${name || ""}${family || ""}`),
      width: 36,
      height: 36,
      fontSize: "0.9rem",
    },
    children: `${name?.[0] || ""}${family?.[0] || ""}`,
  };
}

export default function BestStudentsPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  const [leaders, setLeaders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [meCard, setMeCard] = useState(null);
  const mobileMe =
    typeof window !== "undefined"
      ? localStorage.getItem("student_mobile")
      : null;

  // ---------- Load courses (summary) ----------
  useEffect(() => {
    fetch("/api/courses?summary=1")
      .then((r) => r.json())
      .then((c) => {
        setCourses(c || []);
        if (c?.[0]?._id) setCourseId(c[0]._id);
        setLoading(false);
      });
  }, []);

  // ---------- Load leaderboard page ----------
  const fetchPage = async (cid, p) => {
    if (!cid) return;
    const meParam = mobileMe ? `&rankOf=${mobileMe}` : "";
    const res = await fetch(
      `/api/leaderboard/${cid}?limit=${limit}&page=${p}${meParam}`
    );
    const data = await res.json();
    setLeaders(data.leaders || []);
    setTotal(data.total || 0);
    setPage(data.page || 1);
    if (data.me) setMeCard(data.me);
  };

  useEffect(() => {
    setLeaders([]);
    if (courseId) fetchPage(courseId, 1);
  }, [courseId]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const jumpToMyRank = () => {
    if (!meCard?.rank) return;
    const myPage = Math.max(1, Math.ceil(meCard.rank / limit));
    fetchPage(courseId, myPage);
  };

  if (loading) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={2} px={2}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2, // گوشه تیز
          bgcolor: BRAND,
          color: "#fff",
          py: 2.5,
          px: 3,
          textAlign: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <EmojiEventsIcon sx={{ fontSize: 28, color: "#FFD700" }} />
          <Typography variant="h6" fontWeight={800}>
            جدول رقابت‌ها
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
          جایگاه خودت را در بین دانشجویان هر دوره ببین.
        </Typography>
      </Paper>

      {/* Course selector */}
      <FormControl fullWidth sx={{ my: 2.5 }}>
        <InputLabel sx={{ color: BRAND }}>انتخاب دوره</InputLabel>
        <Select
          value={courseId}
          label="انتخاب دوره"
          onChange={(e) => setCourseId(e.target.value)}
          sx={{
            borderRadius: 2,
            bgcolor: "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: SKY,
              borderWidth: 2,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: BRAND },
            "& .MuiSvgIcon-root": { color: BRAND },
          }}
        >
          {courses.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* My rank card */}
      {meCard && (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            mb: 2,
            px: 2,
            py: 1.5,
            bgcolor: "#fff",
            borderColor: SKY,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Chip
                label={`XP ${meCard.xp}`}
                color="success"
                size="small"
                icon={<EmojiEventsIcon />}
                sx={{ fontWeight: 700 }}
              />
              <Typography color="text.secondary" variant="body2">
                رتبهٔ شما: <b>{meCard.rank}</b>
              </Typography>
            </Stack>
            <Tooltip title="پرش به رتبهٔ من">
              <span>
                <Button
                  size="small"
                  onClick={jumpToMyRank}
                  variant="outlined"
                  sx={{ borderRadius: 2, borderColor: SKY }}
                >
                  برو به رتبهٔ من
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      )}

      {/* Table (cardified rows for موبایل هم خوانا) */}
      <Paper
        elevation={2}
        sx={{ borderRadius: 2, overflow: "hidden", border: `1px solid ${SKY}` }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography fontWeight={800}>دانشجو</Typography>
          <Typography fontWeight={800}>رتبه / امتیاز</Typography>
        </Box>

        <Divider />

        <Box>
          {leaders.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                هنوز امتیازی ثبت نشده است.
              </Typography>
            </Box>
          )}

          {leaders.map((s, idx) => {
            const absoluteRank = (page - 1) * limit + idx + 1;
            const isTop1 = absoluteRank === 1;
            const isTop2 = absoluteRank === 2;
            const isTop3 = absoluteRank === 3;

            const rankBadge = isTop1 ? (
              <WhatshotIcon sx={{ color: "#FFD700" }} />
            ) : isTop2 ? (
              <MilitaryTechIcon sx={{ color: "#C0C0C0" }} />
            ) : isTop3 ? (
              <MilitaryTechIcon sx={{ color: "#CD7F32" }} />
            ) : (
              <Typography fontWeight={800}>{absoluteRank}</Typography>
            );

            return (
              <Box
                key={s.mobile}
                sx={{
                  px: 2,
                  py: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: `1px solid ${BG}`,
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {s.avatarUrl ? (
                    <Avatar
                      src={
                        s.avatarUrl.startsWith("http")
                          ? s.avatarUrl
                          : `${S3_PUBLIC_BASE}/${s.avatarUrl}`
                      }
                      alt={`${s.name} ${s.family}`}
                      sx={{ width: 36, height: 36 }}
                      imgProps={{ referrerPolicy: "no-referrer" }}
                    />
                  ) : (
                    <Avatar {...initialsAvatar(s.name, s.family)} />
                  )}
                  <Typography fontWeight={700} color={TEXT}>
                    {s.name} {s.family}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 2,
                      bgcolor: SKY,
                      color: BRAND,
                      fontWeight: 800,
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 18 }} />
                    <span>XP {s.xp}</span>
                  </Box>
                  {rankBadge}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Pagination */}
      {pageCount > 1 && (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          mt={2}
        >
          <IconButton
            onClick={() => page > 1 && fetchPage(courseId, page - 1)}
            disabled={page <= 1}
            sx={{ border: `1px solid ${SKY}`, borderRadius: 2 }}
            aria-label="صفحه قبل"
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2">
            صفحه {page} از {pageCount}
          </Typography>
          <IconButton
            onClick={() => page < pageCount && fetchPage(courseId, page + 1)}
            disabled={page >= pageCount}
            sx={{ border: `1px solid ${SKY}`, borderRadius: 2 }}
            aria-label="صفحه بعد"
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}

      {/* Hint */}
      <Box mt={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          برای صعود در جدول، فعالیت‌های آموزشی و حل تمرین‌ها را ادامه بده و XP
          بیشتری بگیر.
        </Typography>
      </Box>
    </Box>
  );
}
