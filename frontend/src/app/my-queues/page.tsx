"use client";

import { useState, useEffect } from "react";
import { appointmentService } from "@/lib/api";
import { motion } from "framer-motion";
import { Clock, Calendar, User, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MyQueuesPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await appointmentService.getMyAppointments();
                setAppointments(response.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    setError("Iltimos, avval tizimga kiring");
                } else {
                    setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center px-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-4">{error}</h2>
                <Link href="/auth/login" className="btn-primary inline-block">
                    Kirish
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-extrabold mb-8">Mening Navbatlarim</h1>

            {appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map((app, index) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center">
                                    <span className="text-xs font-medium uppercase">No</span>
                                    <span className="text-2xl font-bold">{app.queue_number}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-blue-600 mb-1 font-semibold">
                                        <User size={16} />
                                        <span>{app.doctor?.full_name || "Shifokor"}</span>
                                    </div>
                                    <h3 className="text-xl font-bold">{app.doctor?.specialization || "Umumiy"}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{new Date(app.created_at).toLocaleDateString('uz-UZ')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{new Date(app.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                <div className="text-left md:text-right">
                                    <p className="text-sm text-gray-500 mb-1">Kutilayotgan vaqt</p>
                                    <p className="text-2xl font-bold text-blue-600">~{app.predicted_wait_time} daqiqa</p>
                                </div>
                                <span className={`px-4 py-1 rounded-full text-sm font-bold ${app.status === 'in_queue' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {app.status === 'in_queue' ? 'Navbatda' : app.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Clock size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-600 mb-4">Sizda faol navbatlar yo'q</h3>
                    <Link href="/doctors" className="btn-primary inline-flex items-center gap-2">
                        Navbatga yozilish <ArrowRight size={20} />
                    </Link>
                </div>
            )}
        </div>
    );
}
