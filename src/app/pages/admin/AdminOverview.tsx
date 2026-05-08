import { useEffect, useState } from "react";
import { Users, UserCog, Package, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getAdminStats } from "../../../lib/admin";
import { getAllServiceRequests } from "../../../lib/services";
import { ServiceRequest } from "../../../lib/supabase";
import { Loader2 } from "lucide-react";

export function AdminOverview() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTechnicians: 0, activeServices: 0, monthlyRevenue: 0 });
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, svc] = await Promise.all([getAdminStats(), getAllServiceRequests()]);
        setStats(s);
        setServices(svc);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  const cards = [
    { title: "Total Customers", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%", up: true },
    { title: "Active Techs", value: stats.totalTechnicians, icon: UserCog, color: "text-green-600", bg: "bg-green-50", trend: "+2", up: true },
    { title: "Active Services", value: stats.activeServices, icon: Package, color: "text-orange-600", bg: "bg-orange-50", trend: "-5%", up: false },
    { title: "Monthly Revenue", value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50", trend: "+18%", up: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center mt-1 text-xs">
                {card.up ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={card.up ? "text-green-500" : "text-red-500"}>{card.trend}</span>
                <span className="text-gray-400 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.slice(0, 6).map((s) => {
                const customer = s.profiles as { full_name?: string } | undefined;
                return (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm text-xs font-bold text-purple-600">
                        {customer?.full_name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.brand} {s.model}</p>
                        <p className="text-sm text-gray-500">{customer?.full_name ?? "Unknown"} • {s.issue_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block mb-1 ${
                        s.status === "Completed" ? "bg-green-100 text-green-700" :
                        s.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {s.status}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-80">
                <span>Server Load</span>
                <span>24%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[24%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-80">
                <span>DB Capacity</span>
                <span>12%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[12%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-80">
                <span>Response Time</span>
                <span>124ms</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[5%]" />
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-xs opacity-70 mb-2">QUICK ACTIONS</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs transition-colors">Clear Cache</button>
                <button className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs transition-colors">DB Backup</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
