"use client";
import { useEffect, useState } from "react";
import { Box, Container, Typography, Button, Paper, CircularProgress, LinearProgress } from "@mui/material";
import { useRouter } from "next/navigation";

export default function RoadmapPage() {
  const [courses, setCourses] = useState([]);
  const [studentLearning, setStudentLearning] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) {
      router.replace("/");
      return;
    }
    Promise.all([
      fetch("/api/courses").then(res => res.json()),
      fetch("/api/students/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile })
      }).then(res => res.json())
    ]).then(([coursesRes, learningRes]) => {
      setCourses(coursesRes);
      const map = {};
      (learningRes.learning || []).forEach((l) => {
        map[l.courseId] = l;
      });
      setStudentLearning(map);
      setLoading(false);
    });
  }, []);

  const handleStartCourse = async (courseId, slug) => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) return;
    // اگه قبلا ثبت نشده اضافه کن
    await fetch("/api/students/learning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile,
        courseId,
        progress: 0,
        correct: [],
        wrong: [],
        finished: false
      })
    });
    router.push(`/roadmap/${slug}`);
  };

  if (loading) return <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={3}>
        دوره‌های یادگیری
      </Typography>
      <Box display="flex" flexDirection="column" gap={3}>
        {courses.map(course => {
          const learn = studentLearning[course._id] || {};
          const progress = course.sections?.length
            ? Math.floor((learn.progress || 0) / course.sections.length * 100)
            : 0;
          return (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }} key={course._id}>
              <Box flex={1}>
                <Typography fontWeight="bold" fontSize={19}>{course.title}</Typography>
                <Typography fontSize={15} color="text.secondary" mt={.5}>{course.description}</Typography>
                <LinearProgress value={progress} variant="determinate" sx={{ my: 2, borderRadius: 2, height: 7, bgcolor: "#f4f4f4" }} />
                <Typography fontSize={13} color="text.secondary">پیشرفت: {progress}%</Typography>
              </Box>
              <Button
                variant={learn.progress ? "outlined" : "contained"}
                color={learn.progress ? "success" : "primary"}
                size="large"
                sx={{ minWidth: 100, fontWeight: "bold" }}
                onClick={() => handleStartCourse(course._id, course._id)} // از slug اگر داری استفاده کن!
              >
                {learn.progress ? "ادامه" : "شروع"}
              </Button>
            </Paper>
          );
        })}
      </Box>
    </Container>
  );
}
