"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface Stats {
    total_appointments: number;
    active_doctors: number;
    total_patients: number;
    in_queue_load: number;
    ai_predictions_count: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminService.getStats();
                setStats(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Statistikalarni yuklashda xatolik");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>Yuklanmoqda...</div>;

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />
            <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', margin: 0 }}>Admin Panel</h1>
                    <p style={{ color: '#6b7280', marginTop: '8px' }}>Tizimning umumiy holati va statistikasi</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <StatCard title="Jami Navbatlar" value={stats?.total_appointments || 0} icon="📅" color="#3b82f6" />
                    <StatCard title="Shifokorlar" value={stats?.active_doctors || 0} icon="👨‍⚕️" color="#10b981" />
                    <StatCard title="Bemorlar" value={stats?.total_patients || 0} icon="👥" color="#8b5cf6" />
                    <StatCard title="Hozirgi Navbatlar" value={stats?.in_queue_load || 0} icon="⏳" color="#f59e0b" />
                    <StatCard title="AI Bashoratlar" value={stats?.ai_predictions_count || 0} icon="🤖" color="#ec4899" />
                </div>

                {/* Quick Actions */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Tezkor Amallar</h2>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <a href="/admin-dashboard/add-doctor" style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}>+ Yangi Shifokor Qo'shish</a>
                        <a href="/admin-dashboard/doctors" style={{
                            backgroundColor: '#f3f4f6',
                            color: '#1f2937',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}>Shifokorlar Ro'yxati</a>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: `${color}1A`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
            }}>{icon}</div>
            <div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</p>
                <p style={{ color: '#111827', fontSize: '24px', fontWeight: '800', margin: 0 }}>{value}</p>
            </div>
        </div>
    );
}
