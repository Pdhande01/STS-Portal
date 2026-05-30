import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Home, Package, Wrench, ShoppingCart, Star, LogOut, TrendingUp, Activity, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserServiceRequests } from "../../../lib/services";
import { getUserOrders } from "../../../lib/products";
import { updateAccountDetails } from "../../../lib/auth";
import type { ServiceRequest, Order } from "../../../lib/supabase";

export function UserDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Profile Settings state
  const [profileOpen, setProfileOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  // Load user data
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

  // Update form inputs when profile changes
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.full_name || "",
        phone: profile.phone || "",
        password: "",
        confirmPassword: ""
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert("Name and Phone Number are required.");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (form.password && form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setUpdating(true);
    try {
      await updateAccountDetails(
        profile!.id,
        form.name,
        form.phone,
        form.password || undefined
      );
      
      alert("Profile updated successfully!");
      setProfileOpen(false);
      setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print/download the invoice.");
      return;
    }

    const itemsHtml = order.order_items?.map((item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-size: 14px; color: #1e293b;">${item.products?.name ?? 'Unknown Component'}</td>
        <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #475569;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #475569;">₹${item.price_at_purchase.toLocaleString()}</td>
        <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">₹${(item.quantity * item.price_at_purchase).toLocaleString()}</td>
      </tr>
    `).join("") || "";

    const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric"
    });

    const taxAmount = order.total_amount * 0.18;
    const subtotal = order.total_amount - taxAmount;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; margin: 0; line-height: 1.5; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 30px; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; gap: 12px; }
            .logo-text { font-size: 22px; font-weight: 800; background: linear-gradient(to right, #2563eb, #7c3aed); -webkit-background-clip: text; color: #2563eb; }
            .invoice-details { text-align: right; }
            .title { font-size: 28px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; margin: 0 0 10px 0; letter-spacing: 0.05em; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            .details-text { font-size: 14px; color: #334155; margin: 0 0 6px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; text-align: left; padding: 12px 0; border-bottom: 2px solid #cbd5e1; }
            .summary-table { width: 300px; margin-left: auto; margin-top: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .summary-total { font-size: 18px; font-weight: 800; color: #1e3a8a; border-top: 2px solid #2563eb; padding-top: 12px; margin-top: 8px; }
            .footer { border-top: 1px dashed #cbd5e1; margin-top: 60px; padding-top: 20px; text-align: center; font-size: 12px; color: #64748b; }
            .barcode-section { margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
            .barcode { width: 220px; height: 40px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 8px); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-section">
                <span class="logo-text">SMART TECH SERVICE</span>
              </div>
              <div class="invoice-details">
                <h1 class="title">Invoice</h1>
                <p class="details-text"><strong>Invoice ID:</strong> INV-${order.id.slice(0, 8).toUpperCase()}</p>
                <p class="details-text"><strong>Date:</strong> ${invoiceDate}</p>
                <p class="details-text"><strong>Payment Method:</strong> Cash on Delivery</p>
                <p class="details-text"><strong>Status:</strong> ${order.status}</p>
              </div>
            </div>

            <div class="meta-grid">
              <div>
                <h3 class="section-title">Supplier Details</h3>
                <p class="details-text"><strong>Smart Tech Service Portal</strong></p>
                <p class="details-text">Plot No. 42, Tech Park, Main Street</p>
                <p class="details-text">Mumbai, Maharashtra, 400001</p>
                <p class="details-text">Email: support@smarttech.com</p>
                <p class="details-text">Phone: +91 99999 99999</p>
              </div>
              <div>
                <h3 class="section-title">Recipient Details</h3>
                <p class="details-text"><strong>${profile?.full_name ?? "Customer"}</strong></p>
                <p class="details-text">Phone: ${profile?.phone ?? "No phone"}</p>
                <p class="details-text"><strong>Shipping Address:</strong></p>
                <p class="details-text" style="white-space: pre-line;">${order.delivery_address ?? "Not specified"}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Description</th>
                  <th style="width: 15%; text-align: center;">Qty</th>
                  <th style="width: 15%; text-align: right;">Unit Price</th>
                  <th style="width: 20%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary-table">
              <div class="summary-row">
                <span style="color: #64748b;">Subtotal (excl. Tax)</span>
                <span>₹${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div class="summary-row">
                <span style="color: #64748b;">GST (18% Included)</span>
                <span>₹${taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div class="summary-row">
                <span style="color: #64748b;">Shipping Fee</span>
                <span>₹0.00</span>
              </div>
              <div class="summary-row summary-total">
                <span>Grand Total</span>
                <span>₹${order.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>

            <div class="barcode-section">
              <div class="barcode"></div>
              <span style="font-family: monospace; font-size: 10px; letter-spacing: 2px;">*INV-${order.id.slice(0, 8).toUpperCase()}*</span>
            </div>

            <div class="footer">
              <p>Thank you for shopping with Smart Tech Service Portal!</p>
              <p>This is a computer-generated invoice and requires no physical signature.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                Smart Tech Service Portal
              </h1>
              <p className="text-xs text-gray-500">User Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
              <DialogTrigger asChild>
                <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profile?.full_name ?? "User"}</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your account details and security password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Your Phone Number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">New Password (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="•••••••• (leave blank to keep current)"
                    />
                  </div>
                  {form.password && (
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  <div className="pt-3">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={updating}>
                      {updating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

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
                          <p className="text-gray-600 mb-1 font-semibold">₹{order.total_amount.toFixed(2)}</p>
                          {order.delivery_address && (
                            <p className="text-sm text-gray-600 mb-2 italic">
                              📍 Shipping to: {order.delivery_address}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50" onClick={() => setSelectedInvoice(order)}>
                            Invoice
                          </Button>
                          <Button variant="outline">Track Order</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-2xl border-none">
            <DialogHeader className="border-b pb-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Invoice Summary
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Order ID: #{selectedInvoice.id.slice(0, 8).toUpperCase()}
                  </DialogDescription>
                </div>
                <Badge className={selectedInvoice.status === "Delivered" ? "bg-green-500" : "bg-blue-500"}>
                  {selectedInvoice.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Merchant</h4>
                  <p className="font-medium text-gray-900">Smart Tech Service Portal</p>
                  <p className="text-gray-600">Plot No. 42, Tech Park, Main Street</p>
                  <p className="text-gray-600">Mumbai, Maharashtra, 400001</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Ship To</h4>
                  <p className="font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-gray-600">{profile?.phone}</p>
                  <p className="text-gray-600 italic whitespace-pre-line">{selectedInvoice.delivery_address ?? "Not specified"}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Product</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {selectedInvoice.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 text-left font-medium">{item.products?.name ?? 'Unknown Component'}</td>
                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">₹{item.price_at_purchase.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-semibold">₹{(item.quantity * item.price_at_purchase).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summaries */}
              <div className="w-80 ml-auto space-y-2 text-sm pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (excluding Tax)</span>
                  <span>₹{(selectedInvoice.total_amount - (selectedInvoice.total_amount * 0.18)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18% Included)</span>
                  <span>₹{(selectedInvoice.total_amount * 0.18).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b pb-2">
                  <span>Shipping Fee</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
                  <span>Grand Total</span>
                  <span className="text-blue-600">₹{selectedInvoice.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => handlePrint(selectedInvoice)}
              >
                Print / Save PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
