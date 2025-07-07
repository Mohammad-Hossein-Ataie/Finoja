"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Container,
  useTheme,
  Avatar,
  Stack,
  IconButton,
  Slide,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AuthStepperModal from "../components/AuthStepperModal";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DevicesIcon from "@mui/icons-material/Devices";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import UpdateIcon from "@mui/icons-material/Update";

const features = [
  {
    title: "آموزش تعاملی",
    description: "مینی‌گیم‌ها و تمرین‌های روزانه برای یادگیری بهتر مفاهیم مالی",
    icon: <PlayCircleOutlineIcon sx={{ fontSize: 48, color: "#2477F3" }} />,
    color: "#D2E7FF",
  },
  {
    title: "مدرک معتبر",
    description: "دریافت مدرک رسمی و توصیه‌نامه حرفه‌ای پس از اتمام دوره",
    icon: <SchoolIcon sx={{ fontSize: 48, color: "#66DE93" }} />,
    color: "#E1F5E4",
  },
  {
    title: "مسیر شغلی",
    description: "مسیر یادگیری شخصی‌سازی شده بر اساس هدف و سطح شما",
    icon: <TrendingUpIcon sx={{ fontSize: 48, color: "#FF6B6B" }} />,
    color: "#FFEBEE",
  },
];

const howItWorks = [
  {
    step: "۱",
    title: "ثبت‌نام رایگان",
    description: "در کمتر از ۱ دقیقه ثبت‌نام کن و پروفایل بساز",
  },
  {
    step: "۲",
    title: "تعیین سطح",
    description: "سطح فعلی خودت رو در آزمون کوتاه مشخص کن",
  },
  {
    step: "۳",
    title: "شروع یادگیری",
    description: "اولین درس رو شروع کن و روزانه پیشرفت کن",
  },
  {
    step: "۴",
    title: "دریافت مدرک",
    description: "پس از اتمام دوره، مدرک معتبر دریافت کن",
  },
];

const webAppBenefits = [
  {
    title: "بدون نیاز به نصب",
    description: "فقط با یک مرورگر به تمام امکانات دسترسی دارید",
    icon: <DevicesIcon sx={{ fontSize: 48, color: "#2477F3" }} />,
  },
  {
    title: "همیشه به‌روز",
    description:
      "نیازی به آپدیت دستی نیست، همیشه آخرین نسخه را استفاده می‌کنید",
    icon: <UpdateIcon sx={{ fontSize: 48, color: "#66DE93" }} />,
  },
  {
    title: "دسترسی سریع",
    description: "در هر زمان و هر مکان فقط با اینترنت و مرورگر",
    icon: <AccessTimeIcon sx={{ fontSize: 48, color: "#FF6B6B" }} />,
  },
  {
    title: "امنیت بالا",
    description: "اطلاعات شما در سرورهای امن ذخیره می‌شود",
    icon: <SecurityIcon sx={{ fontSize: 48, color: "#FFC107" }} />,
  },
];

const StyledFeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  textAlign: "center",
  height: "100%",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
}));

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const theme = useTheme();

  const handleLoginClick = () => {
    setAuthOpen(true);
    // به صورت پیش‌فرض مودال روی ورود باز شود
  };

  return (
    <Box sx={{ bgcolor: "#F9FAFB", overflowX: "hidden" }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          background: "linear-gradient(135deg, #D2E7FF 0%, #FFFFFF 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            bgcolor: "rgba(102, 222, 147, 0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            bgcolor: "rgba(36, 119, 243, 0.1)",
          }}
        />

        <Container maxWidth="lg">
          <Grid
            container
            spacing={6}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* توضیحات، در دسکتاپ سمت چپ */}
            <Grid item xs={12} md={7} sx={{ position: "relative", zIndex: 1 }}>
              <Slide in direction="right" timeout={500}>
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    gutterBottom
                    color="#1A2233"
                    sx={{
                      fontSize: {
                        xs: "2rem",
                        sm: "2.3rem",
                        md: "2.7rem",
                        lg: "3rem",
                      },
                      lineHeight: 1.2,
                      mb: 2,
                      wordBreak: "break-word",
                    }}
                  >
                    یادگیری مالی{" "}
                    <span style={{ color: "#2477F3" }}>سرگرم‌کننده</span> و موثر
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#1A2233"
                    sx={{
                      mb: 4,
                      fontWeight: 400,
                      fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                      maxWidth: 500,
                    }}
                  >
                    با روشی مشابه دولینگو، مفاهیم پیچیده مالی را به ساده‌ترین
                    شکل یاد بگیرید. مدرک معتبر دریافت کنید و وارد بازار کار
                    شوید!
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: "#66DE93",
                        color: "#1A2233",
                        fontWeight: "bold",
                        px: 6,
                        py: 1.5,
                        borderRadius: 12,
                        fontSize: "1.1rem",
                        "&:hover": {
                          bgcolor: "#4dca80",
                          boxShadow: "0 4px 12px rgba(102, 222, 147, 0.4)",
                        },
                      }}
                      onClick={() => setAuthOpen(true)}
                    >
                      شروع رایگان
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: "#2477F3",
                        color: "#2477F3",
                        fontWeight: "bold",
                        px: 6,
                        py: 1.5,
                        borderRadius: 12,
                        fontSize: "1.1rem",
                        "&:hover": {
                          bgcolor: "#D2E7FF",
                          borderColor: "#2477F3",
                        },
                      }}
                      onClick={handleLoginClick}
                    >
                      قبلاً ثبت‌نام کرده‌ام
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#66DE93" }} />
                    <Typography variant="body2" color="#1A2233">
                      بدون نیاز به کارت بانکی
                    </Typography>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            {/* عکس، در دسکتاپ سمت راست */}
            <Grid item xs={12} md={5}>
              <Fade in timeout={800}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    maxWidth: { xs: 320, md: 400 },
                    mx: "auto",
                    textAlign: "center",
                  }}
                >
                  <Box
                    component="img"
                    src="/images/logo.png"
                    alt="لوگو فینوجا"
                    sx={{
                      width: "100%",
                      maxWidth: 300,
                      height: "auto",
                      mx: "auto",
                      display: "block",
                    }}
                  />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: 10, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            color="#1A2233"
            sx={{ mb: 2 }}
          >
            چرا فینوجا؟
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="#666"
            sx={{ mb: 8, maxWidth: 600, mx: "auto" }}
          >
            یادگیری مالی هرگز به این سادگی نبوده است!
          </Typography>
          <Grid container spacing={6}>
            {features.map((feature, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Fade in timeout={(i + 1) * 300}>
                  <StyledFeatureCard sx={{ bgcolor: feature.color }}>
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="#1A2233"
                      gutterBottom
                    >
                      {feature.title}
                    </Typography>
                    <Typography color="#666">{feature.description}</Typography>
                  </StyledFeatureCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How it works */}
      <Box sx={{ py: 10, bgcolor: "#F9FAFB" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            color="#1A2233"
            sx={{ mb: 2 }}
          >
            چگونه کار می‌کند؟
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="#666"
            sx={{ mb: 8, maxWidth: 600, mx: "auto" }}
          >
            فقط ۴ مرحله ساده تا تسلط بر مفاهیم مالی
          </Typography>
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {howItWorks.map((step, i) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                }}
              >
                <Slide in direction="up" timeout={(i + 1) * 300}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      bgcolor: "white",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      minHeight: 230,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        bgcolor: "#2477F3",
                        color: "white",
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "1.7rem",
                        fontWeight: "bold",
                        mb: 2,
                        boxShadow: 2,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="#1A2233"
                      gutterBottom
                      sx={{
                        minHeight: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography color="#666" sx={{ fontSize: "1rem", mt: 1 }}>
                      {step.description}
                    </Typography>
                  </Paper>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

{/* Web App Benefits */}
<Box sx={{ py: 10, bgcolor: "white" }}>
  <Container maxWidth="lg">
    <Typography
      variant="h3"
      fontWeight="bold"
      textAlign="center"
      color="#1A2233"
      sx={{ mb: 2 }}
    >
      مزایای وب‌اپلیکیشن فینوجا
    </Typography>
    <Typography
      variant="h6"
      textAlign="center"
      color="#666"
      sx={{ mb: 8, maxWidth: 600, mx: "auto" }}
    >
      بدون نیاز به نصب، همیشه در دسترس و به‌روز
    </Typography>
    <Grid container spacing={4} justifyContent="center" alignItems="stretch">
      {webAppBenefits.map((benefit, i) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={i}
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Fade in timeout={(i + 1) * 300}>
            <Paper
              elevation={4}
              sx={{
                borderRadius: 4,
                p: 4,
                height: '100%',
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                boxShadow: "0 6px 32px rgba(36,119,243,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(36,119,243,0.10)",
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: `${benefit.icon.props.sx.color}22`,
                  borderRadius: "50%",
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                {React.cloneElement(benefit.icon, { 
                  sx: { 
                    fontSize: 40, 
                    color: benefit.icon.props.sx.color 
                  } 
                })}
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="#1A2233"
                gutterBottom
                sx={{ 
                  minHeight: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                {benefit.title}
              </Typography>
              <Typography 
                color="#666" 
                sx={{ 
                  fontSize: "1rem", 
                  lineHeight: 1.8,
                  width: '100%'
                }}
              >
                {benefit.description}
              </Typography>
            </Paper>
          </Fade>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>
      {/* Testimonials */}
      <Box sx={{ py: 10, bgcolor: "#F9FAFB" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            color="#1A2233"
            sx={{ mb: 8 }}
          >
            نظرات کاربران
          </Typography>
    <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {[1, 2, 3].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Fade in timeout={(i + 1) * 300}>
                  <Paper sx={{ p: 4, borderRadius: 4, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Avatar
                        src={`/images/avatar-${i + 1}.jpg`}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography fontWeight="bold">محمد رضایی</Typography>
                        <Typography variant="body2" color="#666">
                          دانشجوی مدیریت مالی
                        </Typography>
                      </Box>
                    </Box>
                    <Typography color="#666" sx={{ lineHeight: 2 }}>
                      "فینوجا واقعا انقلابی در یادگیری مفاهیم مالی ایجاد کرده.
                      با روش جذاب و بازی‌گونه‌اش تونستم مفاهیم پیچیده رو به
                      راحتی یاد بگیرم."
                    </Typography>
                    <Box sx={{ display: "flex", mt: 2 }}>
                      {[...Array(5)].map((_, star) => (
                        <Box key={star} sx={{ color: "#FFD700", fontSize: 20 }}>
                          ★
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        sx={{
          py: 12,
          backgroundColor: "#2477F3",
          color: "white",
          textAlign: "center",
          backgroundImage: "linear-gradient(135deg, #2477F3 0%, #1A56DB 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            bgcolor: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            bgcolor: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            همین حالا یادگیری را شروع کنید
          </Typography>
          <Typography variant="h5" sx={{ mb: 6, fontWeight: 400 }}>
            امروز اولین قدم را بردارید. فردا حرفه‌ای شوید.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#66DE93",
              color: "#1A2233",
              fontWeight: "bold",
              px: 8,
              py: 2,
              fontSize: "1.2rem",
              borderRadius: 12,
              "&:hover": {
                bgcolor: "#4dca80",
                boxShadow: "0 8px 24px rgba(102, 222, 147, 0.5)",
              },
            }}
            onClick={() => setAuthOpen(true)}
          >
            ثبت‌نام رایگان
          </Button>
          <Typography sx={{ mt: 3, opacity: 0.9 }}>
            اولین درس رایگان است. هیچ کارت بانکی نیاز نیست.
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: "#1A2233", color: "white" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                فینوجا
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
                یادگیری مالی به سبک دولینگو! با ما مفاهیم مالی را به ساده‌ترین و
                جذاب‌ترین شکل یاد بگیرید.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <IconButton
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}
                >
                  <Box component="span" className="fab fa-instagram" />
                </IconButton>
                <IconButton
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}
                >
                  <Box component="span" className="fab fa-telegram" />
                </IconButton>
                <IconButton
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}
                >
                  <Box component="span" className="fab fa-linkedin" />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                لینک‌های مفید
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">درباره ما</Typography>
                <Typography variant="body2">تماس با ما</Typography>
                <Typography variant="body2">سوالات متداول</Typography>
                <Typography variant="body2">بلاگ</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                محصولات
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">دوره‌ها</Typography>
                <Typography variant="body2">وب‌اپلیکیشن</Typography>
                <Typography variant="body2">مدرک</Typography>
                <Typography variant="body2">توصیه‌نامه</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                خبرنامه
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                برای دریافت جدیدترین دوره‌ها و تخفیف‌ها ایمیل خود را وارد کنید
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <input
                  type="email"
                  placeholder="ایمیل شما"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "none",
                    outline: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#66DE93",
                    color: "#1A2233",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: "#4dca80",
                    },
                  }}
                >
                  ثبت
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2">
              © {new Date().getFullYear()} فینوجا. تمام حقوق محفوظ است.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Auth Modal */}
      <AuthStepperModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </Box>
  );
}
