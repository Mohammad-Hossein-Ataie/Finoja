'use client';
import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F9FAFB',
        textAlign: 'center',
        py: 6,
      }}
    >
      {/* عکس 404، فرض بر این که آدرسش public/images/404.webp است */}
      <Box sx={{ maxWidth: 400, mb: 3 }}>
        <Image
          src="/images/404.webp"
          alt="404 - صفحه پیدا نشد"
          width={400}
          height={320}
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </Box>
      <Typography variant="h3" fontWeight="bold" color="#1A2233" gutterBottom>
        صفحه مورد نظر پیدا نشد!
      </Typography>
      <Typography color="#666" sx={{ mb: 4 }}>
        متاسفیم، صفحه‌ای که به دنبال آن بودید وجود ندارد یا حذف شده است.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => router.push('/')}
        sx={{
          bgcolor: "#66DE93",
          color: "#1A2233",
          fontWeight: "bold",
          px: 6,
          py: 1.5,
          borderRadius: 8,
          fontSize: "1.1rem",
          '&:hover': { bgcolor: "#4dca80" }
        }}
      >
        بازگشت به خانه
      </Button>
    </Box>
  );
}
