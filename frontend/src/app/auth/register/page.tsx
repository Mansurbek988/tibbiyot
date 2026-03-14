"use client";

import { useState } from "react";
import { authService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.register({
                full_name: fullName,
                phone_number: phoneNumber,
                password: password,
            });
            console.log("Registration successful:", response.data);
            // After registration, redirect to login
            router.push("/auth/login?registered=true");
        } catch (err: any) {
            console.error("Registration error details:", err);
            const status = err.response?.status;
            const detail = err.response?.data?.detail;
            const traceback = err.response?.data?.traceback;

            let message = "Ro'yxatdan o'tishda xatolik yuz berdi";

            if (status === 404) {
                message = "API topilmadi (404). Backend ulanishini tekshiring.";
            } else if (typeof detail === 'string') {
                message = detail;
            } else if (Array.isArray(detail)) {
                message = detail[0]?.msg || JSON.stringify(detail);
            } else if (status) {
                message = `Xatolik yuz berdi (Status: ${status})`;
            }

            if (traceback) {
                console.error("Backend Traceback:", traceback);
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl shadow-blue-100 border border-gray-100"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2">Ro'yxatdan o'tish</h1>
                    <p className="text-gray-500">Yangi hisob yaratish uchun ma'lumotlarni kiriting</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="To'liq ismingiz"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="Telefon raqamingiz"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="Parol yaratish"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Hisob yaratish"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-8">
                    <p className="text-gray-500 mb-2">Hisobingiz bormi?</p>
                    <Link href="/auth/login" className="text-blue-600 font-bold hover:underline">
                        Tizimga kirish
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
