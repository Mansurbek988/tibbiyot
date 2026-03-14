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

    const filteredDoctors = doctors.filter(doctor =>
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2">Shifokorlarimiz</h1>
                    <p className="text-gray-500">Malakali mutaxassislarni toping va navbatga yoziling</p>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Ism yoki mutaxassislik bo'yicha qidirish..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                            className="card-premium group"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{doctor.full_name}</h3>
                                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Clock size={18} />
                                    <span>O'rtacha vaqt: {doctor.avg_consultation_time} min</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Star className="text-yellow-400" size={18} />
                                    <span>Tajriba: {doctor.experience_years} yil</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <MapPin size={18} />
                                    <span>Room: {doctor.room_number}</span>
                                </div>
                            </div>

                            <button className="w-full btn-primary py-3">
                                Navbatga yozilish
                            </button>
                        </motion.div>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="col-span-full text-center py-20 grayscale opacity-50">
                            <Search size={64} className="mx-auto mb-4" />
                            <p className="text-xl">Shifokorlar topilmadi</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
