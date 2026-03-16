"use client";

import { useState } from "react";
import { authService } from "@/lib/api";

export default function LoginForm({ isRegistered }: { isRegistered: boolean }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("username", phoneNumber);
            formData.append("password", password);

            const response = await authService.login(formData);
            if (response && response.data && response.data.access_token) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", response.data.access_token);

                    // Fetch user info to determine redirect
                    const userResponse = await authService.getMe();
                    const user = userResponse.data;

                    if (user.role === 'admin') {
                        window.location.href = "/admin-dashboard";
                    } else if (user.role === 'doctor') {
                        window.location.href = "/doctor-dashboard";
                    } else {
                        window.location.href = "/my-queues";
                    }
                }
            } else {
                setError("Tizimga kirishda xatolik");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.response?.data?.detail || "Telefon raqam yoki parol xato");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 text-3xl">
                    K
                </div>
                <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Xush kelibsiz</h1>
                <p className="text-gray-500">Profilga kirish uchun ma'lumotlarni kiriting</p>
            </div>

            {isRegistered && !error && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-center">
                    <p className="text-sm font-medium">Muvaffaqiyatli ro'yxatdan o'tdingiz!</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <input
                        type="text"
                        required
                        placeholder="Telefon raqami"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        required
                        placeholder="Parol"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Yuklanmoqda..." : "Tizimga kirish"}
                </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-8">
                <p className="text-gray-500 mb-2">Hisobingiz yo'qmi?</p>
                <a href="/auth/register" className="text-blue-600 font-bold hover:underline">
                    Ro'yxatdan o'tish
                </a>
            </div>
        </div>
    );
}
