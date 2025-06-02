'use client';
import { useState } from 'react';
import { Card, CardContent, Stack, Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SectionList from './SectionList';

export default function CourseCard({ course, onEdit, onDelete, refreshCourses }) {
  const [showSections, setShowSections] = useState(false);

  return (
    <Card sx={{ p: 1, borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">{course.title}</Typography>
            <Typography color="text.secondary">{course.description}</Typography>
          </Box>
          <Box>
            <IconButton onClick={onEdit}><EditIcon /></IconButton>
            <IconButton onClick={onDelete}><DeleteIcon color="error" /></IconButton>
            <IconButton onClick={() => setShowSections(s => !s)}>
              <ExpandMoreIcon sx={{ transform: showSections ? "rotate(180deg)" : "none", transition: '0.2s' }} />
            </IconButton>
          </Box>
        </Stack>
        {showSections &&
          <SectionList course={course} refreshCourses={refreshCourses} />
        }
      </CardContent>
    </Card>
  );
}
