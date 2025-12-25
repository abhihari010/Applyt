import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api";
import Nav from "../components/Nav";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FormState = {
  company: string;
  role: string;
  location?: string;
  jobUrl?: string;
  dateApplied?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: string;
};

export default function NewApplication() {
  const [form, setForm] = useState<FormState>({
    company: "",
    role: "",
    priority: "MEDIUM",
    status: "SAVED",
  });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const createMut = useMutation<any, Error, FormState>({
    mutationFn: async (payload: FormState) => {
      const res = await apiClient.post("/apps", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apps"] });
      navigate("/");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate(form);
  };

  return (
    <>
      <Nav />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            New Application
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Role"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              value={form.jobUrl || ""}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              placeholder="Job URL"
              className="w-full p-2 border rounded mb-2"
            />
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Priority:
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as any })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Med</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="OA">OA</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="font-medium text-gray-700 whitespace-nowrap">
                Date Applied:
              </label>
              <DatePicker
                selected={form.dateApplied ? new Date(form.dateApplied) : null}
                onChange={(date: Date | null) => {
                  setForm({
                    ...form,
                    dateApplied: date ? date.toISOString() : undefined,
                  });
                }}
                dateFormat="MMM d, yyyy"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select date"
                wrapperClassName="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {createMut.isPending ? "Creating..." : "Create Application"}
              </button>
            </div>
            {createMut.isError && (
              <div className="mt-2 text-red-600 bg-red-50 p-3 rounded-lg">
                Error creating application
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
