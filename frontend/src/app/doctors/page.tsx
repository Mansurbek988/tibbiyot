"use client";

import { useState, useEffect } from "react";
import { appointmentService } from "@/lib/api";
import { motion } from "framer-motion";
import { User, Clock, Star, MapPin, Search } from "lucide-react";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await appointmentService.getDoctors();
                setDoctors(response.data);
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doctor => {
        const fullName = doctor.user?.full_name || '';
        const specialization = doctor.specialization || '';
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            specialization.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Shifokorlarimiz</h1>
                    <p className="text-gray-500">Malakali mutaxassislarni toping va navbatga yoziling</p>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Ism yoki mutaxassislik bo'yicha qidirish..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDoctors.map((doctor, index) => (
                        <motion.div
                            key={doctor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white overflow-hidden rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all text-2xl font-black">
                                    {doctor.user?.full_name?.charAt(0) || <User size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{doctor.user?.full_name}</h3>
                                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8 pt-6 border-t border-gray-50">
                                <div className="flex items-center justify-between text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>O'rtacha vaqt</span>
                                    </div>
                                    <span className="font-bold">{doctor.avg_consultation_time} min</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Star className="text-yellow-400" size={16} />
                                        <span>Tajriba</span>
                                    </div>
                                    <span className="font-bold">{doctor.experience_years || 5} yil</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>Xona</span>
                                    </div>
                                    <span className="font-bold">{doctor.room_number || "A-1"}</span>
                                </div>
                            </div>

                            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                                Navbatga yozilish
                            </button>
                        </motion.div>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 grayscale opacity-50">
                            <Search size={64} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-xl text-gray-400 font-medium">Shifokorlar topilmadi</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
