import { useState, useEffect } from "react";
import { authApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { AppShell, PageHeader } from "../components/AppShell";

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PreferencesForm {
  emailNotifications: boolean;
  autoArchiveOldApps: boolean;
  showArchivedApps: boolean;
}

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferencesForm, setPreferencesForm] = useState<PreferencesForm>({
    emailNotifications: true,
    autoArchiveOldApps: false,
    showArchivedApps: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
      });
      setPreferencesForm({
        emailNotifications: user.emailNotifications,
        autoArchiveOldApps: user.autoArchiveOldApps,
        showArchivedApps: user.showArchivedApps,
      });
    }
  }, [user]);

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await authApi.updateUser({
        name: profileForm.name,
        email: profileForm.email,
      });

      // Refresh user context to show updated info
      await refreshUser();

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long!",
      });
      setLoading(false);
      return;
    }

    try {
      // If user has OAuth but no password, they're setting a password (no current password needed)
      const hasPassword = user?.hasPassword;

      if (hasPassword) {
        // Changing existing password - requires current password
        await authApi.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
      } else {
        // Setting password for OAuth user - no current password needed
        await authApi.setPassword({
          newPassword: passwordForm.newPassword,
        });
      }

      setMessage({
        type: "success",
        text: hasPassword
          ? "Password changed successfully!"
          : "Password set successfully!",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      await refreshUser(); // Refresh to update hasPassword status
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to change password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await authApi.deleteAccount();
      localStorage.removeItem("app_token");
      window.location.href = "/login";
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete account. Please try again.",
      });
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceToggle = async (
    preference: keyof PreferencesForm,
    value: boolean
  ) => {
    const updatedPreferences = { ...preferencesForm, [preference]: value };
    setPreferencesForm(updatedPreferences);

    try {
      await authApi.updatePreferences({ [preference]: value });
      await refreshUser();
      setMessage({
        type: "success",
        text: "Preferences updated successfully!",
      });
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.error ||
          "Failed to update preferences. Please try again.",
      });
      // Revert the change on error
      setPreferencesForm(preferencesForm);
    }
  };

  return (
    <AppShell maxWidth="4xl">
        <PageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Manage account details, security, and how your application cockpit behaves."
        />

        {/* Tabs */}
        <div className="surface mb-6 p-1">
          <nav className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`applet-button rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === "profile"
                  ? "bg-brand-700 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`applet-button rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === "security"
                  ? "bg-brand-700 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`applet-button rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === "preferences"
                  ? "bg-brand-700 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="surface p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="field"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="field"
                  required
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Show OAuth info if user has OAuth provider */}
            {user?.oauthProvider && (
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-brand-800">
                    You signed in with{" "}
                    <span className="font-semibold capitalize">
                      {user.oauthProvider}
                    </span>
                    {!user.hasPassword &&
                      " and haven't set a password yet. You can set one below to enable email/password login."}
                  </p>
                </div>
              </div>
            )}

            <div className="surface p-6">
              <h2 className="text-xl font-semibold mb-4">
                {user?.hasPassword ? "Change Password" : "Set Password"}
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Only show current password field if user has a password */}
                {user?.hasPassword && (
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="field"
                      required
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="field"
                    required
                    minLength={8}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="field"
                    required
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>

            <div className="surface border-l-4 border-red-500 p-6">
              <h2 className="text-xl font-semibold mb-2 text-red-700">
                Danger Zone
              </h2>
              <p className="text-gray-600 mb-4">
                Once you delete your account, there is no going back. All your
                applications, notes, and data will be permanently deleted.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                className="btn-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="surface p-6">
            <h2 className="text-xl font-semibold mb-4">
              Application Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Receive email reminders for upcoming tasks
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferencesForm.emailNotifications}
                    onChange={(e) =>
                      handlePreferenceToggle(
                        "emailNotifications",
                        e.target.checked
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Auto-archive old applications</h3>
                  <p className="text-sm text-gray-500">
                    Automatically archive rejected applications after 30 days
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferencesForm.autoArchiveOldApps}
                    onChange={(e) =>
                      handlePreferenceToggle(
                        "autoArchiveOldApps",
                        e.target.checked
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Show archived applications</h3>
                  <p className="text-sm text-gray-500">
                    Display archived applications in the main list
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferencesForm.showArchivedApps}
                    onChange={(e) =>
                      handlePreferenceToggle(
                        "showArchivedApps",
                        e.target.checked
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        loading={loading}
      />
    </AppShell>
  );
}
