"use client";

import { useState, useEffect, use } from "react";
import { adminService, appointmentService } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function EditDoctor({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const doctorId = parseInt(id);

    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        password: "", // Optional update
        specialization: "",
        avg_consultation_time: 15
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await appointmentService.getDoctor(doctorId);
                const doc = response.data;
                setFormData({
                    full_name: doc.user.full_name,
                    phone_number: doc.user.phone_number,
                    password: "", // Keep password empty initially
                    specialization: doc.specialization,
                    avg_consultation_time: doc.avg_consultation_time
                });
            } catch (err: any) {
                setError("Shifokor ma'lumotlarini yuklashda xatolik");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);

        try {
            const userData: any = {
                full_name: formData.full_name,
                phone_number: formData.phone_number,
            };
            if (formData.password) {
                userData.password = formData.password;
            }

            const doctorData = {
                specialization: formData.specialization,
                avg_consultation_time: formData.avg_consultation_time
            };

            await adminService.updateDoctor(doctorId, userData, doctorData);
            setSuccess(true);
            setTimeout(() => router.push("/admin-dashboard/doctors"), 2000);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail[0]?.msg || "Ma'lumotlar xato yuborildi");
            } else {
                setError(detail || "O'zgartirishlarni saqlashda xatolik yuz berdi");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Shifokorni Tahrirlash</h1>
                    <p className="text-gray-500 mb-10">Shifokor ma'lumotlarini yangilang</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-8 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-8 text-sm font-medium">
                            Muvaffaqiyatli saqlandi! Ro'yxatga yo'naltirilmoqda...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">To'liq Ism Sharif</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Raqam</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Parol (O'zgartirish uchun yozing, aks holda bo'sh qoldiring)</label>
                            <input
                                type="password"
                                placeholder="********"
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mutaxassislik</label>
                                <select
                                    required
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                >
                                    <option value="">Tanlang</option>
                                    <option value="Cardiologist">Kardiolog</option>
                                    <option value="Neurologist">Nevrolog</option>
                                    <option value="Gastroenterologist">Gastroenterolog</option>
                                    <option value="Orthopedist">Ortoped</option>
                                    <option value="Dermatologist">Dermatolog</option>
                                    <option value="Ophthalmologist">Oftalmolog</option>
                                    <option value="General Practitioner">Terapevt</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kutish Vaqti (min)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    value={formData.avg_consultation_time || ''}
                                    onChange={(e) => setFormData({ ...formData, avg_consultation_time: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={saving}
                            type="submit"
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl text-lg font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
                        >
                            {saving ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
