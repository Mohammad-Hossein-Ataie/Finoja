'use client';
import { useState } from 'react';
import {
  Card, CardContent, Stack, Box, Typography, IconButton, Chip, Tooltip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import SectionList from './SectionList';
import SafeHtml from './SafeHtml';

export default function CourseCard({ course, onEdit, onDelete, refreshCourses, teacherName }) {
  const [showSections, setShowSections] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteValue, setDeleteValue] = useState('');
  const canDelete = deleteValue.trim() === course.title.trim();
  const hasSections = (course.sections && course.sections.length > 0);

  return (
    <Card sx={{
      p: 1.5, borderRadius: 3, boxShadow: 4, background: '#F9FAFC', mb: 1.5,
      transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8, background: '#F2F8FF' }
    }}>
      <CardContent sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
              {course.title}
            </Typography>

            {/* توضیح دوره: HTML امن + 3 خط clamp */}
            <SafeHtml
              html={course.description || ""}
              sx={{
                color: "rgba(0,0,0,.75)",
                lineHeight: 1.8,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            />

            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: "#2196f3" }}><SchoolIcon fontSize="small" /></Avatar>}
                label={<Typography sx={{ fontWeight: 700, fontSize: 14 }}>{teacherName}</Typography>}
                color={teacherName === "بدون استاد" ? "warning" : "primary"}
                variant="outlined"
              />
            </Stack>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ whiteSpace: "nowrap" }}>
            <Tooltip title="ویرایش دوره"><IconButton onClick={onEdit}><EditIcon /></IconButton></Tooltip>
            <Tooltip title={hasSections ? "برای حذف دوره ابتدا همه بخش‌ها را حذف کنید" : "حذف دوره"}>
              <span><IconButton onClick={() => setDeleteDialog(true)} disabled={hasSections}>
                <DeleteIcon color={hasSections ? undefined : "error"} />
              </IconButton></span>
            </Tooltip>
            <Tooltip title={showSections ? "بستن بخش‌ها" : "مشاهده بخش‌ها"}>
              <IconButton onClick={() => setShowSections(s => !s)}>
                <ExpandMoreIcon sx={{ transform: showSections ? "rotate(180deg)" : "none", transition: '0.2s' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {showSections && <SectionList course={course} refreshCourses={refreshCourses} />}
      </CardContent>

      {/* دیالوگ حذف */}
      <Dialog open={deleteDialog} onClose={() => { setDeleteDialog(false); setDeleteValue(''); }}>
        <DialogTitle fontWeight={900} color="error.main">تایید حذف دوره</DialogTitle>
        <DialogContent>
          <Typography fontWeight={600} mb={2}>برای حذف این دوره، لطفاً نام آن را دقیق وارد کنید:</Typography>
          <Typography mb={1} color="primary">{course.title}</Typography>
          <TextField value={deleteValue} onChange={e => setDeleteValue(e.target.value)} label="نام دوره" autoFocus fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialog(false); setDeleteValue(''); }}>انصراف</Button>
          <Button color="error" variant="contained" disabled={!canDelete} onClick={async () => { await onDelete(); setDeleteDialog(false); setDeleteValue(''); }}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
