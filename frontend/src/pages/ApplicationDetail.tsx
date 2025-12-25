import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  FileText,
  Users,
  Bell,
  Paperclip,
  Activity,
  Download,
} from "lucide-react";
import api from "../api";
import Nav from "../components/Nav";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import FileUploader from "../components/FileUploader";

type Tab =
  | "details"
  | "notes"
  | "contacts"
  | "reminders"
  | "attachments"
  | "activity";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

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
      const response = await api.get(`/apps/${id}/activities`);
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
        ? new Date(application.dateApplied).toISOString().split('T')[0]
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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteMutation.mutate();
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
                        <option value="APPLIED">Applied</option>
                        <option value="ONLINE_ASSESSMENT">
                          Online Assessment
                        </option>
                        <option value="INTERVIEWED">Interviewed</option>
                        <option value="OFFER">Offer</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="ACCEPTED">Accepted</option>
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
                      onClick={handleDelete}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
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
                <ActivityTab activities={activities} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsTab({ application, isEditing, editForm, setEditForm }: any) {
  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job URL
            </label>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={editForm.jobUrl}
                onChange={(e) =>
                  setEditForm({ ...editForm, jobUrl: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Date
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={editForm.dateApplied}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    dateApplied: e.target.value,
                  })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {application.location && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>{application.location}</span>
            </div>
          )}
          {application.jobUrl && (
            <div className="flex items-center gap-2 text-gray-700">
              <LinkIcon className="h-5 w-5 text-gray-400" />
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                View Job Posting
              </a>
            </div>
          )}
          {application.dateApplied && (
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>
                Applied on{" "}
                {format(new Date(application.dateApplied), "MMM d, yyyy")}
              </span>
            </div>
          )}
          {application.createdAt && (
            <div className="text-sm text-gray-500 pt-4 border-t">
              Created{" "}
              {format(new Date(application.createdAt), "MMM d, yyyy h:mm a")}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotesTab({ applicationId, notes }: any) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/apps/${applicationId}/notes`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", applicationId] });
      setNewNote("");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await api.delete(`/apps/${applicationId}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", applicationId] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => addNoteMutation.mutate(newNote)}
          disabled={!newNote.trim() || addNoteMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 h-fit"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {notes.map((note: any) => (
          <div
            key={note.id}
            className="bg-gray-50 rounded-lg p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <p className="text-gray-700">{note.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <button
              onClick={() => deleteNoteMutation.mutate(note.id)}
              className="text-red-600 hover:text-red-700 ml-4"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-gray-500 text-center py-8">No notes yet</p>
        )}
      </div>
    </div>
  );
}

function ContactsTab({ applicationId, contacts }: any) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedIn: "",
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/apps/${applicationId}/contacts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", applicationId] });
      setForm({ name: "", title: "", email: "", phone: "", linkedIn: "" });
      setShowForm(false);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      await api.delete(`/apps/${applicationId}/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", applicationId] });
    },
  });

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Contact
      </button>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={form.linkedIn}
            onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => addContactMutation.mutate(form)}
              disabled={!form.name.trim() || addContactMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact: any) => (
          <div
            key={contact.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <h4 className="font-semibold text-gray-900">{contact.name}</h4>
              {contact.title && (
                <p className="text-sm text-gray-600">{contact.title}</p>
              )}
              {contact.email && (
                <p className="text-sm text-gray-600 mt-1">{contact.email}</p>
              )}
              {contact.phone && (
                <p className="text-sm text-gray-600">{contact.phone}</p>
              )}
              {contact.linkedIn && (
                <a
                  href={contact.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  LinkedIn Profile
                </a>
              )}
            </div>
            <button
              onClick={() => deleteContactMutation.mutate(contact.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-gray-500 text-center py-8">No contacts yet</p>
        )}
      </div>
    </div>
  );
}

function RemindersTab({ applicationId, reminders }: any) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reminderDate: "", message: "" });

  const addReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/apps/${applicationId}/reminders`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", applicationId] });
      setForm({ reminderDate: "", message: "" });
      setShowForm(false);
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      await api.delete(`/apps/${applicationId}/reminders/${reminderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", applicationId] });
    },
  });

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Reminder
      </button>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <input
            type="datetime-local"
            value={form.reminderDate}
            onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Reminder message *"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => addReminderMutation.mutate(form)}
              disabled={
                !form.message.trim() ||
                !form.reminderDate ||
                addReminderMutation.isPending
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reminders.map((reminder: any) => (
          <div
            key={reminder.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Bell className="h-4 w-4" />
                <span>
                  {format(
                    new Date(reminder.reminderDate),
                    "MMM d, yyyy h:mm a"
                  )}
                </span>
              </div>
              <p className="text-gray-700">{reminder.message}</p>
            </div>
            <button
              onClick={() => deleteReminderMutation.mutate(reminder.id)}
              className="text-red-600 hover:text-red-700 ml-4"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <p className="text-gray-500 text-center py-8">No reminders yet</p>
        )}
      </div>
    </div>
  );
}

function AttachmentsTab({ applicationId, attachments }: any) {
  const queryClient = useQueryClient();

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      await api.delete(`/apps/${applicationId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", applicationId],
      });
    },
  });

  const downloadAttachment = async (attachmentId: number, fileName: string) => {
    try {
      const response = await api.get(
        `/apps/${applicationId}/attachments/${attachmentId}/download`
      );
      const downloadUrl = response.data.downloadUrl;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to download attachment:", error);
    }
  };

  return (
    <div className="space-y-4">
      <FileUploader
        applicationId={applicationId}
        onUploadComplete={() =>
          queryClient.invalidateQueries({
            queryKey: ["attachments", applicationId],
          })
        }
      />

      <div className="space-y-3">
        {attachments.map((attachment: any) => (
          <div
            key={attachment.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Paperclip className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {(attachment.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                  {format(new Date(attachment.uploadedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  downloadAttachment(attachment.id, attachment.fileName)
                }
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {attachments.length === 0 && (
          <p className="text-gray-500 text-center py-8">No attachments yet</p>
        )}
      </div>
    </div>
  );
}

function ActivityTab({ activities }: any) {
  return (
    <div className="space-y-3">
      {activities.map((activity: any) => (
        <div
          key={activity.id}
          className="flex gap-3 pb-3 border-b border-gray-200 last:border-0"
        >
          <div className="shrink-0 w-2 h-2 mt-2 bg-indigo-500 rounded-full" />
          <div className="flex-1">
            <p className="text-gray-700">{activity.activityType}</p>
            {activity.description && (
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <p className="text-gray-500 text-center py-8">No activity yet</p>
      )}
    </div>
  );
}
