'use client';
import { useState } from 'react';
import { Card, CardContent, Stack, Box, Typography, IconButton, Chip, Tooltip, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import SectionList from './SectionList';

export default function CourseCard({ course, onEdit, onDelete, refreshCourses, teacherName }) {
  const [showSections, setShowSections] = useState(false);

  return (
    <Card sx={{
      p: 1.5,
      borderRadius: 3,
      boxShadow: 4,
      background: '#F9FAFC',
      mb: 1.5,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 8, background: '#F2F8FF' }
    }}>
      <CardContent sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>{course.title}</Typography>
            <Typography color="text.secondary" fontSize={15}>{course.description}</Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: "#2196f3" }}><SchoolIcon fontSize="small" /></Avatar>}
                label={<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  {teacherName}
                </Typography>}
                color={teacherName === "بدون استاد" ? "warning" : "primary"}
                variant="outlined"
              />
            </Stack>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="ویرایش دوره">
              <IconButton onClick={onEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف دوره">
              <IconButton onClick={onDelete}>
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
            <Tooltip title={showSections ? "بستن بخش‌ها" : "مشاهده بخش‌ها"}>
              <IconButton onClick={() => setShowSections(s => !s)}>
                <ExpandMoreIcon sx={{
                  transform: showSections ? "rotate(180deg)" : "none",
                  transition: '0.2s'
                }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        {showSections &&
          <SectionList course={course} refreshCourses={refreshCourses} />
        }
      </CardContent>
    </Card>
  );
}
