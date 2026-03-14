"use client";

import { useEffect, useState } from "react";
import { appointmentService } from "@/lib/api";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle, RefreshCcw, Stethoscope } from "lucide-react";
import { clsx } from "clsx";

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const response = await appointmentService.getDoctorQueue();
            setAppointments(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Navbatlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        // Refresh queue every 30 seconds
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
                        Shifokor Paneli
                    </h1>
                    <p className="text-gray-500 font-medium">Sizning kundalik navbatlaringiz va bemorlar nazorati</p>
                </div>
                <button
                    onClick={fetchQueue}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw className={clsx("w-5 h-5", loading && "animate-spin")} />
                    Yangilash
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Users size={32} />
                    </div>
                    <div>
                        <div className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Navbatdagilar</div>
                        <div className="text-4xl font-black">{appointments.length}</div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Xizmat ko'rsatildi</div>
                        <div className="text-4xl font-black text-gray-900">0</div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <Clock size={32} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">O'rtacha vaqt</div>
                        <div className="text-4xl font-black text-gray-900">15m</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <Stethoscope className="text-blue-600" />
                        Navbatdagi bemorlar
                    </h2>
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
                        Bugun
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="px-8 py-5">№</th>
                                <th className="px-8 py-5">Bemor ID</th>
                                <th className="px-8 py-5">Vaqt</th>
                                <th className="px-8 py-5">Kutilayotgan vaqt</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                                        Hozirda navbatlar yo'q
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((apt, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={apt.id}
                                        className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {apt.queue_number}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900">Bemor #{apt.patient_id}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-semibold text-gray-500">
                                                {apt.scheduled_time ? new Date(apt.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Navbatda"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
                                                <span className="font-bold text-blue-600">~{apt.predicted_wait_time} daqiqa</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black uppercase">
                                                Kutilmoqda
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                                Qabul qilish
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
