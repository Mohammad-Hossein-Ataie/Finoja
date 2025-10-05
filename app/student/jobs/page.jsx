"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Container, Typography, Grid, Card, CardContent, Box, Button,
  TextField, MenuItem, Select, FormControl, InputLabel, Chip, Alert
} from "@mui/material";
import { IR_PROVINCES } from "../../../utils/iran";

export default function StudentJobs() {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [jobs, setJobs] = useState([]);
  const [filteredOnce, setFilteredOnce] = useState(false);

  const cities = useMemo(() => {
    const p = IR_PROVINCES.find(x => x.name === province);
    return p ? p.cities : [];
  }, [province]);

  const fetchJobs = async (markFiltered = false) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (province) params.set("country", "ایران");
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/jobs?${params.toString()}`, { credentials: "include" });
    const data = await res.json();
    setJobs(data.jobs || []);
    if (markFiltered) setFilteredOnce(true);
  };

  useEffect(() => { fetchJobs(false); }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>فرصت‌های شغلی</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField label="عنوان" fullWidth value={q} onChange={e => setQ(e.target.value)} />
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>استان</InputLabel>
            <Select
              label="استان"
              value={province}
              onChange={e => { setProvince(e.target.value); setCity(""); }}
              displayEmpty
              renderValue={(val) => val}
            >
              {IR_PROVINCES.map(p => (
                <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          {/* بدون InputLabel → فقط placeholder «انتخاب شهر» دیده می‌شود */}
          <FormControl fullWidth sx={{ minWidth: 200 }} disabled={!province} aria-label="شهر">
            <Select
              value={city}
              onChange={e => setCity(e.target.value)}
              displayEmpty
              renderValue={(val) => val || "انتخاب شهر"}
            >
              <MenuItem value="">
                <em>انتخاب شهر</em>
              </MenuItem>
              {cities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField type="date" label="از تاریخ" InputLabelProps={{ shrink: true }} fullWidth
                     value={from} onChange={e => setFrom(e.target.value)} />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField type="date" label="تا تاریخ" InputLabelProps={{ shrink: true }} fullWidth
                     value={to} onChange={e => setTo(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={1}>
          <Button fullWidth variant="contained" onClick={() => fetchJobs(true)}>اعمال فیلتر</Button>
        </Grid>
      </Grid>

      {filteredOnce && jobs.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          نتیجه‌ای مطابق فیلترها پیدا نشد.
        </Alert>
      )}

      <Grid container spacing={2}>
        {jobs.map((j) => (
          <Grid key={j._id} item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{j.title}</Typography>
                <Typography sx={{ color: "text.secondary", mt: .5 }}>
                  {j.company?.name} — {j.location?.city || ""} {(j.location?.country && j.location.country !== "ایران" ? j.location.country : "")}
                </Typography>
                {j.salaryRange && <Chip size="small" sx={{ mt: 1 }} label={`حقوق: ${j.salaryRange}`} />}
                <Typography sx={{ mt: 1 }} noWrap title={j.description}>{j.description}</Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Button component={Link} href={`/student/jobs/${j._id}`} variant="contained">مشاهده و درخواست</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
