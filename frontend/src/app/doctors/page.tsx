"use client";

import { useState, useEffect, Suspense } from "react";
import { appointmentService } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, Star, MapPin, Search, CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

function DoctorsList() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [bookingId, setBookingId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const querySearch = searchParams.get("search");
        if (querySearch) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

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

    const handleBook = async (doctorId: number) => {
        setBookingId(doctorId);
        try {
            await appointmentService.book(doctorId);
            setSuccessMessage("Navbatga muvaffaqiyatli yozildingiz! 'Navbatlarim' bo'limida kuzatishingiz mumkin.");
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error("Booking error:", error);
            alert(error.response?.data?.detail || "Navbatga yozilishda xato yuz berdi. Balki tizimga kirmagandirsiz?");
        } finally {
            setBookingId(null);
        }
    };

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
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="col-span-full bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center justify-between mb-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3 font-medium">
                                    <CheckCircle2 className="text-green-600" />
                                    {successMessage}
                                </div>
                                <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700">
                                    <X size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors uppercase">{doctor.user?.full_name}</h3>
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

                            <button 
                                onClick={() => handleBook(doctor.id)}
                                disabled={bookingId === doctor.id}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {bookingId === doctor.id ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : "Navbatga yozilish"}
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

export default function DoctorsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            <DoctorsList />
        </Suspense>
    );
}
