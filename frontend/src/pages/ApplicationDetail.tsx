import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Users,
  Bell,
  Paperclip,
  Activity,
} from "lucide-react";
import api, { Application, applicationsApi } from "../api";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import DetailsTab from "../components/tabs/DetailsTab";
import NotesTab from "../components/tabs/NotesTab";
import ContactsTab from "../components/tabs/ContactsTab";
import RemindersTab from "../components/tabs/RemindersTab";
import AttachmentsTab from "../components/tabs/AttachmentsTab";
import ActivityTab from "../components/tabs/ActivityTab";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { AppShell, EmptyState, PageLoader } from "../components/AppShell";

type Tab =
  | "details"
  | "notes"
  | "contacts"
  | "reminders"
  | "attachments"
  | "activity";

const STATUSES = [
  { id: "SAVED", label: "Saved" },
  { id: "APPLIED", label: "Applied" },
  { id: "OA", label: "Online Assessment" },
  { id: "INTERVIEW", label: "Interview" },
  { id: "OFFER", label: "Offer" },
  { id: "REJECTED", label: "Rejected" },
];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] =
    useState<Application | null>(null);

  // Fetch application
  const { data: application, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const response = await api.get(`/apps/${id}`);
      return response.data;
    },
  });

  // Fetch related data
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", id],
    queryFn: async () => {
      const response = await api.get(`/apps/${id}/notes`);
      return response.data;
    },
    enabled: activeTab === "notes",
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const response = await api.get(`/apps/${id}/contacts`);
      return response.data;
    },
    enabled: activeTab === "contacts",
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", id],
    queryFn: async () => {
      const response = await api.get(`/apps/${id}/reminders`);
      return response.data;
    },
    enabled: activeTab === "reminders",
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", id],
    queryFn: async () => {
      const response = await api.get(`/apps/${id}/attachments`);
      return response.data;
    },
    enabled: activeTab === "attachments",
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", id],
    queryFn: async () => {
      const response = await api.get(`/apps/${id}/activity`);
      return response.data;
    },
    enabled: activeTab === "activity",
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Application) => {
      const response = await applicationsApi.update(id!, data);
      return response.data;
    },
    onSuccess: (updatedApp) => {
      queryClient.setQueryData(["application", id], updatedApp);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await applicationsApi.delete(id!);
    },
    onSuccess: () => {
      navigate("/applications");
    },
  });

  const handleEdit = () => {
    setEditForm({
      company: application.company,
      role: application.role,
      location: application.location || "",
      jobUrl: application.jobUrl || "",
      dateApplied: application.dateApplied
        ? new Date(application.dateApplied).toISOString().split("T")[0]
        : "",
      status: application.status,
      priority: application.priority,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const dataToSave = {
      ...editForm,
      dateApplied: editForm.dateApplied
        ? new Date(editForm.dateApplied).toISOString()
        : null,
    };
    updateMutation.mutate(dataToSave);
  };

  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement>,
    application: Application,
  ) => {
    e.stopPropagation();
    if (!application) return;
    setDeleteModalOpen(true);
    setApplicationToDelete(application);
  };

  const confirmDelete = () => {
    if (applicationToDelete) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setApplicationToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading application" />;
  }

  if (!application) {
    return (
      <AppShell maxWidth="6xl">
        <EmptyState
          icon={FileText}
          title="Application not found"
          description="This application may have been deleted or moved."
        />
      </AppShell>
    );
  }

  const tabs = [
    { id: "details" as Tab, label: "Details", icon: FileText },
    { id: "notes" as Tab, label: "Notes", icon: FileText },
    { id: "contacts" as Tab, label: "Contacts", icon: Users },
    { id: "reminders" as Tab, label: "Reminders", icon: Bell },
    { id: "attachments" as Tab, label: "Attachments", icon: Paperclip },
    { id: "activity" as Tab, label: "Activity", icon: Activity },
  ];

  return (
    <AppShell maxWidth="6xl">
          {/* Header */}
          <div className="surface mb-6 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          role: e.target.value,
                        })
                      }
                      className="field text-2xl font-bold"
                    />
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          company: e.target.value,
                        })
                      }
                      className="field text-lg"
                    />
                  </div>
                ) : (
                  <>
                    <p className="kicker mb-2">Application detail</p>
                    <h1 className="text-3xl font-bold text-neutral-950">
                      {application.role}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-lg text-neutral-600">
                      <Building2 className="h-5 w-5 text-brand-700" />
                      <span>{application.company}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-4 mt-4">
                  {isEditing ? (
                    <>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="field"
                      >
                        {STATUSES.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value })
                        }
                        className="field"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <StatusBadge status={application.status} />
                      <PriorityBadge priority={application.priority} />
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="btn-primary"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, application)}
                      disabled={deleteMutation.isPending}
                      className="btn-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="surface overflow-hidden">
            <div className="border-b border-neutral-200">
              <nav className="flex overflow-x-auto p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`applet-button flex min-h-11 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                      activeTab === tab.id
                        ? "bg-brand-700 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-5 sm:p-6">
              {activeTab === "details" && (
                <DetailsTab
                  application={application}
                  isEditing={isEditing}
                  editForm={editForm}
                  setEditForm={setEditForm}
                />
              )}
              {activeTab === "notes" && (
                <NotesTab applicationId={id!} notes={notes} />
              )}
              {activeTab === "contacts" && (
                <ContactsTab applicationId={id!} contacts={contacts} />
              )}
              {activeTab === "reminders" && (
                <RemindersTab applicationId={id!} reminders={reminders} />
              )}
              {activeTab === "attachments" && (
                <AttachmentsTab applicationId={id!} attachments={attachments} />
              )}
              {activeTab === "activity" && (
                <ActivityTab
                  activities={Array.isArray(activities) ? activities : []}
                />
              )}
            </div>
          </div>
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setApplicationToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete Application"
        message={
          applicationToDelete
            ? `Are you sure you want to delete your application to ${applicationToDelete.company} for ${applicationToDelete.role}? This action cannot be undone.`
            : ""
        }
      />
    </AppShell>
  );
}
