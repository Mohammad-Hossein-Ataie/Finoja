"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Container,
  AppBar,
  Toolbar,
  Avatar,
  Stack,
  IconButton,
  Slide,
  Fade,
  Skeleton,
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
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

/* ---------- داده‌های ثابت ---------- */
const features = [
  {
    title: "آموزش تعاملی",
    description:
      "یادگیری مالی با فینوجا یک تجربه متفاوت است! با مینی‌گیم‌های سرگرم‌کننده و تمرین‌های روزانه، مفاهیم پیچیده مالی را به ساده‌ترین شکل ممکن و بدون خستگی یاد می‌گیرید. هر درس طوری طراحی شده که علاوه بر جذابیت، تمرکز شما را حفظ کند و انگیزه ادامه مسیر را بالا ببرد. هر روز با چالش‌های جدید روبرو شوید، امتیاز بگیرید و پیشرفت واقعی خود را لمس کنید.",
    icon: <PlayCircleOutlineIcon sx={{ fontSize: 48, color: "#2477F3" }} />,
    color: "#D2E7FF",
    img: "/images/learning.webp",
  },
  {
    title: "مدرک معتبر",
    description:
      "بعد از اتمام دوره‌ها، علاوه بر یادگیری مهارت‌های کاربردی، یک مدرک رسمی از فینوجا دریافت می‌کنید که قابل ارائه در رزومه و مصاحبه‌های شغلی است. همچنین امکان دریافت توصیه‌نامه حرفه‌ای برای ورود به بازار کار وجود دارد. مدارک فینوجا اعتبارسنجی شده و می‌توانند در مسیر حرفه‌ای شما تأثیرگذار باشند. آینده شغلی خود را با یک مدرک ارزشمند تضمین کنید!",
    icon: <SchoolIcon sx={{ fontSize: 48, color: "#66DE93" }} />,
    color: "#E1F5E4",
    img: "/images/certificate.webp",
  },
  {
    title: "مسیر شغلی",
    description:
      "در فینوجا، شما یک مسیر یادگیری شخصی‌سازی‌شده بر اساس هدف و سطح فعلی خود دریافت می‌کنید. از تعیین سطح اولیه تا پیشنهاد دوره‌های مناسب و پروژه‌های عملی، همه چیز به گونه‌ای طراحی شده تا دقیقا مطابق نیازها و رویاهای شغلی شما باشد. با ما، نه تنها مفاهیم مالی را یاد می‌گیرید، بلکه برای بازار کار آماده می‌شوید و قدم به قدم تا موفقیت همراهتان هستیم.",
    icon: <TrendingUpIcon sx={{ fontSize: 48, color: "#FF6B6B" }} />,
    color: "#FFEBEE",
    img: "/images/work.webp",
  },
];
const testimonials = [
  {
    name: "محمد رضایی",
    job: "دانشجوی مدیریت مالی",
    avatar: "/images/avatar.webp",
    text: "فینوجا واقعا انقلابی در یادگیری مفاهیم مالی ایجاد کرده. با روش جذاب و بازی‌گونه‌اش تونستم مفاهیم پیچیده رو به راحتی یاد بگیرم. حالا دیگه به امور مالی شخصی‌ام تسلط بیشتری دارم.",
  },
  {
    name: "سارا احمدی",
    job: "کارمند حسابداری",
    avatar: "/images/avatar.webp",
    text: "دوره‌های فینوجا خیلی کاربردی بودن. هم مدرک گرفتم، هم تونستم تو مصاحبه کاری خودم از مهارت‌هایی که اینجا یاد گرفتم استفاده کنم. همه چیز ساده و قابل فهم بود.",
  },
  {
    name: "رضا اکبری",
    job: "کارآفرین",
    avatar: "/images/avatar.webp",
    text: "سیستم یادگیری فینوجا واقعا خلاقانه‌ست. همه‌چیز مرحله به مرحله، با تمرین و مینی‌گیم. مهم‌تر از همه، پشتیبانی عالی و سریع تیم فینوجاست که همیشه کنارته.",
  },
  {
    name: "محمد رضایی",
    job: "دانشجوی مدیریت مالی",
    avatar: "/images/avatar.webp",
    text: "فینوجا واقعا انقلابی در یادگیری مفاهیم مالی ایجاد کرده. با روش جذاب و بازی‌گونه‌اش تونستم مفاهیم پیچیده رو به راحتی یاد بگیرم. حالا دیگه به امور مالی شخصی‌ام تسلط بیشتری دارم.",
  },
  {
    name: "سارا احمدی",
    job: "کارمند حسابداری",
    avatar: "/images/avatar.webp",
    text: "دوره‌های فینوجا خیلی کاربردی بودن. هم مدرک گرفتم، هم تونستم تو مصاحبه کاری خودم از مهارت‌هایی که اینجا یاد گرفتم استفاده کنم. همه چیز ساده و قابل فهم بود.",
  },
  {
    name: "رضا اکبری",
    job: "کارآفرین",
    avatar: "/images/avatar.webp",
    text: "سیستم یادگیری فینوجا واقعا خلاقانه‌ست. همه‌چیز مرحله به مرحله، با تمرین و مینی‌گیم. مهم‌تر از همه، پشتیبانی عالی و سریع تیم فینوجاست که همیشه کنارته.",
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
    description: `فینوجا کاملاً تحت وب است و نیاز به دانلود یا نصب هیچ برنامه‌ای ندارد. فقط کافی است وارد سایت شوید و از هر دستگاهی—موبایل، تبلت یا کامپیوتر—به امکانات دسترسی پیدا کنید. دیگر دغدغه پر شدن حافظه یا دردسرهای نصب و بروزرسانی را نخواهید داشت. همیشه و همه‌جا، تجربه‌ای روان و بی‌دغدغه از یادگیری و استفاده خواهید داشت.`,
    img: "/images/installation.webp",
  },
  {
    title: "همیشه به‌روز",
    description: `وب‌اپلیکیشن فینوجا به‌صورت خودکار بروزرسانی می‌شود و همیشه آخرین نسخه و جدیدترین قابلیت‌ها در دسترس شماست. هیچ وقت نیاز به بروزرسانی دستی یا دانلود نسخه جدید ندارید. به محض ورود، همه امکانات و ویژگی‌های تازه را تجربه خواهید کرد. این یعنی همیشه یک قدم جلوتر و همراه با تکنولوژی روز دنیا خواهید بود.`,
    img: "/images/update.webp",
  },
  {
    title: "دسترسی سریع",
    description: `در هر لحظه و هر مکان فقط با داشتن اینترنت و مرورگر، می‌توانید وارد فینوجا شوید. هیچ وابستگی به سیستم‌عامل، نسخه گوشی یا کامپیوتر ندارید و محدودیت‌های سنتی اپلیکیشن‌ها برای شما معنایی ندارد. کافی است آدرس سایت را داشته باشید تا به سادگی و با سرعت بالا از امکانات فینوجا بهره‌مند شوید.`,
    img: "/images/reachable.webp",
  },
  {
    title: "امنیت بالا",
    description: `اطلاعات شخصی و داده‌های شما در فینوجا با بالاترین استانداردهای امنیتی ذخیره و محافظت می‌شود. ما از جدیدترین پروتکل‌ها و سرورهای امن استفاده می‌کنیم تا امنیت حساب کاربری و حریم خصوصی شما تضمین شود. با خیال راحت به یادگیری و استفاده بپردازید و نگرانی بابت لو رفتن یا از بین رفتن اطلاعات نداشته باشید.`,
    img: "/images/security.webp",
  },
];

/* ---------- کامپوننت‌های استایل ---------- */
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

/* =========================================================
   Main Component
========================================================= */
export default function LandingPage() {
  /* حالت لودینگ صفحه */
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const handleLoad = () => setIsLoaded(true);
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  /* مودال احراز هویت */
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState(1);
  const handleLoginClick = () => {
    setAuthTab(0);
    setAuthOpen(true);
  };
  const handleSignupClick = () => {
    setAuthTab(1);
    setAuthOpen(true);
  };

  /* منطق نوار بالای صفحه */
  const heroRef = useRef(null);
  const [heroHeight, setHeroHeight] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const measure = () => setHeroHeight(heroRef.current?.offsetHeight || 0);

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isLoaded]);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroHeight) return;
      setShowCTA(window.scrollY > heroHeight - 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroHeight]);

  /* ---------- Structured data ---------- */
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "فینوجا",
    url: "https://finoja.ir",
    logo: "https://finoja.ir/images/logo.webp",
    sameAs: [
      "https://instagram.com/finoja",
      "https://t.me/finoja",
      "https://linkedin.com/company/finoja",
    ],
  };

  /* ---------- Meta + Head ---------- */
  const headContent = (
    <Head>
      <title>فینوجا | یادگیری مالی سرگرم‌کننده و موثر</title>
      <meta
        name="description"
        content="با فینوجا مفاهیم پیچیده مالی را به ساده‌ترین و سرگرم‌کننده‌ترین شکل بیاموزید، مدرک معتبر دریافت کنید و برای بازار کار آماده شوید."
      />
      <meta
        name="keywords"
        content="فینوجا یک وب‌اپلیکیشن تعاملی آموزش مالی است که با بازی‌وارسازی، یادگیری اصول مالی، مدیریت هزینه و سرمایه‌گذاری را برای همه آسان و جذاب می‌کند. همین حالا شروع کنید، مدرک معتبر بگیرید و آماده ورود به بازار کار شوید!"
      />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href="https://finoja.ir" />
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="فینوجا | یادگیری مالی سرگرم‌کننده و موثر"
      />
      <meta
        property="og:description"
        content="با فینوجا مفاهیم مالی را به ساده‌ترین شکل یاد بگیرید و مدرک معتبر دریافت کنید."
      />
      <meta property="og:url" content="https://finoja.ir" />
      <meta property="og:image" content="https://finoja.ir/og.webp" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="فینوجا | یادگیری مالی سرگرم‌کننده و موثر"
      />
      <meta
        name="twitter:description"
        content="با فینوجا مفاهیم مالی را به ساده‌ترین شکل یاد بگیرید و مدرک معتبر دریافت کنید."
      />
      <meta name="twitter:image" content="https://finoja.ir/og.webp" />
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </Head>
  );

  /* ---------- Loading Skeleton ---------- */
  if (!isLoaded) {
    return (
      <>
        {headContent}
        <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: 8 }}>
          <Container maxWidth="lg">
            <Skeleton
              variant="rectangular"
              height={80}
              sx={{ mb: 4, borderRadius: 4 }}
            />
            <Skeleton
              variant="text"
              height={60}
              sx={{ mb: 2, borderRadius: 2 }}
            />
            <Skeleton variant="rounded" height={400} />
          </Container>
        </Box>
      </>
    );
  }

  /* ---------- Main Render ---------- */
  return (
    <>
      {headContent}
      <Box sx={{ bgcolor: "#F9FAFB", overflowX: "hidden" }}>
        {/* نوار بالا */}
        <AppBar
          position="fixed"
          elevation={showCTA ? 4 : 0}
          sx={{
            bgcolor: showCTA ? "#D2E7FF" : "#D2E7FF",
            color: showCTA ? "#1A2233" : "inherit",
            transition: "background-color 0.3s",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Container maxWidth="lg">
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: showCTA ? "space-between" : "center",
                transition: "justify-content 0.3s",
                minHeight: { xs: 56, sm: 64 },
              }}
            >
              <Box
                component="img"
                src="/images/logo.webp"
                alt="لوگو فینوجا"
                loading="eager"
                sx={{ height: { xs: 80, sm: 88 }, width: "auto" }}
              />
              {showCTA && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSignupClick}
                  sx={{
                    bgcolor: "#66DE93",
                    color: "#1A2233",
                    fontWeight: "bold",
                    borderRadius: 8,
                    px: 4,
                    py: 0.8,
                    minWidth: 140,
                    "&:hover": { bgcolor: "#4dca80" },
                  }}
                >
                  همین حالا شروع کنید
                </Button>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {/* Spacer زیر نوار ثابت */}
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />

        {/* سکشن هِرو */}
        <HeroSection
          heroRef={heroRef}
          handleSignupClick={handleSignupClick}
          handleLoginClick={handleLoginClick}
        />

        {/* سایر سکشن‌ها */}
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
        <FinalCTASection handleSignupClick={handleSignupClick} />
        <FooterSection />

        {/* مودال احراز هویت */}
        <AuthStepperModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultStep={authTab}
        />
      </Box>
    </>
  );
}

/* =========================================================
   Hero Section
========================================================= */
const HeroSection = ({ heroRef, handleSignupClick, handleLoginClick }) => (
  <Box
    ref={heroRef}
    sx={{
      py: 8,
      background: "linear-gradient(135deg,#D2E7FF 0%,#FFFFFF 100%)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* دایره‌های تزئینی */}
    <Box
      sx={{
        position: "absolute",
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: "50%",
        bgcolor: "rgba(102,222,147,0.1)",
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
        bgcolor: "rgba(36,119,243,0.1)",
      }}
    />

    <Container maxWidth="lg">
      <Grid
        container
        spacing={6}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* متن و CTA‌ها */}
        <Grid item xs={12} md={7} sx={{ zIndex: 1 }}>
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
                با روشی مشابه دولینگو، مفاهیم پیچیده مالی را به ساده‌ترین شکل
                یاد بگیرید. مدرک معتبر دریافت کنید و وارد بازار کار شوید!
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSignupClick}
                  sx={{
                    bgcolor: "#66DE93",
                    color: "#1A2233",
                    fontWeight: "bold",
                    py: 1.5,
                    width: { xs: "100%", sm: 220 },
                    borderRadius: 12,
                    fontSize: "1.1rem",
                    "&:hover": { bgcolor: "#4dca80" },
                  }}
                >
                  شروع رایگان
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLoginClick}
                  sx={{
                    borderColor: "#2477F3",
                    color: "#2477F3",
                    fontWeight: "bold",
                    py: 1.5,
                    width: { xs: "100%", sm: 220 },
                    borderRadius: 12,
                    fontSize: "1.1rem",
                    "&:hover": { bgcolor: "#D2E7FF" },
                  }}
                >
                  قبلاً ثبت‌نام کرده‌ام
                </Button>
              </Box>
              <Box
                sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}
              >
                <CheckCircleIcon sx={{ color: "#66DE93" }} />
                <Typography variant="body2" color="#1A2233">
                  بدون نیاز به کارت بانکی
                </Typography>
              </Box>
            </Box>
          </Slide>
        </Grid>

        {/* تصویر بنر */}
        <Grid item xs={12} md={5}>
          <Fade in timeout={800}>
            <Box
              sx={{
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                maxWidth: { xs: 320, md: 400 },
                mx: "auto",
              }}
            >
              <Box
                component="img"
                src="/images/banner.webp"
                alt="بنر فینوجا"
                loading="eager"
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  height: "auto",
                  mx: "auto",
                }}
              />
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

/* ------------------------ Features ------------------------ */
const FeaturesSection = () => (
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

      <Stack spacing={12}>
        {features.map((feature, i) => (
          <Grid
            container
            key={i}
            alignItems="center"
            direction={{
              xs: "column-reverse", // موبایل: عکس بالا، متن پایین
              md: i % 2 === 0 ? "row-reverse" : "row", // دسکتاپ: یکی در میان
            }}
            spacing={0}
            sx={{
              minHeight: { md: 320 },
            }}
          >
            {/* متن */}
            <Grid
              item
              xs={12}
              md={6}
              key={i}
              sx={{
                display: "flex",
                justifyContent: "center",
                direction: "rtl",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: { xs: "left", md: "left" },
                  ml: {
                    xs: 0, // موبایل: عکس بالا، متن پایین
                    md: i % 2 === 0 ? "20rem" : "0rem ",
                  },
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#1A2233"
                  sx={{ mb: 2 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  color="#666"
                  sx={{ fontSize: "1.18rem", lineHeight: 2 }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>

            {/* عکس/آیکن */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center",
                ml: {
                  xs: 0, // موبایل: عکس بالا، متن پایین
                  md: i % 2 === 0 ? "0rem" : "20rem ",
                },
              }}
            >
              <Box
                sx={{
                  alignItems: "center",
                  height: { xs: 180, md: 280 },
                  minHeight: 120,
                  width: "100%",
                }}
              >
                {feature.img ? (
                  <Box
                    component="img"
                    src={feature.img}
                    alt={feature.title}
                    loading="lazy"
                    sx={{
                      width: { xs: 160, sm: 210, md: 250 },
                      maxWidth: "100%",
                      height: "auto",
                      display: "block",
                      mx: "auto",
                      my: { xs: 1, md: 0 },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      bgcolor: feature.color,
                      borderRadius: "50%",
                      width: 120,
                      height: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Container>
  </Box>
);

/* -------------------- How it Works -------------------- */
const HowItWorksSection = () => (
  <Box sx={{ py: 10, bgcolor: "#1A2233" }}>
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        color="#fff"
        sx={{ mb: 2 }}
      >
        چگونه کار می‌کند؟
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="#fefefe"
        sx={{ mb: 8, maxWidth: 600, mx: "auto" }}
      >
        فقط ۴ مرحله ساده تا تسلط بر مفاهیم مالی
      </Typography>
      <AnimatedSteps />
    </Container>
  </Box>
);

/* -------------------- Benefits -------------------- */
const BenefitsSection = () => (
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

      <Stack spacing={12}>
        {webAppBenefits.map((benefit, i) => (
          <Grid
            container
            key={i}
            alignItems="center"
            direction={{
              xs: "column-reverse", // موبایل: عکس بالا
              md: i % 2 === 0 ? "row-reverse" : "row", // یکی در میان جابه‌جا
            }}
            spacing={0}
            sx={{
              minHeight: { md: 320 },
            }}
          >
            {/* متن */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center",
                direction: "rtl",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: { xs: "left", md: "left" },
                  ml: {
                    xs: 0,
                    md: i % 2 === 0 ? "20rem" : "0rem ",
                  },
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#1A2233"
                  sx={{ mb: 2 }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  color="#666"
                  sx={{ fontSize: "1.18rem", lineHeight: 2 }}
                >
                  {benefit.description}
                </Typography>
              </Box>
            </Grid>
            {/* عکس */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center",
                ml: {
                  xs: 0,
                  md: i % 2 === 0 ? "0rem" : "20rem ",
                },
              }}
            >
              <Box
                sx={{
                  alignItems: "center",
                  height: { xs: 180, md: 280 },
                  minHeight: 120,
                  width: "100%",
                }}
              >
                <Box
                  component="img"
                  src={benefit.img}
                  alt={benefit.title}
                  loading="lazy"
                  sx={{
                    width: { xs: 160, sm: 210, md: 250 },
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    mx: "auto",
                    my: { xs: 1, md: 0 },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Container>
  </Box>
);

/* -------------------- Testimonials -------------------- */
const TestimonialsSection = () => (
  <Box sx={{ py: 10, bgcolor: "#F9FAFB" }}>
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        color="#1A2233"
        sx={{ mb: 2 }}
      >
        نظرات کاربران
      </Typography>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        breakpoints={{
          600: { slidesPerView: 1 },
          900: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        }}
        style={{ paddingBottom: "64px", paddingTop: "32px" }}
      >
        {testimonials.map((item, i) => (
          <SwiperSlide key={i} style={{ height: "100%" }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 6,
                height: "100%",
                boxShadow: "0 4px 32px rgba(36,119,243,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px) scale(1.03)",
                  boxShadow: "0 8px 48px rgba(36,119,243,0.13)",
                },
                minHeight: { xs: 300, sm: 340, md: 380 }, // برای ظاهر یکنواخت‌تر
              }}
            >
              <Avatar src={item.avatar} sx={{ width: 70, height: 70, mb: 2 }} />
              <Typography fontWeight="bold" fontSize="1.08rem" sx={{ mb: 0.2 }}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="#888" sx={{ mb: 2 }}>
                {item.job}
              </Typography>
              <Typography
                color="#666"
                sx={{
                  lineHeight: 2,
                  mb: 2,
                  flex: 1, // این باعث میشه متن فضای وسط رو بگیره و بقیه پایین باشه
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {`"${item.text}"`}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.3 }}>
                {[...Array(5)].map((_, star) => (
                  <Box key={star} sx={{ color: "#FFD700", fontSize: 22 }}>
                    ★
                  </Box>
                ))}
              </Box>
            </Paper>
          </SwiperSlide>
        ))}
      </Swiper>
    </Container>
  </Box>
);

/* -------------------- Final CTA -------------------- */
const FinalCTASection = ({ handleSignupClick }) => (
  <Box
    sx={{
      py: 12,
      bgcolor: "#2477F3",
      color: "white",
      textAlign: "center",
      backgroundImage: "linear-gradient(135deg,#2477F3 0%,#1A56DB 100%)",
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
        bgcolor: "rgba(255,255,255,0.1)",
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
        bgcolor: "rgba(255,255,255,0.1)",
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
        onClick={handleSignupClick}
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
            boxShadow: "0 8px 24px rgba(102,222,147,0.5)",
          },
        }}
      >
        ثبت‌نام رایگان
      </Button>
      <Typography sx={{ mt: 3, opacity: 0.9 }}>
        اولین درس رایگان است. هیچ کارت بانکی نیاز نیست.
      </Typography>
    </Container>
  </Box>
);

/* -------------------- Footer -------------------- */
const FooterSection = () => (
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
            {["instagram", "telegram", "linkedin"].map((icon) => (
              <IconButton
                key={icon}
                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <Box component="span" className={`fab fa-${icon}`} />
              </IconButton>
            ))}
          </Box>
        </Grid>

        <Grid item xs={6} md={2}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            لینک‌های مفید
          </Typography>
          <Stack spacing={1}>
            {["درباره ما", "تماس با ما", "سوالات متداول", "بلاگ"].map(
              (link) => (
                <Typography key={link} variant="body2">
                  {link}
                </Typography>
              )
            )}
          </Stack>
        </Grid>

        <Grid item xs={6} md={2}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            محصولات
          </Typography>
          <Stack spacing={1}>
            {["دوره‌ها", "وب‌اپلیکیشن", "مدرک", "توصیه‌نامه"].map((link) => (
              <Typography key={link} variant="body2">
                {link}
              </Typography>
            ))}
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
                "&:hover": { bgcolor: "#4dca80" },
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
);

/* -------------------- Animated Steps -------------------- */
const AnimatedSteps = () => {
  const [cardAnimStep, setCardAnimStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCardAnimStep((v) => (v + 1) % 5);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Grid
      container
      spacing={4}
      justifyContent="center"
      alignItems="stretch"
      sx={{ mb: 2 }}
    >
      {howItWorks.map((step, i) => {
        // روشن بودن کارت‌ها
        let isLit = cardAnimStep === 4 ? false : i <= cardAnimStep;
        // مشخص کردن اینکه آیا این مرحله آخر است و باید طلایی شود
        const isFinalStep = i === 3;
        const isGolden = isFinalStep && isLit;

        return (
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
            <motion.div
              animate={{
                boxShadow: isGolden
                  ? "0 0 42px 8px rgba(255, 215, 0, 0.5)"
                  : isLit
                  ? "0 0 42px 8px #66DE9388"
                  : "none",
                y: isLit ? -6 : 0,
                scale: isLit ? 1.04 : 1,
              }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 32,
                overflow: "visible",
                transition: "box-shadow 0.3s, background 0.3s",
              }}
            >
              <Paper
                elevation={isLit ? 0 : 3}
                sx={{
                  p: 4,
                  borderRadius: "32px",
                  bgcolor: isGolden ? "#FFF9E6" : isLit ? "#e8faed" : "white",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  minHeight: 230,
                  border: isGolden
                    ? "2.5px solid #FFD700"
                    : isLit
                    ? "2.5px solid #66DE93"
                    : "2.5px solid #E8EAF0",
                  boxShadow: "none",
                  position: "relative",
                  transition: "background 0.3s, border 0.3s",
                  zIndex: isLit ? 2 : 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    bgcolor: isGolden
                      ? "#FFD700"
                      : isLit
                      ? "#66DE93"
                      : "#6AD5B6",
                    color: "white",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    mb: 2,
                    boxShadow: isGolden
                      ? "0 0 24px 2px rgba(255, 215, 0, 0.7)"
                      : isLit
                      ? "0 0 24px 2px #66DE93bb"
                      : "0 2px 8px #BFEACB44",
                    border: isGolden
                      ? "2.5px solid #FFF0B3"
                      : isLit
                      ? "2.5px solid #bfeacb"
                      : "2.5px solid #d2e7ff",
                    transition: "background 0.3s, border 0.3s",
                    zIndex: 2,
                  }}
                >
                  {step.step}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={isGolden ? "#8B7500" : "#1A2233"}
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
                <Typography
                  color={isGolden ? "#8B7500" : "#666"}
                  sx={{ fontSize: "1rem", mt: 1 }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
};
