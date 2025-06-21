"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Stack } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";

export default function DashboardHome() {
  const [stats, setStats] = useState({ courses: 0, teachers: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [courses, teachers] = await Promise.all([
        fetch("/api/courses").then(res => res.json()),
        fetch("/api/teachers").then(res => res.json())
      ]);
      setStats({
        courses: Array.isArray(courses) ? courses.length : 0,
        teachers: Array.isArray(teachers) ? teachers.length : 0
      });
    }
    fetchStats();
  }, []);

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>داشبورد</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, borderRadius: 3, boxShadow: 3 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 50 }} />
            <Stack>
              <Typography fontSize={22} fontWeight={700}>{stats.courses}</Typography>
              <Typography color="text.secondary" fontWeight={600}>تعداد دوره‌ها</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, borderRadius: 3, boxShadow: 3 }}>
            <PersonIcon color="secondary" sx={{ fontSize: 50 }} />
            <Stack>
              <Typography fontSize={22} fontWeight={700}>{stats.teachers}</Typography>
              <Typography color="text.secondary" fontWeight={600}>تعداد اساتید</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
