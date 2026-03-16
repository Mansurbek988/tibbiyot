"use client";

import { useState } from "react";
import { adminService } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function AddDoctor() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        password: "",
        specialization: "",
        avg_consultation_time: 15
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const userData = {
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                password: formData.password,
                role: "doctor"
            };
            await adminService.createDoctor(userData, formData.specialization, formData.avg_consultation_time);
            setSuccess(true);
            setTimeout(() => router.push("/admin-dashboard"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Shifokor qo'shishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />
            <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Yangi Shifokor Qo'shish</h1>
                    <p style={{ color: '#6b7280', marginBottom: '32px' }}>Tizimga yangi mutaxassisni ro'yxatdan o'tkazing</p>

                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', color: '#15803d', padding: '12px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
                            Shifokor muvaffaqiyatli qo'shildi! Dashboardga yo'naltirilmoqda...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>To'liq Ism Sharif</label>
                            <input
                                required
                                type="text"
                                placeholder="Masalan: Dr. Alisher Vohidov"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Telefon Raqam</label>
                            <input
                                required
                                type="text"
                                placeholder="998901234567"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Parol (Login uchun)</label>
                            <input
                                required
                                type="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Mutaxassislik</label>
                                <select
                                    required
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '16px', backgroundColor: 'white' }}
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
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Kutish Vaqti (min)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.avg_consultation_time}
                                    onChange={(e) => setFormData({ ...formData, avg_consultation_time: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '16px' }}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '14px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '12px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Yaratilmoqda..." : "Shifokorni Saqlash"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
