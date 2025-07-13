"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

function avatarUrl(name = "", family = "") {
  const n = `${name}%20${family}`.trim();
  return `https://ui-avatars.com/api/?name=${n}&background=2477F3&color=fff`;
}

export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) return;

    fetch("/api/students/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!data)
    return (
      <Typography textAlign="center" color="error" mt={8}>
        خطا در دریافت اطلاعات پروفایل
      </Typography>
    );

  return (
    <Box maxWidth="sm" mx="auto" mt={6} px={2}>
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 6 }}>
        {/* هدر */}
        <Box
          sx={{
            position: "relative",
            bgcolor: "#2477F3",
            color: "#fff",
            borderRadius: 4,
            py: 6,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <Avatar
            src={avatarUrl(data.name, data.family)}
            sx={{
              width: 100,
              height: 100,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: "4px solid #fff",
            }}
          />
        </Box>

        {/* بدنه */}
        <Box mt={9}>
          <Typography variant="h5" textAlign="center" fontWeight="bold" mb={1}>
            {data.name} {data.family}
          </Typography>
          <Typography textAlign="center" color="text.secondary" mb={3}>
            {data.mobile}
            {data.email && "  •  " + data.email}
          </Typography>

          {/* آنبوردینگ */}
          {data.onboarding && (
            <Box mb={4}>
              <Typography fontWeight="bold" mb={1.5}>
                اطلاعات آنبوردینگ
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip label={`🎯 هدف: ${data.onboarding.goal}`} />
                <Chip label={`📊 سطح: ${data.onboarding.level}`} />
                <Chip label={`⏱ زمان روزانه: ${data.onboarding.duration}`} />
              </Stack>
            </Box>
          )}

          {/* پیشرفت دوره‌ها */}
          {Array.isArray(data.learning) && data.learning.length > 0 && (
            <Box>
              <Typography fontWeight="bold" mb={1.5}>
                دوره‌های در حال یادگیری
              </Typography>

              {data.learning.map((l) => (
                <Box
                  key={l.courseId}
                  display="flex"
                  alignItems="center"
                  gap={1.2}
                  mb={1}
                >
                  <EmojiEventsIcon sx={{ color: "#66DE93" }} />
                  <Typography>
                    شناسه دوره: {l.courseId} ــ پیشرفت {l.progress} گام
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
