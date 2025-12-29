/// <reference types="vite/client" />
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("app_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/signup page
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/signup") {
        localStorage.removeItem("app_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  emailNotifications: boolean;
  autoArchiveOldApps: boolean;
  showArchivedApps: boolean;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  location?: string;
  status: "SAVED" | "APPLIED" | "OA" | "INTERVIEW" | "OFFER" | "REJECTED";
  dateApplied?: string;
  jobUrl?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  applicationId: string;
  content: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  applicationId: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  applicationId: string;
  remindAt: string;
  message: string;
  completed: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  applicationId: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  applicationId: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Analytics {
  statusCounts: Record<string, number>;
  appsPerWeek: Record<string, number>;
  conversionRates: {
    appliedToInterview: number;
    interviewToOffer: number;
    appliedToOffer: number;
  };
  avgTimeInStage: Record<string, number>;
}

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", data),

  getCurrentUser: () => api.get<User>("/auth/me"),

  updateUser: (data: { name: string; email: string }) =>
    api.put("/auth/change-profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/change-password", data),

  updatePreferences: (data: {
    emailNotifications?: boolean;
    autoArchiveOldApps?: boolean;
    showArchivedApps?: boolean;
  }) => api.put<User>("/auth/preferences", data),

  deleteAccount: () => api.delete("/auth/account"),

  forgotPassword: (data: { email: string }) =>
    api.post("/forgot-password/request", data),

  validateForgotPassword: (token: string) =>
    api.get(`/forgot-password/validate/${token}`),

  resetPassword: (data: { token: string | null; newPassword: string }) =>
    api.post("/forgot-password/reset", data),
};

// Applications API
export const applicationsApi = {
  getAll: (params?: {
    status?: string;
    q?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<{
      content: Application[];
      totalPages: number;
      totalElements: number;
    }>("/apps", { params }),

  create: (data: Partial<Application>) => api.post<Application>("/apps", data),

  getById: (id: string) => api.get<Application>(`/apps/${id}`),

  update: (id: string, data: Partial<Application>) =>
    api.put<Application>(`/apps/${id}`, data),

  delete: (id: string) => api.delete(`/apps/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch<Application>(`/apps/${id}/status`, { status }),
};

// Notes API
export const notesApi = {
  getByApp: (appId: string) => api.get<Note[]>(`/apps/${appId}/notes`),

  create: (appId: string, content: string) =>
    api.post<Note>(`/apps/${appId}/notes`, { content }),

  delete: (appId: string, noteId: string) =>
    api.delete(`/apps/${appId}/notes/${noteId}`),
};

// Contacts API
export const contactsApi = {
  getByApp: (appId: string) => api.get<Contact[]>(`/apps/${appId}/contacts`),

  create: (
    appId: string,
    data: Omit<Contact, "id" | "applicationId" | "createdAt">
  ) => api.post<Contact>(`/apps/${appId}/contacts`, data),

  delete: (appId: string, contactId: string) =>
    api.delete(`/apps/${appId}/contacts/${contactId}`),
};

// Reminders API
export const remindersApi = {
  getByApp: (appId: string) => api.get<Reminder[]>(`/apps/${appId}/reminders`),

  create: (appId: string, data: { remindAt: string; message: string }) =>
    api.post<Reminder>(`/apps/${appId}/reminders`, data),

  getDue: (days: number = 7) =>
    api.get<Reminder[]>("/reminders/due", { params: { days } }),

  getAll: () => api.get<Reminder[]>("/reminders/all"),

  delete: (appId: string, id: string) =>
    api.delete(`/apps/${appId}/reminders/${id}`),

  complete: (id: string) => api.patch<Reminder>(`/reminders/${id}/complete`),
};

// Attachments API
export const attachmentsApi = {
  getByApp: (appId: string) =>
    api.get<Attachment[]>(`/apps/${appId}/attachments`),

  presign: (
    appId: string,
    data: { fileName: string; contentType: string; sizeBytes: number }
  ) =>
    api.post<{ uploadUrl: string; objectKey: string; expiresAt: number }>(
      `/apps/${appId}/attachments/presign`,
      data
    ),

  confirm: (
    appId: string,
    data: {
      objectKey: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
    }
  ) => api.post<Attachment>(`/apps/${appId}/attachments/confirm`, data),

  getDownloadUrl: (attachmentId: string) =>
    api.get<{ downloadUrl: string }>(
      `/attachments/${attachmentId}/download-url`
    ),

  delete: (appId: string, attachmentId: string) =>
    api.delete(`/apps/${appId}/attachments/${attachmentId}`),
};

// Activity API
export const activityApi = {
  getByApp: (appId: string) => api.get<Activity[]>(`/apps/${appId}/activity`),
};

// Analytics API
export const analyticsApi = {
  get: () => api.get<Analytics>("/analytics"),
};

export default api;
