import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Wrench, LogOut, CheckCircle, Clock, Truck, Package, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserServiceRequests } from "../../../lib/services";
import type { ServiceRequest } from "../../../lib/supabase";

export function TrackService() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => { await signOut(); navigate("/"); };

  useEffect(() => {
    getUserServiceRequests()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Smart Tech Service Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/user/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Track Service Status</h2>
          <p className="text-gray-600">Monitor the progress of your repair services in real-time</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500 mb-4">No service requests found</p>
            <Link to="/user/book-service">
              <Button>Book Your First Service</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{service.brand} {service.model}</CardTitle>
                      <CardDescription>
                        Service ID: {service.id.slice(0, 8).toUpperCase()} • {service.issue_type}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={service.status === "Completed" ? "default" : "secondary"}
                      className={
                        service.status === "Completed" ? "bg-green-500" :
                        service.status === "In Progress" ? "bg-blue-500" :
                        "bg-gray-400"
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{service.progress}%</span>
                    </div>
                    <Progress value={service.progress} />
                  </div>

                  {/* Service Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Technician</p>
                        <p className="text-sm text-gray-600">
                          {(service.technician as { full_name?: string } | undefined)?.full_name ?? "Not yet assigned"}
                        </p>
                        {(service.technician as { phone?: string } | undefined)?.phone && (
                          <p className="text-xs text-gray-500">{(service.technician as { phone?: string }).phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Booked Date</p>
                        <p className="text-sm text-gray-600">{new Date(service.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {service.status === "Completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <Truck className="w-5 h-5 text-orange-600 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {service.status === "Completed" ? "Completed Date" : "Preferred Date"}
                        </p>
                        <p className="text-sm text-gray-600">{service.preferred_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Updates Timeline */}
                  {service.service_updates && service.service_updates.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Service Updates</h4>
                      <div className="space-y-3">
                        {[...(service.service_updates ?? [])].sort(
                          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        ).map((update, index, arr) => (
                          <div key={update.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${
                                index === arr.length - 1 ? 'bg-blue-600' : 'bg-gray-300'
                              }`}></div>
                              {index < arr.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-200 flex-1"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-xs text-gray-500 mb-1">
                                {new Date(update.created_at).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-700">{update.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
