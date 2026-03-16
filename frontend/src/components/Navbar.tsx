"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/api";

export default function Navbar() {
    const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchUser = async () => {
            try {
                if (typeof window === "undefined") return;
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await authService.getMe();
                    const userData = response.data;
                    console.log("Navbar fetched user:", userData);
                    // Ensure userData is an object and has required fields
                    if (isMounted && userData && typeof userData === 'object' && userData.role) {
                        setUser(userData);
                    }
                }
            } catch (err) {
                console.warn("User fetch error:", err);
            } finally {
                if (isMounted) setIsLoaded(true);
            }
        };
        fetchUser();
        return () => { isMounted = false; };
    }, []);

    const logout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/";
        }
    };

    // Helper to check role safely
    const hasRole = (role: string) => {
        if (!user || !user.role) return false;
        const userRole = typeof user.role === 'string' ? user.role.toLowerCase() : String(user.role).toLowerCase();
        return userRole === role.toLowerCase() || userRole.includes(role.toLowerCase());
    };

    return (
        <nav style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '70px'
            }}>
                {/* Logo */}
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#2563eb',
                        borderRadius: '8px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>T</div>
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1e40af' }}>Tibbiyot</span>
                </a>

                {/* Space */}
                <div style={{ flex: 1 }}></div>

                {/* Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {isLoaded && user && hasRole('patient') && (
                        <a href="/my-queues" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Navbatlarim</a>
                    )}
                    {isLoaded && user && hasRole('doctor') && (
                        <a href="/doctor-dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Doctor Dashboard</a>
                    )}
                    {isLoaded && user && hasRole('admin') && (
                        <a href="/admin-dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Admin Panel</a>
                    )}
                    <a href="/doctors" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Shifokorlar</a>

                    {isLoaded && user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{user.full_name}</span>
                            <button
                                onClick={logout}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >Chiqish</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <a href="/auth/login" style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '8px 20px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '700'
                            }}>Kirish</a>
                            <a href="/auth/register" style={{
                                color: '#2563eb',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '700'
                            }}>Ro'yxatdan o'tish</a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
