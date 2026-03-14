import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (formData: FormData) => apiClient.post("/auth/login", formData),
    register: (userData: any) => apiClient.post("/auth/register", userData),
};

export const aiService = {
    triage: (symptoms: string) => apiClient.post("/ai/triage", { symptoms }),
    predictWait: (doctorId: number, queueLength: number) =>
        apiClient.get(`/ai/predict-wait?doctor_id=${doctorId}&queue_length=${queueLength}`),
};

export const appointmentService = {
    getDoctors: () => apiClient.get("/doctors/"),
    getDoctor: (id: number) => apiClient.get(`/doctors/${id}`),
    book: (doctorId: number, scheduledTime?: string) =>
        apiClient.post("/appointments/book", { doctor_id: doctorId, scheduled_time: scheduledTime }),
    getMyAppointments: () => apiClient.get("/appointments/my"),
};

export default apiClient;
