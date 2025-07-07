'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Container,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AuthStepperModal from '../components/AuthStepperModal'; // مسیر صحیح

const features = [
  {
    title: 'آموزش تعاملی',
    description: 'مینی‌گیم‌ها و تمرین‌های روزانه برای یادگیری بهتر مفاهیم مالی، مثل دولینگو!',
    icon: '💡',
  },
  {
    title: 'مدرک و توصیه‌نامه',
    description: 'بعد از پایان دوره، مدرک رسمی و توصیه‌نامه حرفه‌ای قابل ارائه دریافت کن.',
    icon: '🎓',
  },
  {
    title: 'مسیر شغلی شخصی',
    description: 'بر اساس هدف و سطح شما، مسیر یادگیری کاملاً شخصی‌سازی شده.',
    icon: '🚀',
  },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: 20,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  height: '100%',
}));

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <Box sx={{ direction: 'rtl', bgcolor: '#F9FAFB' }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 10,
          px: 2,
          background: 'linear-gradient(to left top, #D2E7FF, #F9FAFB)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom color="#1A2233">
                آموزش مالی مدرن با <span style={{ color: '#2477F3' }}>فینوجا</span>
              </Typography>
              <Typography variant="h6" color="#1A2233" sx={{ mb: 4 }}>
                یاد بگیر، تمرین کن، مدرک بگیر و وارد بازار کار شو!  
                تجربه‌ای مشابه دولینگو، اما در دنیای مالی.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#66DE93',
                  color: '#1A2233',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#2477F3',
                    color: '#fff',
                  },
                }}
                onClick={() => setAuthOpen(true)}
              >
                همین حالا رایگان شروع کن
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/images/logo.png"
                alt="لوگو فینوجا"
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  borderRadius: 5,
                  boxShadow: 4,
                  mx: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color="#1A2233"
            sx={{ mb: 6 }}
          >
            چرا فینوجا؟
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, i) => (
              <Grid item xs={12} md={4} key={i}>
                <StyledPaper>
                  <Typography variant="h3" gutterBottom>{feature.icon}</Typography>
                  <Typography variant="h6" fontWeight="bold" color="#2477F3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="#1A2233">{feature.description}</Typography>
                </StyledPaper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          py: 8,
          backgroundColor: '#2477F3',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            آماده‌ای که مهارت مالی‌تو حرفه‌ای کنی؟
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            همین الان ثبت‌نام کن و یادگیری رو شروع کن.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#66DE93',
              color: '#1A2233',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#D2E7FF',
              },
            }}
            onClick={() => setAuthOpen(true)}
          >
            ثبت‌نام رایگان
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, textAlign: 'center', bgcolor: '#F9FAFB', borderTop: '1px solid #D2E7FF' }}>
        <Typography variant="body2" color="#1A2233">
          ساخته شده با ❤️ توسط تیم فینوجا - {new Date().getFullYear()}
        </Typography>
      </Box>

      {/* --- MODAL LOGIN/REGISTER --- */}
            <AuthStepperModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </Box>
  );
}
