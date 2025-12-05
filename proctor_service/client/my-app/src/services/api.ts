import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://api.example.com/prod'

if (!import.meta.env?.VITE_API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL not set in .env file. Using default URL.')
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: async (email: string, password: string, role: string) => {
    const response = await apiClient.post('/auth/login', { email, password, role })
    return response.data
  },
  signup: async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.post('/auth/signup', { name, email, password, role })
    return response.data
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh')
    return response.data
  },
}

export const studentAPI = {
  getUpcomingExams: async () => (await apiClient.get('/student/exams/upcoming')).data,
  getCompletedExams: async () => (await apiClient.get('/student/exams/completed')).data,
  getExamDetails: async (examId: string) => (await apiClient.get(`/student/exams/${examId}`)).data,
  submitExam: async (examId: string, answers: Record<string, unknown>) =>
    (await apiClient.post(`/student/exams/${examId}/submit`, { answers })).data,
  getExamResults: async (examId: string) => (await apiClient.get(`/student/exams/${examId}/results`)).data,
}

export const proctorAPI = {
  getLiveSessions: async () => (await apiClient.get('/proctor/sessions/live')).data,
  getSessionDetails: async (sessionId: string) => (await apiClient.get(`/proctor/sessions/${sessionId}`)).data,
  getRecentFlags: async () => (await apiClient.get('/proctor/flags/recent')).data,
  flagSession: async (sessionId: string, issue: string, severity: string) =>
    (await apiClient.post(`/proctor/sessions/${sessionId}/flag`, { issue, severity })).data,
  dismissFlag: async (flagId: string) => (await apiClient.delete(`/proctor/flags/${flagId}`)).data,
  getCompletedSessions: async () => (await apiClient.get('/proctor/sessions/completed')).data,
}

export const proctoringAPI = {
  startSession: async (examId: string) => (await apiClient.post(`/proctoring/sessions/${examId}/start`)).data,
  updateSessionStatus: async (sessionId: string, status: string) =>
    (await apiClient.patch(`/proctoring/sessions/${sessionId}/status`, { status })).data,
  uploadVideo: async (sessionId: string, videoBlob: Blob) => {
    const formData = new FormData()
    formData.append('video', videoBlob)
    const response = await apiClient.post(`/proctoring/sessions/${sessionId}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  reportIncident: async (sessionId: string, incidentType: string, timestamp: number) =>
    (
      await apiClient.post(`/proctoring/sessions/${sessionId}/incident`, {
        incidentType,
        timestamp,
      })
    ).data,
}

export default apiClient
