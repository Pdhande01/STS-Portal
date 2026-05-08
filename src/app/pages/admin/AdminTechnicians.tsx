import { useEffect, useState } from "react";
import { UserCog, Plus, Phone, Award, Mail, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { getAllTechnicians, getAllUsers, promoteToTechnician } from "../../../lib/admin";
import type { Profile } from "../../../lib/supabase";

export function AdminTechnicians() {
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Promotion form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, u] = await Promise.all([getAllTechnicians(), getAllUsers()]);
      setTechnicians(t);
      setUsers(u);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !specialization) return;
    
    setPromoting(true);
    try {
      await promoteToTechnician(selectedUserId, specialization);
      setOpen(false);
      setSelectedUserId("");
      setSpecialization("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to promote technician.");
    } finally {
      setPromoting(false);
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
                Promote an existing user to the technician role.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePromote} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name} ({u.phone ?? "No phone"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger>
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
              <div className="pt-4">
                <Button type="submit" className="w-full bg-purple-600" disabled={promoting || !selectedUserId || !specialization}>
                  {promoting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Promoting...</> : "Confirm Promotion"}
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
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                  Technician
                </Badge>
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
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Profile
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Active Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
