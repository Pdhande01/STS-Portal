import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Wrench, LogOut, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getTechnicianServiceRequests,
  updateServiceRequest,
  addServiceUpdate,
} from "../../../lib/services";
import type { ServiceRequest } from "../../../lib/supabase";

export function TechnicianDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const loadJobs = async () => {
    try {
      const data = await getTechnicianServiceRequests();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleStartWorking = async (jobId: string) => {
    setSavingId(jobId);
    try {
      await updateServiceRequest(jobId, { status: "In Progress", progress: 10 });
      await addServiceUpdate(jobId, "Technician has started working on the device.");
      await loadJobs();
    } catch (err) { console.error(err); }
    finally { setSavingId(null); }
  };

  const handleSaveNotes = async (jobId: string) => {
    const note = notes[jobId];
    if (!note?.trim()) return;
    setSavingId(jobId);
    try {
      await addServiceUpdate(jobId, note);
      setNotes((prev) => ({ ...prev, [jobId]: "" }));
      await loadJobs();
    } catch (err) { console.error(err); }
    finally { setSavingId(null); }
  };

  const handleMarkCompleted = async (jobId: string) => {
    setSavingId(jobId);
    try {
      await updateServiceRequest(jobId, { status: "Completed", progress: 100 });
      await addServiceUpdate(jobId, "Service completed successfully. Device is ready for pickup/delivery.");
      await loadJobs();
    } catch (err) { console.error(err); }
    finally { setSavingId(null); }
  };

  const handleUpdateProgress = async (jobId: string, progress: number) => {
    setSavingId(jobId);
    try {
      await updateServiceRequest(jobId, { progress });
      await loadJobs();
    } catch (err) { console.error(err); }
    finally { setSavingId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            <h1 className="text-xl font-bold">Technician Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{profile?.full_name ?? "Technician"}</span>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-green-700" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Assigned Jobs</h2>
          <p className="text-gray-600">View and manage your assigned service requests</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobs.filter((j) => j.status === "In Progress").length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobs.filter((j) => j.status === "Completed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs List */}
            {jobs.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl">No jobs assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => {
                  const customer = job.profiles as { full_name?: string; phone?: string } | undefined;
                  return (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{job.brand} {job.model}</CardTitle>
                            <CardDescription>
                              Service ID: {job.id.slice(0, 8).toUpperCase()} • Customer: {customer?.full_name ?? "—"}
                            </CardDescription>
                          </div>
                          <Badge variant={job.status === "In Progress" ? "default" : job.status === "Completed" ? "default" : "secondary"}
                            className={job.status === "Completed" ? "bg-green-500" : job.status === "In Progress" ? "bg-blue-500" : ""}>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-3">Customer Information</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-600">Name:</span> {customer?.full_name ?? "—"}</p>
                              <p><span className="text-gray-600">Phone:</span> {customer?.phone ?? job.phone}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Service Details</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-600">Issue:</span> {job.issue_type}</p>
                              <p><span className="text-gray-600">Location:</span> {job.service_location === "home" ? "Home Service" : "Shop Service"}</p>
                              {job.address && <p><span className="text-gray-600">Address:</span> {job.address}</p>}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Schedule</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-600">Date:</span> {job.preferred_date}</p>
                              <p><span className="text-gray-600">Time:</span> {job.preferred_time}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Description</h4>
                            <p className="text-sm text-gray-600">{job.description}</p>
                          </div>
                        </div>

                        {/* Progress Bar for In Progress */}
                        {job.status === "In Progress" && (
                          <div>
                            <div className="flex justify-between items-center mb-2 text-sm">
                              <span className="font-medium">Progress: {job.progress}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={job.progress}
                                onChange={(e) => handleUpdateProgress(job.id, Number(e.target.value))}
                                className="flex-1 accent-green-600"
                                disabled={savingId === job.id}
                              />
                            </div>
                          </div>
                        )}

                        {/* Add Notes */}
                        {job.status === "In Progress" && (
                          <div className="border-t pt-6">
                            <h4 className="font-medium mb-3">Add Service Notes</h4>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`notes-${job.id}`}>Update Notes</Label>
                                <Textarea
                                  id={`notes-${job.id}`}
                                  placeholder="Enter service update notes..."
                                  rows={3}
                                  value={notes[job.id] ?? ""}
                                  onChange={(e) => setNotes((prev) => ({ ...prev, [job.id]: e.target.value }))}
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleSaveNotes(job.id)}
                                  disabled={savingId === job.id || !notes[job.id]?.trim()}
                                >
                                  {savingId === job.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                  Save Notes
                                </Button>
                                <Button
                                  variant="outline"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={() => handleMarkCompleted(job.id)}
                                  disabled={savingId === job.id}
                                >
                                  Mark as Completed
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {job.status === "Pending" && (
                          <div className="border-t pt-6">
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStartWorking(job.id)}
                              disabled={savingId === job.id}
                            >
                              {savingId === job.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              Start Working
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
