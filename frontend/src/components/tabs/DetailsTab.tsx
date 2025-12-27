import { MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

interface DetailsTabProps {
  application: any;
  isEditing: boolean;
  editForm: any;
  setEditForm: (form: any) => void;
}

export default function DetailsTab({
  application,
  isEditing,
  editForm,
  setEditForm,
}: DetailsTabProps) {
  return (
    <div className="space-y-4 ">
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
