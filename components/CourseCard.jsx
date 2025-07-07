'use client';
import { useState } from 'react';
import { Card, CardContent, Stack, Box, Typography, IconButton, Chip, Tooltip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import SectionList from './SectionList';

export default function CourseCard({ course, onEdit, onDelete, refreshCourses, teacherName }) {
  const [showSections, setShowSections] = useState(false);

  // For Delete Modal
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteValue, setDeleteValue] = useState('');

  const canDelete = deleteValue.trim() === course.title.trim();
  const hasSections = (course.sections && course.sections.length > 0);

  const handleDeleteClick = () => setDeleteDialog(true);
  const handleCloseDialog = () => { setDeleteDialog(false); setDeleteValue(''); };

  const handleConfirmDelete = async () => {
    await onDelete();
    handleCloseDialog();
  };

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
            <Tooltip title={hasSections ? "برای حذف دوره ابتدا همه بخش‌ها را حذف کنید" : "حذف دوره"}>
              <span>
                <IconButton onClick={handleDeleteClick} disabled={hasSections}>
                  <DeleteIcon color={hasSections ? undefined : "error"} />
                </IconButton>
              </span>
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleCloseDialog}>
        <DialogTitle fontWeight={900} color="error.main">تایید حذف دوره</DialogTitle>
        <DialogContent>
          <Typography fontWeight={600} mb={2}>
            برای حذف این دوره، لطفاً نام آن را دقیق وارد کنید:
          </Typography>
          <Typography mb={1} color="primary">{course.title}</Typography>
          <TextField
            value={deleteValue}
            onChange={e => setDeleteValue(e.target.value)}
            label="نام دوره"
            autoFocus
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>انصراف</Button>
          <Button color="error" variant="contained" disabled={!canDelete} onClick={handleConfirmDelete}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
