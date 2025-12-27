import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { notesApi } from "../../api";

interface NotesTabProps {
  applicationId: string;
  notes: any[];
}

export default function NotesTab({ applicationId, notes }: NotesTabProps) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      await notesApi.create(applicationId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", applicationId] });
      setNewNote("");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(applicationId, noteId),
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
