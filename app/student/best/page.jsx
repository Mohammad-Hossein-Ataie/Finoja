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
  useTheme,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";

// ... stringToColor و stringAvatar عوض نشده

function stringToColor(string) {
  let hash = 0, i;
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

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((c) => {
        setCourses(c);
        if (c[0]?._id) setCourseId(c[0]._id);
        setLoading(false);
      });
  }, []);

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

  return (
    <Box maxWidth="md" mx="auto" mt={2} px={2}>
      {/* Header */}
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
          برترین‌های هر دوره را در جدول رده‌بندی مشاهده کنید
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
            borderRadius: 3,
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
          borderRadius: 3,
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
            </TableRow>
          </TableHead>
          <TableBody>
            {leaders.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
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
                <TableCell align="center" sx={{ position: "relative", width: 88 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      fontWeight: 700,
                      fontSize: 16,
                      bgcolor:
                        idx === 0
                          ? "rgba(255, 215, 0, 0.2)"
                          : idx === 1
                          ? "rgba(192, 192, 192, 0.2)"
                          : idx === 2
                          ? "rgba(205, 127, 50, 0.17)"
                          : "transparent",
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
                    {idx === 0 ? (
                      <WhatshotIcon sx={{ fontSize: 24, color: "#FFD700" }} />
                    ) : idx === 1 ? (
                      <MilitaryTechIcon sx={{ fontSize: 22, color: "#C0C0C0" }} />
                    ) : idx === 2 ? (
                      <MilitaryTechIcon sx={{ fontSize: 22, color: "#CD7F32" }} />
                    ) : (
                      idx + 1
                    )}
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
                      minWidth: 86,
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 18, mr: 1 }} />
                    <span>{s.xp} XP</span>
                  </Box>
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
