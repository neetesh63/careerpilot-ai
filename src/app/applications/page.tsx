"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Briefcase,
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Edit2,
  Trash2,
  ExternalLink,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";

interface JobApplication {
  id: string;
  job_title: string;
  company: string;
  location: string | null;
  employment_type: string;
  job_url: string | null;
  salary_range: string | null;
  status: string;
  application_date: string | null;
  follow_up_date: string | null;
  interview_date: string | null;
  notes: string | null;
  contact_person: string | null;
}

const STATUS_COLUMNS = [
  { id: "applied", label: "Applied", color: "border-t-[#7667F7]" },
  { id: "assessment", label: "Assessment", color: "border-t-[#998DF9]" },
  { id: "interview", label: "Interview Scheduled", color: "border-t-[#16856B]" },
  { id: "offer", label: "Offer Received", color: "border-t-[#16856B]" },
  { id: "rejected", label: "Rejected", color: "border-t-[#C43D50]" },
  { id: "interested", label: "Interested", color: "border-t-[#6F6D82]" }
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [jobUrl, setJobUrl] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [status, setStatus] = useState("applied");
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split("T")[0]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  const fetchApplications = () => {
    fetch("/api/applications")
      .then(res => res.json())
      .then(data => {
        if (data.applications) {
          setApplications(data.applications);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setJobTitle("");
    setCompany("");
    setLocation("");
    setEmploymentType("full_time");
    setJobUrl("");
    setSalaryRange("");
    setStatus("applied");
    setApplicationDate(new Date().toISOString().split("T")[0]);
    setFollowUpDate("");
    setInterviewDate("");
    setNotes("");
    setContactPerson("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app: JobApplication) => {
    setEditingId(app.id);
    setJobTitle(app.job_title);
    setCompany(app.company);
    setLocation(app.location || "");
    setEmploymentType(app.employment_type || "full_time");
    setJobUrl(app.job_url || "");
    setSalaryRange(app.salary_range || "");
    setStatus(app.status || "applied");
    setApplicationDate(app.application_date || "");
    setFollowUpDate(app.follow_up_date || "");
    setInterviewDate(app.interview_date || "");
    setNotes(app.notes || "");
    setContactPerson(app.contact_person || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      jobTitle,
      company,
      location,
      employmentType,
      jobUrl,
      salaryRange,
      status,
      applicationDate,
      followUpDate,
      interviewDate,
      notes,
      contactPerson
    };

    try {
      if (editingId) {
        await fetch(`/api/applications/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      setIsModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter(a => {
    const matchesSearch =
      a.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell
      title="Job Application Pipeline Tracker"
      description="Track and manage job opportunities across interview rounds, offers, and follow-up deadlines."
    >
      <div className="space-y-6 max-w-6xl">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E7E5EF] shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <Search className="w-4 h-4 text-[#6F6D82] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search role, company..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F7F2] rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F8F7F2] rounded-xl border border-[#E7E5EF] focus:outline-none"
            >
              <option value="all">All Stages ({applications.length})</option>
              <option value="applied">Applied</option>
              <option value="assessment">Assessment</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="interested">Interested</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-[#E7E5EF] rounded-xl p-0.5 bg-[#F8F7F2]">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === "kanban" ? "bg-white text-[#17162E] shadow-sm" : "text-[#6F6D82]"
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === "table" ? "bg-white text-[#17162E] shadow-sm" : "text-[#6F6D82]"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/applications/export"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F8F7F2] hover:bg-[#EAE7FF] text-[#25243A] border border-[#E7E5EF]"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </a>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Opportunity
            </button>
          </div>
        </div>

        {/* View: Kanban Board */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
            {STATUS_COLUMNS.map(col => {
              const colApps = filteredApps.filter(a => a.status === col.id);
              return (
                <div key={col.id} className={`bg-white rounded-2xl border border-[#E7E5EF] border-t-4 ${col.color} p-3.5 shadow-sm space-y-3 min-h-[300px]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17162E]">{col.label}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F8F7F2] text-[#6F6D82]">
                      {colApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colApps.map(app => (
                      <div
                        key={app.id}
                        className="p-3 rounded-xl border border-[#E7E5EF] bg-[#F8F7F2]/50 hover:bg-white hover:border-[#7667F7]/40 shadow-xs transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-[#17162E] line-clamp-1">{app.job_title}</h4>
                            <p className="text-[11px] text-[#6F6D82] font-semibold flex items-center gap-1">
                              <Building className="w-3 h-3 text-[#7667F7]" />
                              {app.company}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(app)}
                              className="text-[#6F6D82] hover:text-[#7667F7] p-1"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(app.id)}
                              className="text-[#6F6D82] hover:text-[#C43D50] p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {app.location && (
                          <p className="text-[10px] text-[#6F6D82] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {app.location}
                          </p>
                        )}

                        {app.salary_range && (
                          <p className="text-[10px] text-[#16856B] font-semibold flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {app.salary_range}
                          </p>
                        )}

                        {app.interview_date && (
                          <div className="p-1.5 rounded bg-[#16856B]/10 border border-[#16856B]/20 text-[10px] text-[#16856B] font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Interview: {app.interview_date}
                          </div>
                        )}

                        {app.follow_up_date && !app.interview_date && (
                          <p className="text-[10px] text-[#A96513] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Follow-up: {app.follow_up_date}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View: Table */
          <div className="bg-white rounded-2xl border border-[#E7E5EF] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7F2] text-[#6F6D82] uppercase text-[10px] font-bold border-b border-[#E7E5EF]">
                  <tr>
                    <th className="p-3.5">Company & Role</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Key Dates</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5EF]">
                  {filteredApps.map(app => (
                    <tr key={app.id} className="hover:bg-[#F8F7F2]/40 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-[#17162E]">{app.job_title}</p>
                        <p className="text-[11px] text-[#6F6D82]">{app.company}</p>
                      </td>
                      <td className="p-3.5 text-[#6F6D82]">{app.location || "Remote"}</td>
                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-3.5 text-[#6F6D82]">{app.application_date || "—"}</td>
                      <td className="p-3.5 text-[11px] text-[#6F6D82]">
                        {app.interview_date && <span className="block text-[#16856B] font-semibold">Interview: {app.interview_date}</span>}
                        {app.follow_up_date && <span className="block text-[#A96513]">Follow-up: {app.follow_up_date}</span>}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(app)}
                          className="text-[#7667F7] hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app.id)}
                          className="text-[#C43D50] hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Application Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Job Opportunity" : "Track New Job Opportunity"}
          description="Record job details, dates, and follow-up alerts."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Company *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco or Remote"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                >
                  <option value="interested">Interested</option>
                  <option value="preparing">Preparing</option>
                  <option value="applied">Applied</option>
                  <option value="assessment">Assessment</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={e => setSalaryRange(e.target.value)}
                  placeholder="e.g. $85,000 - $95,000"
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Application Date</label>
                <input
                  type="date"
                  value={applicationDate}
                  onChange={e => setApplicationDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1">Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1">Notes / Recruiter Contact</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Interview round details, recruiter name, preparation notes..."
                className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5EF]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F6D82]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] rounded-xl shadow-md shadow-[#7667F7]/25"
              >
                {editingId ? "Save Changes" : "Track Opportunity"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
