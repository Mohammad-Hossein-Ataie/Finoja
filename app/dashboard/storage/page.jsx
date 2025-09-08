"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function StoragePage() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchFiles = async () => {
    const res = await fetch("/api/storage/list-files", {
      credentials: "include",
    });
    const data = await res.json();
    setFiles(data.files || []);
  };

  const uploadFile = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/storage/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    setLoading(false);
    if (res.ok) {
      setFile(null);
      fetchFiles();
    } else {
      alert("خطا در آپلود");
    }
  };

  const deleteFile = async (key) => {
    if (!confirm("حذف شود؟")) return;
    const res = await fetch("/api/storage/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
      credentials: "include",
    });
    if (res.ok) fetchFiles();
  };

  const downloadFile = async (key) => {
    const res = await fetch("/api/storage/presigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
      credentials: "include",
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filtered = files.filter((f) =>
    (f.Key || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" fontWeight={900} mb={2}>
        مدیریت فایل‌ها (Object Storage)
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1}
          alignItems="center"
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="video/*,audio/*,image/*"
          />
          <Button onClick={uploadFile} variant="contained" disabled={loading || !file}>
            {loading ? "در حال آپلود..." : "آپلود فایل"}
          </Button>
          <TextField
            label="فیلتر"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Stack>
        {loading && <LinearProgress sx={{ mt: 1 }} />}
      </Paper>

      <Stack gap={1}>
        {filtered.map((f) => (
          <Paper
            key={f.Key}
            sx={{
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mr: 1,
              }}
            >
              <Typography sx={{ fontFamily: "monospace" }}>
                {f.Key}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(f.Size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
            <Stack direction="row" gap={0.5}>
              <Tooltip title="کپی کلید">
                <IconButton
                  onClick={() => navigator.clipboard.writeText(f.Key)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="دانلود/مشاهده">
                <IconButton onClick={() => downloadFile(f.Key)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف">
                <IconButton onClick={() => deleteFile(f.Key)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
        {!filtered.length && (
          <Typography color="text.secondary">فایلی یافت نشد.</Typography>
        )}
      </Stack>
    </Box>
  );
}
