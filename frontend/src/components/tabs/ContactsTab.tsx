import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { contactsApi } from "../../api";

interface ContactsTabProps {
  applicationId: string;
  contacts: any[];
}

type ContactForm = {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedIn: string;
};

export default function ContactsTab({
  applicationId,
  contacts,
}: ContactsTabProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ContactForm>({
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedIn: "",
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      await contactsApi.create(applicationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", applicationId] });
      setForm({ name: "", title: "", email: "", phone: "", linkedIn: "" });
      setError(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add contact";
      setError(message);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await contactsApi.delete(applicationId, contactId);
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
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
              onClick={() => {
                setShowForm(false);
                setError(null);
                setForm({
                  name: "",
                  title: "",
                  email: "",
                  phone: "",
                  linkedIn: "",
                });
              }}
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
                <p className="text-sm text-gray-600">{`${contact.phone.slice(
                  0,
                  3
                )}-${contact.phone.slice(3, 6)}-${contact.phone.slice(6)}`}</p>
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
