import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Bell, Trash2 } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import api from "../../api";

interface RemindersTabProps {
  applicationId: string;
  reminders: any[];
}

export default function RemindersTab({
  applicationId,
  reminders,
}: RemindersTabProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ remindAt: "", message: "" });

  const getUrgency = (date: string) => {
    const reminderDate = new Date(date);
    const now = new Date();

    if (isPast(reminderDate) && reminderDate < now) {
      return {
        label: "OVERDUE",
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-500",
      };
    }
    if (isToday(reminderDate)) {
      return {
        label: "TODAY",
        bgColor: "bg-orange-50",
        textColor: "text-orange-800",
        borderColor: "border-orange-500",
      };
    }
    if (isTomorrow(reminderDate)) {
      return {
        label: "TOMORROW",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-500",
      };
    }
    return {
      label: "UPCOMING",
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-500",
    };
  };

  const addReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/apps/${applicationId}/reminders`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", applicationId] });
      setForm({ remindAt: "", message: "" });
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
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            value={
              form.remindAt
                ? format(new Date(form.remindAt), "yyyy-MM-dd'T'HH:mm")
                : ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                remindAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : "",
              })
            }
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
                !form.remindAt ||
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
        {reminders.map((reminder: any) => {
          const urgency = getUrgency(reminder.remindAt);
          return (
            <div
              key={reminder.id}
              className={`bg-white border-l-4 ${urgency.borderColor} ${urgency.bgColor} rounded-r-lg p-4 flex justify-between items-start`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${urgency.bgColor} ${urgency.textColor}`}
                  >
                    {urgency.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(reminder.remindAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{reminder.message}</p>
              </div>
              <button
                onClick={() => deleteReminderMutation.mutate(reminder.id)}
                className="text-red-600 hover:text-red-700 ml-4"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {reminders.length === 0 && (
          <p className="text-gray-500 text-center py-8">No reminders yet</p>
        )}
      </div>
    </div>
  );
}
