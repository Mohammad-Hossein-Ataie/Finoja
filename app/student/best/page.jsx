"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Avatar,
  LinearProgress,
  useTheme,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";

// Function to generate color from name
function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

// Function to generate initials
function stringAvatar(name, family) {
  return {
    sx: {
      bgcolor: stringToColor(name + family),
      width: 36,
      height: 36,
      fontSize: "0.9rem",
    },
    children: `${name?.[0] || ""}${family?.[0] || ""}`,
  };
}

export default function BestStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [leaders, setLeaders] = useState([]);
  const theme = useTheme();

  /* ---------- Load courses ---------- */
  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((c) => {
        setCourses(c);
        if (c[0]?._id) setCourseId(c[0]._id);
        setLoading(false);
      });
  }, []);

  /* ---------- Load leaderboard ---------- */
  useEffect(() => {
    if (!courseId) return;
    setLeaders([]);
    fetch(`/api/leaderboard/${courseId}?limit=20`)
      .then((r) => r.json())
      .then(setLeaders);
  }, [courseId]);

  if (loading)
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

  const topXP = leaders.length > 0 ? Math.max(...leaders.map(s => s.xp)) : 0;

  return (
    <Box maxWidth="md" mx="auto" mt={2} px={2}>
      {/* Header with gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          color: "white",
          py: 3,
          px: 4,
          borderRadius: 3,
          boxShadow: 3,
          mb: 4,
          textAlign: "center",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          justifyContent="center"
        >
          <EmojiEventsIcon sx={{ fontSize: 42, color: "#FFD700" }} />
          <Typography variant="h4" fontWeight="bold">
            جدول رقابت‌ها
          </Typography>
        </Stack>
        <Typography variant="body1" mt={1} sx={{ opacity: 0.9 }}>
          برترین‌های دوره را در جدول رده‌بندی مشاهده کنید
        </Typography>
      </Box>

      {/* Course selector */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel sx={{ color: theme.palette.primary.main }}>
          انتخاب دوره
        </InputLabel>
        <Select
          value={courseId}
          label="انتخاب دوره"
          onChange={(e) => setCourseId(e.target.value)}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
              borderColor: theme.palette.divider,
            },
          }}
        >
          {courses.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Leaderboard */}
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f7ff",
              }}
            >
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 16 }}>
                رتبه
              </TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: 16 }}>دانشجو</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: 16 }}>
                امتیاز
              </TableCell>
              <TableCell sx={{ width: "35%", fontWeight: 800, fontSize: 16 }}>
                پیشرفت
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    هنوز هیچ امتیازی ثبت نشده است!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {leaders.map((s, idx) => (
              <TableRow
                key={s.mobile}
                hover
                sx={{
                  "&:nth-of-type(odd)": {
                    bgcolor: theme.palette.mode === "dark" ? "#121212" : "#fafafa",
                  },
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                {/* Rank */}
                <TableCell align="center" sx={{ position: "relative" }}>
                  {idx === 0 && (
                    <WhatshotIcon
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#FFD700",
                        fontSize: 28,
                      }}
                    />
                  )}
                  {idx === 1 && (
                    <MilitaryTechIcon
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#C0C0C0",
                        fontSize: 28,
                      }}
                    />
                  )}
                  {idx === 2 && (
                    <MilitaryTechIcon
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#CD7F32",
                        fontSize: 28,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor:
                        idx === 0
                          ? "rgba(255, 215, 0, 0.2)"
                          : idx === 1
                          ? "rgba(192, 192, 192, 0.2)"
                          : idx === 2
                          ? "rgba(205, 127, 50, 0.2)"
                          : "transparent",
                      fontWeight: 700,
                      fontSize: idx < 3 ? 18 : 16,
                      color:
                        idx === 0
                          ? "#FFD700"
                          : idx === 1
                          ? "#C0C0C0"
                          : idx === 2
                          ? "#CD7F32"
                          : "inherit",
                    }}
                  >
                    {idx + 1}
                  </Box>
                </TableCell>

                {/* Student */}
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar {...stringAvatar(s.name || "", s.family || "")} />
                    <Typography fontWeight={600}>
                      {s.name} {s.family}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* XP */}
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      bgcolor: theme.palette.primary.light,
                      px: 2,
                      py: 0.5,
                      borderRadius: 20,
                      fontWeight: 700,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 18, mr: 1 }} />
                    {s.xp} XP
                  </Box>
                </TableCell>

                {/* Progress */}
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LinearProgress
                      variant="determinate"
                      value={topXP ? (s.xp / topXP) * 100 : 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        flexGrow: 1,
                        bgcolor:
                          theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                        },
                      }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {topXP ? Math.round((s.xp / topXP) * 100) : 0}%
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Gamification tips */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          برای قرار گرفتن در جدول برترها، فعالیت‌های آموزشی خود را افزایش دهید!
        </Typography>
      </Box>
    </Box>
  );
}