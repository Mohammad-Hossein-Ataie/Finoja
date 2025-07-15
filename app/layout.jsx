// بدون use client
import '../styles/font.css';
import ThemeRegistry from './ThemeRegistry';

export const metadata = {
  title: 'فینوجا | یادگیری مالی به سبک دولینگو',
  description: 'فینوجا یک وب‌اپلیکیشن تعاملی آموزش مالی است که با بازی‌وارسازی، یادگیری اصول مالی، مدیریت هزینه و سرمایه‌گذاری را برای همه آسان و جذاب می‌کند. همین حالا شروع کنید، مدرک معتبر بگیرید و آماده ورود به بازار کار شوید!',
  icons: {
    icon: '/favicon/android-chrome-192x192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap"
        />
        {/* Favicon for all browsers & search engines */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        {/* SEO Meta */}
        <meta
          name="description"
          content="فینوجا یک وب‌اپلیکیشن تعاملی آموزش مالی است که با بازی‌وارسازی، یادگیری اصول مالی، مدیریت هزینه و سرمایه‌گذاری را برای همه آسان و جذاب می‌کند. همین حالا شروع کنید، مدرک معتبر بگیرید و آماده ورود به بازار کار شوید!"
        />
      </head>
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
