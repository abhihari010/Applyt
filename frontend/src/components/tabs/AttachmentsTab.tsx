import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import api, { attachmentsApi } from "../../api";
import FileUploader from "../FileUploader";
import { useBulkDelete } from "../../hooks/useBulkDelete";

interface AttachmentsTabProps {
  applicationId: string;
  attachments: any[];
}

export default function AttachmentsTab({
  applicationId,
  attachments,
}: AttachmentsTabProps) {
  const queryClient = useQueryClient();

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      await attachmentsApi.delete(applicationId, attachmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", applicationId],
      });
    },
  });

  const bulk = useBulkDelete({
    items: attachments,
    noun: "attachment",
    deleteOne: (attachment) =>
      attachmentsApi.delete(applicationId, attachment.id),
    onDeleted: () =>
      queryClient.invalidateQueries({
        queryKey: ["attachments", applicationId],
      }),
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
        {bulk.bar}
        {attachments.map((attachment: any) => (
          <div
            key={attachment.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              {bulk.checkbox(attachment, `Select ${attachment.fileName}`)}
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
