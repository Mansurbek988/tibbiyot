import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SmartMed Queue - Aqlli Navbat Tizimi",
  description: "AI yordamida shifokorlar uchun aqlli navbat boshqaruvi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, padding: 0 }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
