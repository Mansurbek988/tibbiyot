"use client";

import React, { useState, useEffect } from 'react';

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);

    // Using useEffect + URLSearchParams for absolute stability across Next.js versions
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const params = new URLSearchParams(window.location.search);
                if (params.get("registered") === "true") {
                    setIsRegistered(true);
                }
            } catch (e) {
                console.warn("Search params error:", e);
            }
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // FastAPI OAuth2 expects form-urlencoded data
            const formData = new URLSearchParams();
            formData.append("username", phone);
            formData.append("password", password);

            const res = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
                body: formData.toString(),
            });

            if (res.ok) {
                const data = await res.json();
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", data.access_token);

                    // Fetch user info to determine redirect
                    const meRes = await fetch("/api/v1/auth/me", {
                        headers: {
                            "Authorization": `Bearer ${data.access_token}`
                        }
                    });

                    if (meRes.ok) {
                        const user = await meRes.json();
                        console.log("Login page fetched user info:", user);

                        // Robust role check
                        const checkRole = (r: string) => {
                            if (!user.role) return false;
                            const userRole = String(user.role).toLowerCase();
                            return userRole === r.toLowerCase() || userRole.includes(r.toLowerCase());
                        };

                        if (checkRole('admin')) {
                            window.location.href = "/admin-dashboard";
                        } else if (checkRole('doctor')) {
                            window.location.href = "/doctor-dashboard";
                        } else {
                            window.location.href = "/my-queues";
                        }
                    } else {
                        const errData = await meRes.json().catch(() => ({}));
                        console.error("Failed to fetch user info after login:", meRes.status, errData);
                        window.location.href = "/";
                    }
                }
            } else {
                const data = await res.json();
                setError(data.detail || "Telefon raqam yoki parol xato");
            }
        } catch (err) {
            console.error("Login fetch error:", err);
            setError("Server bilan ulanishda xato yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '420px',
                width: '100%',
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        margin: '0 auto 16px auto'
                    }}>
                        T
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: '#0f172a' }}>
                        Xush kelibsiz
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Profilingizga kiring</p>
                </div>

                {isRegistered && !error && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        Muvaffaqiyatli ro'yxatdan o'tdingiz!
                    </div>
                )}

                {error && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <input
                            type="text"
                            placeholder="Telefon raqami"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '14px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                boxSizing: 'border-box',
                                outline: 'none',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Parol"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '14px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                boxSizing: 'border-box',
                                outline: 'none',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '8px',
                            padding: '16px',
                            borderRadius: '14px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? "Yuklanmoqda..." : "Tizimga kirish"}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Hisobingiz yo'qmi?</p>
                    <a href="/auth/register" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                        Ro'yxatdan o'tish
                    </a>
                </div>
            </div>
        </div>
    );
}
