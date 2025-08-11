"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  Typography,
  Collapse,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StepList from "./StepList";

const FINOJA = { primary: "#2477F3", secondary: "#D2E7FF", text: "#1A2233" };
const DEFAULT_UNIT = { title: "", steps: [] };

export default function UnitList({
  course,
  section,
  sectionIndex,
  refreshCourses,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_UNIT);
  const [editing, setEditing] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const notify = (msg, sev = "success") => setToast({ open: true, msg, sev });

  // reorder units
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    const units = Array.from(section.units || []);
    const [removed] = units.splice(source.index, 1);
    units.splice(destination.index, 0, removed);
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    refreshCourses();
  };

  const addOrEditUnit = async () => {
    const newUnits =
      editing !== null
        ? section.units.map((u, i) => (i === editing ? form : u))
        : [...(section.units || []), form];

    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    setShowForm(false);
    setEditing(null);
    setForm(DEFAULT_UNIT);
    notify(editing !== null ? "یونیت ویرایش شد" : "یونیت اضافه شد");
    refreshCourses();
  };

  const handleDeleteUnit = async (idx) => {
    const u = section.units[idx];
    if (u?.steps?.length) {
      notify("ابتدا باید تمام گام‌های این یونیت حذف شوند.", "warning");
      return;
    }
    const newUnits = (section.units || []).filter((_, i) => i !== idx);
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    notify("یونیت حذف شد");
    refreshCourses();
  };

  return (
    <Box sx={{ mt: 1, pl: 1 }}>
      <Button
        variant="outlined"
        size="small"
        sx={{
          mb: 1,
          color: FINOJA.primary,
          borderColor: FINOJA.primary,
          fontWeight: 700,
        }}
        onClick={() => {
          setShowForm(true);
          setEditing(null);
        }}
      >
        افزودن یونیت جدید
      </Button>

      {showForm && (
        <Box
          mb={2}
          mt={1}
          display="flex"
          flexDirection="column"
          gap={1}
          sx={{ background: FINOJA.secondary, p: 2, borderRadius: 2 }}
        >
          <TextField
            label="عنوان یونیت"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            sx={{ background: "#fff" }}
          />
          <Stack direction="row" gap={1}>
            <Button
              size="small"
              variant="contained"
              onClick={addOrEditUnit}
              sx={{
                background: FINOJA.primary,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
              }}
            >
              ثبت
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setForm(DEFAULT_UNIT);
              }}
              sx={{ borderRadius: 2 }}
            >
              انصراف
            </Button>
          </Stack>
        </Box>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="units">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(section.units || []).map((u, i) => {
                const hasSteps = u?.steps?.length > 0;
                return (
                  <Draggable key={i} draggableId={`unit-${i}`} index={i}>
                    {(prov) => (
                      <Card
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        sx={{
                          mb: 2,
                          pl: 2,
                          background: FINOJA.secondary,
                          borderRadius: 3,
                          boxShadow: 1,
                          border: `1.5px solid ${FINOJA.primary}20`,
                          color: FINOJA.text,
                        }}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <span {...prov.dragHandleProps}>
                              <DragIndicatorIcon
                                sx={{ color: "#999", cursor: "grab", mr: 1 }}
                              />
                            </span>

                            <Tooltip
                              title={
                                hasSteps
                                  ? "ابتدا گام‌ها را حذف کنید"
                                  : "حذف یونیت"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUnit(i)}
                                  disabled={hasSteps}
                                >
                                  <DeleteIcon
                                    fontSize="small"
                                    color={hasSteps ? undefined : "error"}
                                  />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <IconButton
                              size="small"
                              onClick={() => {
                                setShowForm(true);
                                setEditing(i);
                                setForm(u);
                              }}
                            >
                              <EditIcon
                                fontSize="small"
                                sx={{ color: FINOJA.primary }}
                              />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() =>
                                setOpenIndex(openIndex === i ? null : i)
                              }
                            >
                              <ExpandMoreIcon
                                fontSize="small"
                                sx={{
                                  transform:
                                    openIndex === i ? "rotate(180deg)" : "none",
                                  transition: "0.2s",
                                  color: FINOJA.primary,
                                }}
                              />
                            </IconButton>

                            <Typography fontWeight="bold" fontSize={14}>
                              {i + 1}.{" "}
                              <span style={{ color: FINOJA.primary }}>
                                {u.title || "بدون عنوان"}
                              </span>
                              <span
                                style={{
                                  marginRight: 12,
                                  fontSize: 12,
                                  opacity: 0.75,
                                }}
                              >
                                ({u.steps?.length || 0} گام)
                              </span>
                            </Typography>
                          </Stack>

                          <Collapse in={openIndex === i}>
                            <StepList
                              course={course}
                              unit={u}
                              unitIndex={i}
                              section={section}
                              sectionIndex={sectionIndex}
                              refreshCourses={refreshCourses}
                              onToast={notify}
                            />
                          </Collapse>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
      >
        <Alert severity={toast.sev} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
