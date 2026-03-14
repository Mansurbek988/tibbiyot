import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartMed Queue | Aqlli Navbat Tizimi",
  description: "AI yordamida navbatni boshqarish va onlayn ro'yxatdan o'tish tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={inter.className}>
        <nav className="nav-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">+</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  SmartMed Queue
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Bosh sahifa</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Shifokorlar</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Navbatlarim</a>
                <button className="btn-primary">Kirish</button>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500">© 2026 SmartMed Queue. Barcha huquqlar himoyalangan.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
