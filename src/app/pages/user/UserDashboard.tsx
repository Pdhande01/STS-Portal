import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Home, Package, Wrench, ShoppingCart, Star, LogOut, TrendingUp, Activity, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserServiceRequests } from "../../../lib/services";
import { getUserOrders } from "../../../lib/products";
import type { ServiceRequest, Order } from "../../../lib/supabase";

export function UserDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [svc, ord] = await Promise.all([
          getUserServiceRequests(),
          getUserOrders(),
        ]);
        setServices(svc);
        setOrders(ord);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const activeServices = services.filter(s => s.status !== "Completed" && s.status !== "Cancelled");
  const completedServices = services.filter(s => s.status === "Completed");

  const firstName = profile?.full_name?.split(" ")[0] ?? "User";
  const initials = profile?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Tech Service
              </h1>
              <p className="text-xs text-gray-500">User Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700">{profile?.full_name ?? "User"}</span>
            </div>
            <Button variant="outline" size="sm" className="hover:border-red-500 hover:text-red-500" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back, {firstName}! 👋
          </h2>
          <p className="text-gray-600 text-lg">Here's what's happening with your services and orders</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Active Services</CardTitle>
                  <Activity className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{activeServices.length}</div>
                  <p className="text-xs text-gray-600 mt-1">In progress</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
                  <Package className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{completedServices.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Total services</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Orders</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{orders.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Total orders</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Spent</CardTitle>
                  <Star className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    ₹{orders.reduce((s, o) => s + o.total_amount, 0).toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">On products</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Link to="/user/book-service" className="block">
                <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
                  <CardHeader>
                    <Wrench className="w-12 h-12 mb-2" />
                    <CardTitle className="text-xl">Book Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-100">Schedule a repair service →</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/user/track-service" className="block">
                <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-green-500 bg-gradient-to-br from-green-500 to-green-600 text-white h-full">
                  <CardHeader>
                    <Package className="w-12 h-12 mb-2" />
                    <CardTitle className="text-xl">Track Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-100">Check repair status →</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/user/shop" className="block">
                <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-purple-500 bg-gradient-to-br from-purple-500 to-purple-600 text-white h-full">
                  <CardHeader>
                    <ShoppingCart className="w-12 h-12 mb-2" />
                    <CardTitle className="text-xl">Shop</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-100">Buy hardware products →</p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-yellow-500 bg-gradient-to-br from-yellow-500 to-orange-500 text-white h-full">
                <CardHeader>
                  <TrendingUp className="w-12 h-12 mb-2" />
                  <CardTitle className="text-xl">Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-100">View spending history →</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Services */}
            <Card className="mb-8 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  Recent Service Requests
                </CardTitle>
                <CardDescription className="text-base">Track your ongoing and completed services</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {services.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No service requests yet. <Link to="/user/book-service" className="text-blue-600 underline">Book your first service!</Link></p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-6 border-2 rounded-xl hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-lg">{service.brand} {service.model}</p>
                            <Badge
                              variant={service.status === "Completed" ? "default" : "secondary"}
                              className={service.status === "Completed" ? "bg-green-500" : service.status === "In Progress" ? "bg-blue-500" : "bg-gray-500"}
                            >
                              {service.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2 capitalize">{service.issue_type.replace(/-/g, ' ')}</p>
                          <p className="text-xs text-gray-500">ID: {service.id.slice(0, 8).toUpperCase()} • {new Date(service.created_at).toLocaleDateString()}</p>
                          {service.status === "In Progress" && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{service.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                  style={{ width: `${service.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <Link to="/user/track-service">
                          <Button variant="outline" className="ml-4">View Details</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-base">View your product purchase history</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {orders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No orders yet. <Link to="/user/shop" className="text-blue-600 underline">Visit the shop!</Link></p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-6 border-2 rounded-xl hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                            <Badge
                              variant={order.status === "Delivered" ? "default" : "secondary"}
                              className={order.status === "Delivered" ? "bg-green-500" : "bg-blue-500"}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-1">₹{order.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline">Track Order</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
