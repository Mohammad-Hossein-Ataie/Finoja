'use client';
import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, TextField, IconButton, Typography, Dialog,
  DialogTitle, DialogContent, DialogActions, Tooltip, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import UnitList from './UnitList';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SectionList({ course, refreshCourses }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '' });
  const [editing, setEditing] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteValue, setDeleteValue] = useState('');
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const notify = (msg, sev = "success") => setToast({ open: true, msg, sev });

  const addOrEditSection = async () => {
    let newSections;
    if (editing !== null) {
      newSections = course.sections.map((s, i) => i === editing ? { ...s, title: form.title } : s);
    } else {
      newSections = [...(course.sections || []), { title: form.title, units: [] }];
    }
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    setShowForm(false); setForm({ title: '' }); setEditing(null); refreshCourses();
    notify(editing !== null ? "بخش ویرایش شد" : "بخش اضافه شد");
  };

  const confirmDeleteSection = async () => {
    const idx = deleteIndex;
    setDeleteIndex(null); setDeleteValue('');
    const newSections = (course.sections || []).filter((_, i) => i !== idx);
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCourses();
    notify("بخش حذف شد");
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    const sections = Array.from(course.sections || []);
    const [removed] = sections.splice(source.index, 1);
    sections.splice(destination.index, 0, removed);
    await fetch(`/api/courses/${course._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...course, sections }),
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCourses();
    notify("ترتیب بخش‌ها تغییر کرد");
  };

  return (
    <Box sx={{ mt: 2, pl: 3 }}>
      <Button variant="outlined" size="small" sx={{ mb: 1 }} onClick={() => { setShowForm(true); setEditing(null); }}>
        افزودن بخش
      </Button>

      {showForm &&
        <Box mb={2} mt={1} display="flex" alignItems="center" gap={1}>
          <TextField label="عنوان بخش" size="small" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Button size="small" onClick={addOrEditSection} variant="contained">ثبت</Button>
          <Button size="small" color="error" onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '' }); }}>انصراف</Button>
        </Box>
      }

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(course.sections || []).map((section, i) => (
                <Draggable key={i} draggableId={`section-${i}`} index={i}>
                  {prov => (
                    <Card ref={prov.innerRef} {...prov.draggableProps}
                      sx={{ mb: 1, pl: 2, background: "#fafbfc", transition: "box-shadow 0.15s", boxShadow: 1, borderRadius: 3, ':hover': { boxShadow: 4 } }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span {...prov.dragHandleProps}>
                            <DragIndicatorIcon sx={{ color: "#999", cursor: "grab", mr: 1 }} />
                          </span>
                          <Typography fontWeight={600}>{section.title}</Typography>
                          <IconButton size="small" onClick={() => { setShowForm(true); setEditing(i); setForm({ title: section.title }); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <Tooltip title={(section.units && section.units.length > 0) ? "ابتدا همه یونیت‌ها را حذف کنید" : "حذف بخش"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setDeleteIndex(i)}
                                disabled={section.units && section.units.length > 0}
                              >
                                <DeleteIcon fontSize="small" color={(section.units && section.units.length > 0) ? undefined : "error"} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                        <UnitList course={course} section={section} sectionIndex={i} refreshCourses={refreshCourses} />
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle color="error.main">تایید حذف بخش</DialogTitle>
        <DialogContent>
          <Typography mb={2}>برای حذف این بخش، نام آن را دقیق وارد کنید:</Typography>
          <Typography mb={1} color="primary">{deleteIndex !== null ? course.sections[deleteIndex]?.title : ""}</Typography>
          <TextField value={deleteValue} onChange={e => setDeleteValue(e.target.value)} label="نام بخش" autoFocus fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>انصراف</Button>
          <Button color="error" disabled={deleteIndex === null || deleteValue.trim() !== (deleteIndex !== null ? course.sections[deleteIndex]?.title.trim() : "")} onClick={confirmDeleteSection}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast(s => ({ ...s, open: false }))}>
        <Alert severity={toast.sev} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
