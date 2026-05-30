import { useEffect, useState } from "react";
import { 
  Wrench, Search, Filter, User, Calendar, MoreHorizontal, 
  CheckCircle, Clock, AlertCircle, Loader2, Edit3, Trash2, 
  ShieldCheck, RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { getAllServiceRequests } from "../../../lib/services";
import { 
  getAllTechnicians, 
  assignTechnicianToService, 
  deleteServiceRequest, 
  adminUpdateServiceRequest 
} from "../../../lib/admin";
import type { ServiceRequest, Profile } from "../../../lib/supabase";

export function AdminServices() {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Assignment state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState("");

  const loadData = async () => {
    try {
      const [svc, tech] = await Promise.all([getAllServiceRequests(), getAllTechnicians()]);
      setServices(svc);
      setTechnicians(tech);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (serviceId: string) => {
    if (!selectedTechId) return;
    try {
      await assignTechnicianToService(serviceId, selectedTechId);
      setAssigningId(null);
      setSelectedTechId("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Assignment failed.");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this service request?")) {
      return;
    }
    try {
      await deleteServiceRequest(requestId);
      setServices(services.filter(s => s.id !== requestId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service request.");
    }
  };

  const handleUpdateStatus = async (requestId: string, status: any) => {
    try {
      await adminUpdateServiceRequest(requestId, { status });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleUpdateProgress = async (request: ServiceRequest) => {
    const newProgressStr = window.prompt(`Enter progress percentage (0-100) for ${request.brand} ${request.model}:`, request.progress.toString());
    if (newProgressStr === null) return;

    const progress = parseInt(newProgressStr);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      alert("Please enter a valid percentage between 0 and 100.");
      return;
    }

    try {
      await adminUpdateServiceRequest(request.id, { progress });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update progress.");
    }
  };

  const filteredServices = services.filter(s => 
    s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.profiles as Profile)?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-500 mt-1">Monitor all hardware repair requests and manage assignments.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 border-b mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by device, customer, or issue..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="bg-white">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Device & Customer</TableHead>
                  <TableHead className="font-semibold">Issue Details</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Technician</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((s) => {
                    const customer = s.profiles as Profile;
                    const tech = s.technician as Profile;
                    return (
                      <TableRow key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{s.brand} {s.model}</span>
                            <span className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3" />
                              {customer?.full_name ?? "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">{s.issue_type}</span>
                            <span className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{s.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.status === "Completed" ? "bg-green-50 text-green-700 border border-green-100" :
                            s.status === "In Progress" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          }`}>
                            {s.status === "Completed" ? <CheckCircle className="w-3 h-3" /> : 
                             s.status === "In Progress" ? <Clock className="w-3 h-3" /> : 
                             <AlertCircle className="w-3 h-3" />}
                            {s.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          {assigningId === s.id ? (
                            <div className="flex items-center gap-2">
                              <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                                <SelectTrigger className="h-8 w-32 text-xs">
                                  <SelectValue placeholder="Select tech" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="text-xs">{t.full_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" className="h-8 px-2 bg-purple-600 cursor-pointer" onClick={() => handleAssign(s.id)}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-400 cursor-pointer" onClick={() => setAssigningId(null)}>
                                X
                              </Button>
                            </div>
                          ) : tech ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                                {tech.full_name.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-600">{tech.full_name}</span>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 text-xs font-semibold cursor-pointer"
                              onClick={() => setAssigningId(s.id)}
                            >
                              + Assign Tech
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                className="cursor-pointer text-gray-700 focus:bg-gray-50"
                                onClick={() => handleUpdateProgress(s)}
                              >
                                <Edit3 className="w-4 h-4 mr-2 text-gray-400" />
                                Update Progress
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                className="cursor-pointer text-gray-700 focus:bg-gray-50"
                                onClick={() => setAssigningId(s.id)}
                              >
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                {tech ? "Reassign Tech" : "Assign Tech"}
                              </DropdownMenuItem>

                              {s.status !== "Completed" && (
                                <DropdownMenuItem 
                                  className="cursor-pointer text-green-600 focus:bg-green-50 focus:text-green-700"
                                  onClick={() => handleUpdateStatus(s.id, "Completed")}
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}

                              {s.status !== "In Progress" && tech && (
                                <DropdownMenuItem 
                                  className="cursor-pointer text-blue-600 focus:bg-blue-50 focus:text-blue-700"
                                  onClick={() => handleUpdateStatus(s.id, "In Progress")}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Set In Progress
                                </DropdownMenuItem>
                              )}

                              {s.status !== "Pending" && (
                                <DropdownMenuItem 
                                  className="cursor-pointer text-yellow-600 focus:bg-yellow-50 focus:text-yellow-700"
                                  onClick={() => handleUpdateStatus(s.id, "Pending")}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Set Pending
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                onClick={() => handleDeleteRequest(s.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      No service requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
