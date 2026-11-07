/// <reference types="vite/client" />
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// In production /api is proxied through this site (see vercel.json) so session cookies are first-party.
const API_BASE_URL = import.meta.env.DEV ? BACKEND_URL : "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // The backend requires this on state-changing requests as CSRF protection.
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Tokens are in httpOnly cookies that scripts can't read. This flag holds no secret, it only
// records that a session may exist, so signed-out visitors don't wait on a call to the backend.
const SESSION_FLAG = "app_session";

export const session = {
  exists: () => localStorage.getItem(SESSION_FLAG) === "1",
  mark: () => localStorage.setItem(SESSION_FLAG, "1"),
  clear: () => localStorage.removeItem(SESSION_FLAG),
};

// A 401 on these means bad credentials or a dead session, so refreshing can't help.
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/oauth2/exchange",
];

// Requests failing together share one refresh, because refresh tokens are single-use.
let refreshInFlight: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retried ||
      NO_REFRESH_PATHS.some((path) => request.url?.startsWith(path))
    ) {
      return Promise.reject(error);
    }

    request._retried = true;
    try {
      refreshInFlight ??= api.post("/auth/refresh").finally(() => {
        refreshInFlight = null;
      });
      await refreshInFlight;
      return await api(request);
    } catch {
      session.clear();
      // AuthContext handles the startup session check. Everywhere else the session just ended.
      const currentPath = window.location.pathname;
      if (
        request.url !== "/auth/me" &&
        currentPath !== "/login" &&
        currentPath !== "/signup"
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  },
);

// Job URLs must be http(s). Add the scheme to ones typed without it, like "acme.com/jobs".
const withUrlScheme = <T extends { jobUrl?: string }>(data: T): T =>
  data.jobUrl && !/^[a-z][a-z0-9+.-]*:/i.test(data.jobUrl)
    ? { ...data, jobUrl: `https://${data.jobUrl}` }
    : data;

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  emailNotifications: boolean;
  autoArchiveOldApps: boolean;
  showArchivedApps: boolean;
  hasPassword: boolean;
  oauthProvider: string | null;
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

export interface OpenJob {
  company: string;
  role: string;
  location: string;
  datePosted: string;
  jobUrl: string;
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
  activityType: string;
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
    api.post<{ message: string }>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User }>("/auth/login", data),

  exchangeOAuthCode: (code: string) =>
    api.post<{ user: User }>("/auth/oauth2/exchange", { code }),

  logout: () => api.post("/auth/logout"),

  verifyEmail: (token: string) =>
    api.post("/auth/verify-email", {}, { params: { token } }),

  resendVerificationEmail: (email: string) =>
    api.post("/auth/resend-verification-email", { email }),

  getCurrentUser: () => api.get<User>("/auth/me"),

  updateUser: (data: { name: string; email: string }) =>
    api.put("/auth/change-profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/change-password", data),

  setPassword: (data: { newPassword: string }) =>
    api.put("/auth/set-password", data),

  updatePreferences: (data: {
    emailNotifications?: boolean;
    autoArchiveOldApps?: boolean;
    showArchivedApps?: boolean;
  }) => api.put<User>("/auth/preferences", data),

  deleteAccount: () => api.delete("/auth/account"),

  forgotPassword: (data: { email: string }) =>
    api.post("/forgot-password/request", data),

  validateForgotPassword: (token: string) =>
    api.post("/forgot-password/validate", { token }),

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

  create: (data: Partial<Application>) =>
    api.post<Application>("/apps", withUrlScheme(data)),

  getById: (id: string) => api.get<Application>(`/apps/${id}`),

  update: (id: string, data: Partial<Application>) =>
    api.put<Application>(`/apps/${id}`, withUrlScheme(data)),

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
    data: Omit<Contact, "id" | "applicationId" | "createdAt">,
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
    data: { fileName: string; contentType: string; sizeBytes: number },
  ) =>
    api.post<{ uploadUrl: string; objectKey: string; expiresAt: number }>(
      `/apps/${appId}/attachments/presign`,
      data,
    ),

  confirm: (
    appId: string,
    data: {
      objectKey: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
    },
  ) => api.post<Attachment>(`/apps/${appId}/attachments/confirm`, data),

  getDownloadUrl: (attachmentId: string) =>
    api.get<{ downloadUrl: string }>(
      `/attachments/${attachmentId}/download-url`,
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

// Jobs API
export const jobsApi = {
  getOpenInternships: (page: number = 0, size: number = 20) =>
    api.get("/jobs/open-internships", {
      params: { page, size },
    }),
};

export default api;
