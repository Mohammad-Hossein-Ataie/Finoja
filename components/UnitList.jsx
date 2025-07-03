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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import StepList from "./StepList";  // مستقیم StepList

export default function UnitList({ course, section, sectionIndex, refreshCourses }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "" });
  const [editing, setEditing] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const addOrEditUnit = async () => {
    let newUnits;
    if (editing !== null) {
      newUnits = section.units.map((u, i) => i === editing ? { ...u, title: form.title } : u);
    } else {
      newUnits = [...(section.units || []), { title: form.title, steps: [] }];
    }
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    setShowForm(false);
    setForm({ title: "" });
    setEditing(null);
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

  // Drag and drop reorder for units
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

  return (
    <Box sx={{ mt: 1, pl: 3 }}>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
        onClick={() => {
          setShowForm(true);
          setEditing(null);
        }}
      >
        افزودن یونیت
      </Button>
      {showForm && (
        <Box mb={2} mt={1} display="flex" alignItems="center" gap={1}>
          <TextField
            label="عنوان یونیت"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Button size="small" onClick={addOrEditUnit} variant="contained">
            ثبت
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => {
              setShowForm(false);
              setEditing(null);
              setForm({ title: "" });
            }}
          >
            انصراف
          </Button>
        </Box>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="units">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(section.units || []).map((unit, i) => (
                <Draggable key={i} draggableId={`unit-${i}`} index={i}>
                  {(prov) => (
                    <Card
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      sx={{
                        mb: 1,
                        pl: 2,
                        background: "#f9f6ff",
                        borderRadius: 3,
                        boxShadow: 1,
                        ":hover": { boxShadow: 4 },
                        transition: "box-shadow 0.15s",
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span {...prov.dragHandleProps}>
                            <DragIndicatorIcon sx={{ color: "#999", cursor: "grab", mr: 1 }} />
                          </span>
                          <Typography>{unit.title}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                          >
                            <ExpandMoreIcon
                              fontSize="small"
                              sx={{
                                transform: openIndex === i ? "rotate(180deg)" : "none",
                                transition: "0.2s",
                              }}
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setShowForm(true);
                              setEditing(i);
                              setForm({ title: unit.title });
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteUnit(i)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Stack>
                        <Collapse in={openIndex === i}>
                          <StepList
                            course={course}
                            unit={unit}
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
