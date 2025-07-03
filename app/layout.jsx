// بدون use client
import '../styles/font.css';
import ThemeRegistry from './ThemeRegistry'; // فایل بعدی

export const metadata = {
  title: 'فینوجا | یادگیری مالی به سبک دولینگو',
  description: 'آموزش مالی، مدرک، توصیه‌نامه. یادگیری تعاملی و حرفه‌ای.',
  icons: {
    icon: '/favicon/android-chrome-192x192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
