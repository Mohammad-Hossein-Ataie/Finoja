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
import StepList from "./StepList";

export default function TopicList({
  course,
  unit,
  unitIndex,
  section,
  sectionIndex,
  refreshCourses,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "" });
  const [editing, setEditing] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const addOrEditTopic = async () => {
    let newTopics;
    if (editing !== null) {
      newTopics = unit.topics.map((t, i) => (i === editing ? { ...t, title: form.title } : t));
    } else {
      newTopics = [...(unit.topics || []), { title: form.title, steps: [] }];
    }
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
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

  const handleDeleteTopic = async (idx) => {
    const newTopics = (unit.topics || []).filter((_, i) => i !== idx);
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics: newTopics };
    const newSections = [...course.sections];
    newSections[sectionIndex] = { ...section, units: newUnits };
    await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...course, sections: newSections }),
      headers: { "Content-Type": "application/json" },
    });
    refreshCourses();
  };

  // Drag and drop reorder for topics
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    const topics = Array.from(unit.topics || []);
    const [removed] = topics.splice(source.index, 1);
    topics.splice(destination.index, 0, removed);
    const newUnits = [...section.units];
    newUnits[unitIndex] = { ...unit, topics };
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
        افزودن موضوع
      </Button>
      {showForm && (
        <Box mb={2} mt={1} display="flex" alignItems="center" gap={1}>
          <TextField
            label="عنوان موضوع"
            size="small"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Button size="small" onClick={addOrEditTopic} variant="contained">
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
        <Droppable droppableId="topics">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(unit.topics || []).map((topic, i) => (
                <Draggable key={i} draggableId={`topic-${i}`} index={i}>
                  {(prov) => (
                    <Card
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      sx={{
                        mb: 1,
                        pl: 2,
                        background: "#fef9f2",
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
                          <Typography>{topic.title}</Typography>
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
                              setForm({ title: topic.title });
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteTopic(i)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Stack>
                        <Collapse in={openIndex === i}>
                          <StepList
                            course={course}
                            topic={topic}
                            topicIndex={i}
                            unit={unit}
                            unitIndex={unitIndex}
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
