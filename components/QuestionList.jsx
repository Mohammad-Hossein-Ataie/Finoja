// components/QuestionList.jsx
"use client";
import { useMemo } from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Checkbox,
  Radio,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function QuestionList({ step, onChange }) {
  const type = step?.type || "multiple-choice";
  const isMulti = type === "multi-answer";
  const isSingle = type === "multiple-choice";

  // مقادیر امن پیش‌فرض
  const options = useMemo(
    () => (Array.isArray(step?.options) ? step.options : ["", "", "", ""]),
    [step?.options]
  );
  const correctIndex = Number.isFinite(step?.correctIndex)
    ? step.correctIndex
    : 0;
  const correctIndexes = Array.isArray(step?.correctIndexes)
    ? step.correctIndexes
    : [];

  const commit = (patch) => onChange?.({ ...step, ...patch });

  const setOption = (i, v) => {
    const next = [...options];
    next[i] = v;
    commit({ options: next });
  };

  const addOption = () => {
    const next = [...options, ""];
    commit({ options: next });
  };

  const removeOption = (i) => {
    if (options.length <= 2) return; // حداقل دو گزینه
    const next = options.filter((_, idx) => idx !== i);

    if (isSingle) {
      let nextCorrect = correctIndex;
      if (i === correctIndex) nextCorrect = 0;
      else if (i < correctIndex) nextCorrect = Math.max(0, correctIndex - 1);
      commit({ options: next, correctIndex: nextCorrect });
    } else {
      const set = new Set(correctIndexes);
      set.delete(i);
      // شیفت ایندکس‌ها بعد از حذف
      const shifted = Array.from(set).map((idx) => (idx > i ? idx - 1 : idx));
      commit({ options: next, correctIndexes: shifted });
    }
  };

  const toggleMultiCorrect = (i) => {
    const set = new Set(correctIndexes);
    if (set.has(i)) set.delete(i);
    else set.add(i);
    commit({ correctIndexes: Array.from(set).sort((a, b) => a - b) });
  };

  const setSingleCorrect = (i) => commit({ correctIndex: i });

  if (!isSingle && !isMulti) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography fontWeight={800} mb={1}>
        گزینه‌ها
      </Typography>
      <Stack spacing={1}>
        {options.map((opt, i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={1.25}>
            {isSingle ? (
              <Radio
                checked={correctIndex === i}
                onChange={() => setSingleCorrect(i)}
                sx={{ mr: -0.5 }}
              />
            ) : (
              <Checkbox
                checked={correctIndexes.includes(i)}
                onChange={() => toggleMultiCorrect(i)}
                sx={{ mr: -0.5 }}
              />
            )}

            <TextField
              fullWidth
              size="small"
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`گزینه ${i + 1}`}
            />

            <Tooltip title="حذف گزینه">
              <span>
                <IconButton
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ))}
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mt={1.5}
      >
        <Button
          startIcon={<AddIcon />}
          onClick={addOption}
          sx={{ fontWeight: 700 }}
        >
          افزودن گزینه
        </Button>

        <Typography variant="caption" color="text.secondary">
          {isSingle
            ? "یک پاسخ را با رادیو انتخاب کن"
            : "چند پاسخ را با چک‌باکس انتخاب کن"}
        </Typography>
      </Stack>

      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
}
