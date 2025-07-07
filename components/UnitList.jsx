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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StepList from "./StepList";

const FINOJA_COLORS = {
  primary: "#2477F3",
  secondary: "#D2E7FF",
  accent: "#66DE93",
  background: "#F9FAFB",
  text: "#1A2233",
  error: "#F35C4A",
};

const DEFAULT_UNIT = {
  title: "",
  steps: [],
};

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

  // Drag & drop for units
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
    let newUnits;
    if (editing !== null) {
      newUnits = section.units.map((u, i) => (i === editing ? form : u));
    } else {
      newUnits = [...(section.units || []), form];
    }
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
    refreshCourses();
  };

  const handleDeleteUnit = async (idx) => {
    const newUnits = (section.units || []).filter((_, i) => i !== idx);
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    refreshCourses();
  };

  return (
    <Box sx={{ mt: 1, pl: 1 }}>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 1, color: FINOJA_COLORS.primary, borderColor: FINOJA_COLORS.primary, fontWeight: 700 }}
        onClick={() => {
          setShowForm(true);
          setEditing(null);
        }}
      >
        افزودن یونیت جدید
      </Button>
      {showForm && (
        <Box mb={2} mt={1} display="flex" flexDirection="column" gap={1} sx={{ background: FINOJA_COLORS.secondary, p: 2, borderRadius: 2 }}>
          <TextField
            label="عنوان یونیت"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            sx={{ background: "#fff" }}
            InputProps={{ sx: { fontSize: 10 } }}
          />
          <Stack direction="row" gap={1}>
            <Button
              size="small"
              variant="contained"
              onClick={addOrEditUnit}
              sx={{ background: FINOJA_COLORS.primary, color: "#fff", fontWeight: 700, borderRadius: 2, px: 3 }}
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
              sx={{ borderRadius: 2, color: FINOJA_COLORS.error }}
            >
              انصراف
            </Button>
          </Stack>
        </Box>
      )}

      {/* نمایش لیست یونیت‌ها با Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="units">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(section.units || []).map((u, i) => (
                <Draggable key={i} draggableId={`unit-${i}`} index={i}>
                  {(prov) => (
                    <Card
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      sx={{
                        mb: 2,
                        pl: 2,
                        background: FINOJA_COLORS.secondary,
                        borderRadius: 3,
                        boxShadow: 1,
                        border: `1.5px solid ${FINOJA_COLORS.primary}20`,
                        color: FINOJA_COLORS.text
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span {...prov.dragHandleProps}>
                            <DragIndicatorIcon sx={{ color: "#999", cursor: "grab", mr: 1 }} />
                          </span>
                          <IconButton size="small" onClick={() => handleDeleteUnit(i)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setShowForm(true);
                              setEditing(i);
                              setForm(u);
                            }}
                          >
                            <EditIcon fontSize="small" sx={{ color: FINOJA_COLORS.primary }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                          >
                            <ExpandMoreIcon
                              fontSize="small"
                              sx={{
                                transform: openIndex === i ? "rotate(180deg)" : "none",
                                transition: "0.2s",
                                color: FINOJA_COLORS.primary
                              }}
                            />
                          </IconButton>
                          <Typography fontWeight="bold" fontSize={14}>
                            {i + 1}. {u.title ? <span style={{ color: FINOJA_COLORS.primary }}>{u.title}</span> : ""}
                            <span style={{ marginRight: 12, fontSize: 12 }}>
                              <span style={{ color: FINOJA_COLORS.text, opacity: 0.75 }}>
                                ({u.steps?.length || 0} گام)
                              </span>
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
                          />
                        </Collapse>
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
    </Box>
  );
}
