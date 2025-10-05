"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const STATUS_FA = {
  none: "ارسال نشده",
  pending: "در انتظار بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
};
const STATUS_COLOR = { none: "default", pending: "warning", approved: "success", rejected: "error" };

function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      color={STATUS_COLOR[status] || "default"}
      label={`احراز هویت: ${STATUS_FA[status] || status}`}
    />
  );
}

export default function CompaniesAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("kyc", filter);
    if (q) params.set("q", q);
    const r = await fetch(`/api/admin/companies?${params.toString()}`);
    const d = await r.json().catch(() => ({}));
    if (r.ok) setRows(d?.companies || []);
    else setToast({ sev: "error", text: d?.error || "خطا در دریافت فهرست" });
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []); // اولین بار

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const byText = !needle
      ? rows
      : rows.filter((c) =>
          (c.name || "").toLowerCase().includes(needle) ||
          (c.city || "").toLowerCase().includes(needle) ||
          (c.website || "").toLowerCase().includes(needle)
        );
    return filter === "all" ? byText : byText.filter((c) => (c.kyc?.status || "none") === filter);
  }, [rows, q, filter]);

  // نمایش مدارک
  const [docsOpen, setDocsOpen] = useState(false);
  const [docs, setDocs] = useState([]);
  const [docLinks, setDocLinks] = useState({}); // key -> presigned url

  const openDocs = async (company) => {
    const list = company?.kyc?.docs || [];
    setDocs(list);
    setDocsOpen(true);

    const map = {};
    for (const d of list) {
      try {
        const r = await fetch(`/api/storage/presigned?key=${encodeURIComponent(d.key)}`);
        const j = await r.json().catch(() => ({}));
        if (r.ok && j?.url) map[d.key] = j.url;
      } catch { /* noop */ }
    }
    setDocLinks(map);
  };

  // تأیید/رد
  const changeStatus = async (companyId, status) => {
    const prev = rows.slice();
    setRows(rows.map((c) => (c._id === companyId ? { ...c, kyc: { ...c.kyc, status } } : c)));

    const r = await fetch(`/api/admin/companies/${companyId}/kyc`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setRows(prev);
      setToast({ sev: "error", text: d?.error || "ثبت وضعیت ناموفق بود" });
    } else {
      setToast({
        sev: "success",
        text: status === "approved" ? "احراز هویت تأیید شد." : "احراز هویت رد شد.",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BusinessIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              مدیریت شرکت‌ها / احراز هویت
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField size="small" label="جستجو" value={q} onChange={(e) => setQ(e.target.value)} />
            <TextField
              size="small"
              select
              label="فیلتر وضعیت"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">همه وضعیت‌ها</MenuItem>
              <MenuItem value="none">ارسال نشده</MenuItem>
              <MenuItem value="pending">در انتظار بررسی</MenuItem>
              <MenuItem value="approved">تأیید شده</MenuItem>
              <MenuItem value="rejected">رد شده</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={fetchList}>بروزرسانی</Button>
          </Stack>
        </Stack>

        {toast && (
          <Alert severity={toast.sev} sx={{ mb: 2 }} onClose={() => setToast(null)}>
            {toast.text}
          </Alert>
        )}

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>نام شرکت</TableCell>
                <TableCell>شهر</TableCell>
                <TableCell>وب‌سایت</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="center">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={22} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    موردی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => {
                  const s = c.kyc?.status || "none";
                  return (
                    <TableRow key={c._id} hover>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.city || "-"}</TableCell>
                      <TableCell>
                        {c.website ? (
                          <a
                            href={c.website.startsWith("http") ? c.website : "https://" + c.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {c.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell><StatusChip status={s} /></TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="مشاهده مدارک">
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openDocs(c)}
                                disabled={!c.kyc?.docs?.length}
                              >
                                مدارک
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip title="تأیید">
                            <span>
                              <IconButton color="success" onClick={() => changeStatus(c._id, "approved")} disabled={s === "approved"}>
                                <CheckIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="رد">
                            <span>
                              <IconButton color="error" onClick={() => changeStatus(c._id, "rejected")} disabled={s === "rejected"}>
                                <CloseIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Dialog open={docsOpen} onClose={() => setDocsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>مدارک ارسالی</DialogTitle>
        <DialogContent dividers>
          {docs.length === 0 ? (
            <Typography variant="body2">مدرکی ارسال نشده است.</Typography>
          ) : (
            <Stack spacing={1}>
              {docs.map((d, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #e9eef5",
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  <Typography variant="body2">{d.name || d.key}</Typography>
                  {docLinks[d.key] ? (
                    <Button size="small" href={docLinks[d.key]} target="_blank">
                      مشاهده
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      لینک در دسترس نیست
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocsOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
