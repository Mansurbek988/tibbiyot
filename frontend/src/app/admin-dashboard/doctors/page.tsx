"use client";

import { useEffect, useState } from "react";
import { adminService, appointmentService } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { User, Trash2, Shield, Calendar, Clock } from "lucide-react";

export default function DoctorsList() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDoctors = async () => {
        try {
            const response = await appointmentService.getDoctors();
            setDoctors(response.data);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail[0]?.msg || "Ro'yxatni yuklashda xatolik");
            } else if (typeof detail === 'object' && detail !== null) {
                setError(JSON.stringify(detail));
            } else {
                setError(detail || "Shifokorlar ro'yxatini yuklashda xatolik");
            }
            console.error("Doctors list fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham ushbu shifokorni o'chirib tashlamoqchimisiz?")) return;

        try {
            await adminService.deleteDoctor(id);
            fetchDoctors(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.detail || "O'chirishda xatolik yuz berdi");
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
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Shifokorlar</h1>
                        <p className="text-gray-500 mt-2">Tizimdagi barcha faol mutaxassislar ro'yxati</p>
                    </div>
                    <a href="/admin-dashboard/add-doctor" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        + Yangi Shifokor
                    </a>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-8">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <User size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 font-medium italic">Hozircha shifokorlar qo'shilmagan</p>
                        </div>
                    ) : (
                        doctors.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {doc.user.full_name[0]}
                                    </div>
                                    <span className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        ID: {doc.id}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-gray-900 mb-1">{doc.user.full_name}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <Shield size={14} className="text-blue-500" />
                                    <span className="text-sm font-bold text-blue-600">{doc.specialization}</span>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={16} />
                                            <span>O'rtacha vaqt</span>
                                        </div>
                                        <span className="font-bold text-gray-700">{doc.avg_consultation_time} min</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={16} />
                                            <span>Navbatlar</span>
                                        </div>
                                        <span className="font-bold text-gray-700">{doc.appointments?.length || 0} ta</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 flex gap-3">
                                    <a 
                                        href={`/admin-dashboard/doctors/edit/${doc.id}`}
                                        className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-100 text-center"
                                    >
                                        Tahrirlash
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
