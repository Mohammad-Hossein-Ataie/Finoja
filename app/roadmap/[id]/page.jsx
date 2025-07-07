"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Button, Stepper, Step, StepLabel } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function CourseRoadmapPage() {
  const params = useParams();
  const courseId = params.id;
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [learning, setLearning] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mobile = localStorage.getItem("student_mobile");
    if (!mobile) {
      router.replace("/");
      return;
    }
    Promise.all([
      fetch(`/api/courses/${courseId}`).then(res => res.json()),
      fetch("/api/students/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile })
      }).then(res => res.json())
    ]).then(([courseRes, learningRes]) => {
      setCourse(courseRes);
      const l = (learningRes.learning || []).find(lr => lr.courseId === courseId) || {};
      setLearning(l);
      setLoading(false);
    });
  }, [courseId]);

  if (loading) return <Box minHeight="50vh" display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box>;
  if (!course) return <Typography>دوره‌ای یافت نشد</Typography>;

  // نمایش آیکنیک (section > units > steps)
  return (
    <Box maxWidth="md" mx="auto" mt={6} px={2}>
      <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">{course.title}</Typography>
      <Typography color="text.secondary" mb={4} textAlign="center">{course.description}</Typography>
      {course.sections.map((section, secIdx) => (
        <Paper key={section._id} sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Typography fontWeight="bold" fontSize={18} mb={1}>{section.title}</Typography>
          <Box display="flex" flexDirection="row" gap={2} overflow="auto">
            {section.units.map((unit, unitIdx) => (
              <Box key={unit._id} minWidth={180}>
                <Typography fontSize={16} fontWeight="bold" color="#186FD4" mb={1}>{unit.title}</Typography>
                {/* نمایش مراحل هر یونیت */}
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {unit.steps.map((step, stepIdx) => {
                    // مرحله فعال: اولین مرحله ای که هنوز انجام نشده
                    const currentStep = learning.progress || 0;
                    const flatStepIndex = // محاسبه اندیس مرحله کلی
                      course.sections
                        .slice(0, secIdx)
                        .reduce((acc, s) => acc + s.units.reduce((a, u) => a + (u.steps?.length || 0), 0), 0)
                      + unit.units?.slice(0, unitIdx)?.reduce((a, u) => a + (u.steps?.length || 0), 0) || 0
                      + stepIdx;
                    const isDone = (learning.correct || []).includes(flatStepIndex);
                    const isLocked = flatStepIndex > (learning.progress || 0);
                    return (
                      <Paper
                        key={step._id}
                        elevation={2}
                        sx={{
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: isDone ? "#e5fbe4" : isLocked ? "#f5f5f5" : "#dbeafe",
                          border: isLocked ? "1px dashed #bbb" : "1px solid #2e8b57",
                          opacity: isLocked ? 0.7 : 1,
                          cursor: isLocked ? "not-allowed" : "pointer"
                        }}
                        onClick={() => {
                          if (!isLocked) router.push(`/course/${course._id}/step/${flatStepIndex}`);
                        }}
                      >
                        {isDone ? <CheckCircleIcon color="success" /> : isLocked ? <LockIcon color="disabled" /> : <Box width={24} />}
                        <Box>
                          <Typography fontSize={15} fontWeight="bold">{step.title}</Typography>
                          <Typography fontSize={13} color="text.secondary">{step.type}</Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
