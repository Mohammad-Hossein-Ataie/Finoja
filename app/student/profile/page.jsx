// ================= app/(dashboard)/profile/StudentProfilePage.jsx =================
"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  LinearProgress,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EmojiEventsIcon      from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon       from "@mui/icons-material/AccessTime";

/* ---------- Helper: آواتار حروف اول ---------- */
const avatarURL = (n = "", f = "") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(`${n} ${f}`)}&background=2477F3&color=fff`;

export default function StudentProfilePage() {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);

  /* ---------- دریافت پروفایل ---------- */
  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) { setLoad(false); return; }

    fetch("/api/students/profile", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ mobile }),
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoad(false));
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
        خطا در بارگیری پروفایل
      </Typography>
    );

  const joinDate = new Intl.DateTimeFormat("fa-IR", {
    year : "numeric",
    month: "long",
    day  : "numeric",
  }).format(new Date(data.createdAt));

  return (
    <Box maxWidth="sm" mx="auto" mt={6} px={2}>
      <Paper elevation={4} sx={{ borderRadius: 6, overflow: "hidden" }}>
        {/* هدر */}
        <Box sx={{ position: "relative", bgcolor: "#2477F3", height: 120 }}>
          <Avatar
            src={avatarURL(data.name, data.family)}
            sx={{
              width: 120,
              height: 120,
              position: "absolute",
              bottom: -60,
              left: "50%",
              transform: "translateX(-50%)",
              border: "4px solid #fff",
            }}
          />
        </Box>

        <Box pt={8} pb={4} px={3}>
          <Typography variant="h5" textAlign="center" fontWeight={700} mb={.5}>
            {data.name} {data.family}
          </Typography>
          <Typography textAlign="center" color="text.secondary" mb={3}>
            {data.mobile}
            {data.email && ` • ${data.email}`}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" mb={4}>
            <Chip icon={<EmojiEventsIcon />} label={`XP کل: ${data.totalXp}`} color="success" />
            <Chip icon={<AccessTimeIcon />} label={`عضویت از ${joinDate}`} />
          </Stack>

          {/* لیست دوره‌ها */}
          {data.learning.length > 0 && (
            <>
              <Typography fontWeight={700} mb={1.5} textAlign="center">
                دوره‌های شما
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {data.learning.sort((a,b)=>b.xp-a.xp).map((l) => (
                  <Paper key={l.courseId} sx={{ p:2, borderRadius:4 }} elevation={1}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <WorkspacePremiumIcon sx={{ color: "#FFC107" }} />
                      <Box flex={1}>
                        <Typography fontWeight={600}>{l.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          پیشرفت: {l.progress} • XP: {l.xp} {l.finished && "• پایان‌یافته"}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={l.progress ? Math.min(100, (l.progress /  (l.totalSteps||100))*100) : 0}
                          sx={{ mt:.8, height:6, borderRadius:3 }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
