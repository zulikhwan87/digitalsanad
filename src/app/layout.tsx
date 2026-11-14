import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MySanad – Malaysia Digital Sanad Directory & Management System',
  description:
    'Platform Pendigitalan Profil dan Rangkaian Sanad Guru al-Quran Malaysia. Sumber rujukan masyarakat dan pemeliharaan khazanah ilmu Qiraat & Sanad.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className="scroll-smooth">
      <body className="min-h-screen bg-[#FAF8FF] text-[#1F2937] antialiased">
        {children}
      </body>
    </html>
  );
}
