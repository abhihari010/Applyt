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
import api, { Application } from "../api";
import Nav from "../components/Nav";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import DetailsTab from "../components/tabs/DetailsTab";
import NotesTab from "../components/tabs/NotesTab";
import ContactsTab from "../components/tabs/ContactsTab";
import RemindersTab from "../components/tabs/RemindersTab";
import AttachmentsTab from "../components/tabs/AttachmentsTab";
import ActivityTab from "../components/tabs/ActivityTab";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

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
    mutationFn: async (data: any) => {
      await api.put(`/apps/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/apps/${id}`);
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
    return (
      <div>
        <Nav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <Nav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Application not found</div>
        </div>
      </div>
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
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
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
                      className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none w-full"
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
                      className="text-lg text-gray-600 border-b border-gray-300 focus:outline-none w-full "
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {application.role}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-lg text-gray-600">
                      <Building2 className="h-5 w-5" />
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
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, application)}
                      disabled={deleteMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 cursor-pointer"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
            <div className="border-b border-gray-200 ">
              <nav className="flex -mb-px ">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 cursor-pointer ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
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
    </div>
  );
}
