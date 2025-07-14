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
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function BestStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [leaders, setLeaders] = useState([]);

  /* ---------- بارگذاری دوره‌ها ---------- */
  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((c) => {
        setCourses(c);
        if (c[0]?._id) setCourseId(c[0]._id);
        setLoading(false);
      });
  }, []);

  /* ---------- بارگذاری لیدربرد ---------- */
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
    <Box maxWidth="sm" mx="auto" mt={5} px={2}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        justifyContent="center"
        mb={3}
      >
        <EmojiEventsIcon sx={{ color: "#f9a825", fontSize: 40 }} />
        <Typography variant="h5" fontWeight="bold">
          لیدربرد دوره
        </Typography>
      </Stack>

      {/* انتخاب دوره */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>دوره</InputLabel>
        <Select
          value={courseId}
          label="دوره"
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* جدول نفرات برتر */}
      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell>نام</TableCell>
              <TableCell align="center">XP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaders.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  هنـوز کسی امتیاز نگرفته
                </TableCell>
              </TableRow>
            )}
            {leaders.map((s, idx) => (
              <TableRow key={s.mobile}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  {idx + 1}
                </TableCell>
                <TableCell>
                  {s.name} {s.family}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  {s.xp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
