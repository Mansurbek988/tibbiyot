"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { authService } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await authService.getMe();
          setUser(response.data);
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Bosh sahifa", roles: ["patient", "doctor", "admin"] },
    { href: "/doctors", label: "Shifokorlar", roles: ["patient", "admin"] },
    { href: "/my-queues", label: "Navbatlarim", roles: ["patient"] },
    { href: "/doctor-dashboard", label: "Shifokor Paneli", roles: ["doctor", "admin"] },
  ];

  const filteredLinks = navLinks.filter(link =>
    !user ? link.href === "/" : link.roles.includes(user.role)
  );

  return (
    <html lang="uz">
      <body className={clsx(inter.className, "bg-gray-50 text-gray-900 min-h-screen")}>
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                  T
                </div>
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                  Tibbiyot
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                {filteredLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "text-sm font-semibold transition-all hover:text-blue-600",
                      pathname === link.href ? "text-blue-600" : "text-gray-500"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                      }}
                      className="text-sm font-bold text-red-500 hover:text-red-600"
                    >
                      Chiqish
                    </button>
                  </div>
                ) : (
                  <Link href="/auth/login" className="btn-primary px-6 py-2.5 text-sm">
                    Kirish
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
