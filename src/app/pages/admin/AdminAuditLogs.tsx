import { useEffect, useState } from "react";
import { History, Search, Trash2, Calendar, FileText, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { getAuditLogs, clearAuditLogs } from "../../../lib/audit";
import type { AuditLog } from "../../../lib/audit";

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const auditLogs = await getAuditLogs();
      setLogs(auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all audit logs? This action cannot be undone.")) {
      return;
    }
    await clearAuditLogs();
    setLogs([]);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action_type === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Get unique action types for dropdown filter
  const actionTypes = Array.from(new Set(logs.map((l) => l.action_type)));

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("delete")) return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
    if (act.includes("promote") || act.includes("add")) return "bg-green-50 text-green-700 border-green-200 hover:bg-green-50";
    if (act.includes("update") || act.includes("demote") || act.includes("assign")) return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50";
    return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 mt-1">Trace all system changes and administrative actions in real time.</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={loadLogs} className="rounded-xl">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleClearLogs} className="rounded-xl bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 border-b mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by admin name, email, target, or description..." 
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-64">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Action Types</option>
                {actionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold w-48">Timestamp</TableHead>
                  <TableHead className="font-semibold w-56">Admin User</TableHead>
                  <TableHead className="font-semibold w-44">Action</TableHead>
                  <TableHead className="font-semibold w-60">Target</TableHead>
                  <TableHead className="font-semibold">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{log.admin_name}</p>
                          <p className="text-xs text-gray-400">{log.admin_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getActionBadgeColor(log.action_type)}>
                          {log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-700 text-sm text-ellipsis overflow-hidden max-w-[240px]">
                        {log.target}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm font-normal max-w-md truncate md:max-w-none">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <span>{log.details}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      No matching audit logs found.
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
