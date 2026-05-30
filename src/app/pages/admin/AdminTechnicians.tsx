import { useEffect, useState } from "react";
import { UserCog, Plus, Phone, Award, Mail, Loader2, MoreVertical, UserMinus, Trash2, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { getAllTechnicians, createTechnician, demoteTechnician, deleteUser } from "../../../lib/admin";
import { supabase } from "../../../lib/supabase";
import type { Profile } from "../../../lib/supabase";

export function AdminTechnicians() {
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New technician form state
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: ""
  });

  // Modal for viewing profile
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingTech, setViewingTech] = useState<Profile | null>(null);

  // Modal for viewing active tasks
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [techTasks, setTechTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const t = await getAllTechnicians();
      setTechnicians(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password || !form.specialization) {
      alert("Please fill in all fields.");
      return;
    }
    
    setAdding(true);
    try {
      await createTechnician(form.email, form.password, form.name, form.phone, form.specialization);
      setOpen(false);
      setForm({ name: "", email: "", phone: "", password: "", specialization: "" });
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to add technician.");
    } finally {
      setAdding(false);
    }
  };

  const handleViewTasks = async (tech: Profile) => {
    setViewingTech(tech);
    setLoadingTasks(true);
    setTasksModalOpen(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("technician_id", tech.id)
        .neq("status", "Completed")
        .neq("status", "Cancelled");

      if (error) throw error;
      setTechTasks(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load technician tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDemote = async (techId: string) => {
    if (!window.confirm("Are you sure you want to demote this technician back to a standard user?")) {
      return;
    }
    try {
      await demoteTechnician(techId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to demote technician.");
    }
  };

  const handleDeleteTech = async (techId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this technician profile?")) {
      return;
    }
    try {
      await deleteUser(techId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete technician.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Technician Management</h1>
          <p className="text-gray-500 mt-1">Manage your team of certified service professionals.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 shadow-sm transition-all hover:scale-[1.02]">
              <Plus className="w-4 h-4 mr-2" />
              Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Technician</DialogTitle>
              <DialogDescription>
                Register a new certified service professional directly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTechnician} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  required 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="e.g. Robert Martin" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  required 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  placeholder="e.g. bob@smarttech.com" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  type="tel"
                  required 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="e.g. +91 99999 88888" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Login Password</Label>
                <Input 
                  id="password"
                  type="password"
                  required 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  placeholder="••••••••" 
                />
              </div>
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <Select value={form.specialization} onValueChange={v => setForm({...form, specialization: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose specialization..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laptop Repair">Laptop Repair</SelectItem>
                    <SelectItem value="Desktop Repair">Desktop Repair</SelectItem>
                    <SelectItem value="All Devices">All Devices</SelectItem>
                    <SelectItem value="Software Specialist">Software Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-3">
                <Button type="submit" className="w-full bg-purple-600" disabled={adding || !form.name || !form.email || !form.phone || !form.password || !form.specialization}>
                  {adding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</> : "Add Technician"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map((tech) => (
          <Card key={tech.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="h-2 bg-purple-600 w-full" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200 shadow-sm">
                  <UserCog className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                    Technician
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem 
                        className="cursor-pointer text-orange-600 focus:bg-orange-50 focus:text-orange-700"
                        onClick={() => handleDemote(tech.id)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Demote to User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                        onClick={() => handleDeleteTech(tech.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardTitle className="mt-4 text-xl">{tech.full_name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Award className="w-3.5 h-3.5 text-orange-500" />
                {tech.specialization ?? "General Support"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 border-t mt-4">
              <div className="space-y-2.5">
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {tech.phone ?? "No phone provided"}
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Joined {new Date(tech.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs cursor-pointer"
                  onClick={() => {
                    setViewingTech(tech);
                    setProfileModalOpen(true);
                  }}
                >
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs cursor-pointer"
                  onClick={() => handleViewTasks(tech)}
                >
                  Active Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Profile Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Technician Profile</DialogTitle>
            <DialogDescription>
              Detailed view of the technician's account and records.
            </DialogDescription>
          </DialogHeader>
          {viewingTech && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-2xl border border-purple-200 shadow-sm">
                  {viewingTech.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewingTech.full_name}</h3>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50 mt-1 capitalize">
                    {viewingTech.specialization || "General Support"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Email</span>
                  <span className="col-span-2 text-gray-900 break-all">{viewingTech.email || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Phone</span>
                  <span className="col-span-2 text-gray-900">{viewingTech.phone || "No phone number"}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Joined Date</span>
                  <span className="col-span-2 text-gray-900">
                    {new Date(viewingTech.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="col-span-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      viewingTech.status === "suspended" 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {viewingTech.status || "Active"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Tasks Dialog */}
      <Dialog open={tasksModalOpen} onOpenChange={setTasksModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Active Tasks - {viewingTech?.full_name}</DialogTitle>
            <DialogDescription>
              Current ongoing repair jobs and assignments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {loadingTasks ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="text-sm text-gray-500">Loading assignments...</span>
              </div>
            ) : techTasks.length > 0 ? (
              techTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {task.brand} {task.model}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{task.device_type} Repair</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      task.status === "In Progress" 
                        ? "bg-purple-100 text-purple-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Issue:</strong> {task.issue_type}</p>
                    <p className="truncate"><strong>Desc:</strong> {task.description}</p>
                    <p><strong>Schedule:</strong> {task.preferred_date} • {task.preferred_time}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>PROGRESS</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <Wrench className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">No Active Tasks</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                  This technician currently has no pending or in-progress service requests.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
