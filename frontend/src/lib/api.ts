import axios from "axios";

const API_BASE_URL = "/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add JWT token safely
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("localStorage access failed:", e);
        }
    }
    return config;
});

export const authService = {
    login: (formData: FormData) => apiClient.post("/auth/login", formData),
    register: (userData: any) => apiClient.post("/auth/register", userData),
    getMe: () => apiClient.get("/auth/me"),
};

export const aiService = {
    triage: (symptoms: string) => apiClient.post("/ai/triage", { symptoms }),
    predictWait: (doctorId: number, queueLength: number) =>
        apiClient.get(`/ai/predict-wait?doctor_id=${doctorId}&queue_length=${queueLength}`),
};

export const appointmentService = {
    getDoctors: () => apiClient.get("/doctors"),
    getDoctor: (id: number) => apiClient.get(`/doctors/${id}`),
    book: (doctorId: number, scheduledTime?: string) =>
        apiClient.post("/appointments/book", { doctor_id: doctorId, scheduled_time: scheduledTime }),
    getMyAppointments: () => apiClient.get("/appointments/my"),
    getDoctorQueue: () => apiClient.get("/appointments/doctor-queue"),
};

export const adminService = {
    getStats: () => apiClient.get("/admin/stats"),
    createDoctor: (userData: any, specialization: string, avgTime: number = 15) =>
        apiClient.post("/admin/create-doctor", {
            user_in: userData,
            specialization,
            avg_consultation_time: avgTime
        }),
    updateDoctor: (id: number, userData?: any, doctorData?: any) =>
        apiClient.put(`/admin/doctors/${id}`, {
            user_up: userData,
            doctor_up: doctorData
        }),
    deleteDoctor: (id: number) => apiClient.delete(`/admin/doctors/${id}`),
};

export default apiClient;
