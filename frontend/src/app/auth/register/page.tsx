"use client";

import { useState } from "react";
import { authService } from "@/lib/api";
import { useRouter } from "next/navigation";
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
            await authService.register({
                full_name: fullName,
                phone_number: phoneNumber,
                password: password,
            });
            // Simplified redirect
            window.location.href = "/auth/login?registered=true";
        } catch (err: any) {
            console.error("Registration error:", err);
            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            let message = "Ro'yxatdan o'tishda xatolik yuz berdi";
            if (typeof detail === 'string') {
                message = detail;
            } else if (Array.isArray(detail)) {
                message = detail[0]?.msg || "Ma'lumotlar xato";
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Ro'yxatdan o'tish</h1>
                    <p className="text-gray-500">Yangi hisob yaratish uchun ma'lumotlarni kiriting</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={20} className="shrink-0" />
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
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
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
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
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
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
            </div>
        </div>
    );
}
