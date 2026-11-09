import { vi } from "vitest";
import type { User } from "../api";

export const testUser: User = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  emailNotifications: true,
  autoArchiveOldApps: false,
  showArchivedApps: false,
  hasPassword: true,
  oauthProvider: null,
};

/** A signed-out AuthContext value; tests override only what they care about. */
export const authValue = (overrides = {}) => ({
  user: null,
  token: null,
  login: vi.fn(),
  oauthLogin: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  isLoading: false,
  ...overrides,
});
