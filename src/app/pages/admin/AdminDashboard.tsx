import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Wrench, LogOut, Users, UserCog, Package, DollarSign, BarChart3, Plus, Loader2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllUsers, getAllTechnicians, addTechnician, assignTechnicianToService, getAdminStats } from "../../../lib/admin";
import { getAllServiceRequests } from "../../../lib/services";
import { getProducts, addProduct } from "../../../lib/products";
import type { Profile, ServiceRequest, Product } from "../../../lib/supabase";

export function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState({ totalUsers: 0, totalTechnicians: 0, activeServices: 0, monthlyRevenue: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // New technician form
  const [techForm, setTechForm] = useState({ name: "", email: "", phone: "", password: "", specialization: "" });
  const [addingTech, setAddingTech] = useState(false);
  const [techError, setTechError] = useState("");

  // New product form
  const [prodForm, setProdForm] = useState({ name: "", category: "memory", price: "", stock: "", image_url: "" });
  const [addingProd, setAddingProd] = useState(false);

  // Assign technician
  const [assigningServiceId, setAssigningServiceId] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>("");

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, t, svc, p] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllTechnicians(),
        getAllServiceRequests(),
        getProducts(),
      ]);
      setStats(s);
      setUsers(u);
      setTechnicians(t);
      setServices(svc);
      setProducts(p);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    setTechError("");
    setAddingTech(true);
    try {
      await addTechnician(
        techForm.email, techForm.password, techForm.name, techForm.phone, techForm.specialization
      );
      setTechForm({ name: "", email: "", phone: "", password: "", specialization: "" });
      await loadAll();
      alert("Technician added successfully!");
    } catch (err: unknown) {
      setTechError(err instanceof Error ? err.message : "Failed to add technician.");
    } finally {
      setAddingTech(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProd(true);
    try {
      await addProduct({
        name: prodForm.name,
        category: prodForm.category as "memory" | "storage" | "accessories",
        price: parseFloat(prodForm.price),
        stock: parseInt(prodForm.stock),
        image_url: prodForm.image_url || null,
        rating: 4.5,
        reviews: 0,
        trending: false,
      });
      setProdForm({ name: "", category: "memory", price: "", stock: "", image_url: "" });
      await loadAll();
      alert("Product added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    } finally {
      setAddingProd(false);
    }
  };

  const handleAssign = async (serviceId: string) => {
    if (!selectedTechId) return;
    try {
      await assignTechnicianToService(serviceId, selectedTechId);
      setAssigningServiceId(null);
      setSelectedTechId("");
      await loadAll();
    } catch (err) {
      console.error(err);
      alert("Failed to assign technician.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Admin</span>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-purple-700" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="technicians">Technicians</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            {/* ── Overview ─────────────────────────────── */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>

                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Technicians</CardTitle>
                      <UserCog className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTechnicians}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                      <Package className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeServices}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Recent Service Requests
                    </CardTitle>
                    <CardDescription>Latest service requests in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {services.slice(0, 5).map((s) => {
                        const customer = s.profiles as { full_name?: string } | undefined;
                        return (
                          <div key={s.id} className={`flex justify-between items-center p-3 border-l-4 rounded ${
                            s.status === "Completed" ? "border-green-500 bg-green-50" :
                            s.status === "In Progress" ? "border-blue-500 bg-blue-50" :
                            "border-yellow-500 bg-yellow-50"
                          }`}>
                            <div>
                              <p className="font-medium">{s.brand} {s.model} — {s.issue_type}</p>
                              <p className="text-sm text-gray-600">{customer?.full_name ?? "Unknown"} • {s.status}</p>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Users ──────────────────────────────────── */}
            <TabsContent value="users">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Manage Users ({users.length})</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>User List</CardTitle>
                    <CardDescription>All registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.phone ?? "—"}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant="default">Active</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Technicians ───────────────────────────── */}
            <TabsContent value="technicians">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Manage Technicians</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Technician
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Technician</DialogTitle>
                        <DialogDescription>Create a technician account</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddTechnician} className="space-y-4 py-4">
                        {techError && (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{techError}</div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="tech-name">Full Name</Label>
                          <Input id="tech-name" placeholder="Mike Johnson" value={techForm.name}
                            onChange={(e) => setTechForm({ ...techForm, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tech-email">Email</Label>
                          <Input id="tech-email" type="email" placeholder="tech@example.com" value={techForm.email}
                            onChange={(e) => setTechForm({ ...techForm, email: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tech-phone">Phone</Label>
                          <Input id="tech-phone" type="tel" placeholder="+91 98765 43210" value={techForm.phone}
                            onChange={(e) => setTechForm({ ...techForm, phone: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tech-password">Temporary Password</Label>
                          <Input id="tech-password" type="password" placeholder="Min 6 characters" value={techForm.password}
                            onChange={(e) => setTechForm({ ...techForm, password: e.target.value })} required minLength={6} />
                        </div>
                        <div className="space-y-2">
                          <Label>Specialization</Label>
                          <Select value={techForm.specialization} onValueChange={(v) => setTechForm({ ...techForm, specialization: v })}>
                            <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Laptop Repair">Laptop Repair</SelectItem>
                              <SelectItem value="Desktop Repair">Desktop Repair</SelectItem>
                              <SelectItem value="All Devices">All Devices</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={addingTech}>
                          {addingTech ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Technician"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Technician List</CardTitle>
                    <CardDescription>View and manage service technicians</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {technicians.map((tech) => (
                          <TableRow key={tech.id}>
                            <TableCell className="font-medium">{tech.full_name}</TableCell>
                            <TableCell>{tech.specialization ?? "—"}</TableCell>
                            <TableCell>{tech.phone ?? "—"}</TableCell>
                            <TableCell>{new Date(tech.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Services ──────────────────────────────── */}
            <TabsContent value="services">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Manage Service Requests</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Service Requests</CardTitle>
                    <CardDescription>Assign technicians to pending requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Issue</TableHead>
                          <TableHead>Technician</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((s) => {
                          const customer = s.profiles as { full_name?: string } | undefined;
                          const tech = s.technician as { full_name?: string } | undefined;
                          return (
                            <TableRow key={s.id}>
                              <TableCell className="font-mono text-xs">{s.id.slice(0, 8).toUpperCase()}</TableCell>
                              <TableCell className="font-medium">{customer?.full_name ?? "—"}</TableCell>
                              <TableCell>{s.brand} {s.model}</TableCell>
                              <TableCell>{s.issue_type}</TableCell>
                              <TableCell>
                                {tech?.full_name ? (
                                  tech.full_name
                                ) : (
                                  <Badge variant="outline">Unassigned</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.status === "In Progress" ? "default" : s.status === "Completed" ? "default" : "secondary"}
                                  className={s.status === "Completed" ? "bg-green-500" : s.status === "In Progress" ? "bg-blue-500" : ""}>
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {!s.technician_id && s.status === "Pending" ? (
                                  assigningServiceId === s.id ? (
                                    <div className="flex gap-2">
                                      <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                                        <SelectTrigger className="w-40">
                                          <SelectValue placeholder="Select tech" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {technicians.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button size="sm" onClick={() => handleAssign(s.id)} disabled={!selectedTechId}>
                                        Assign
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setAssigningServiceId(null)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button variant="outline" size="sm" onClick={() => setAssigningServiceId(s.id)}>
                                      Assign
                                    </Button>
                                  )
                                ) : (
                                  <Button variant="outline" size="sm">View</Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Products ──────────────────────────────── */}
            <TabsContent value="products">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Manage Products</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Add a product to the store</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddProduct} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="prod-name">Product Name</Label>
                          <Input id="prod-name" placeholder="16GB DDR4 RAM" value={prodForm.name}
                            onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={prodForm.category} onValueChange={(v) => setProdForm({ ...prodForm, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="memory">Memory (RAM)</SelectItem>
                              <SelectItem value="storage">Storage</SelectItem>
                              <SelectItem value="accessories">Accessories</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="prod-price">Price (₹)</Label>
                            <Input id="prod-price" type="number" step="0.01" placeholder="89.99" value={prodForm.price}
                              onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prod-stock">Stock</Label>
                            <Input id="prod-stock" type="number" placeholder="15" value={prodForm.stock}
                              onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prod-image">Image URL (optional)</Label>
                          <Input id="prod-image" placeholder="https://..." value={prodForm.image_url}
                            onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full" disabled={addingProd}>
                          {addingProd ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Product"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Inventory</CardTitle>
                    <CardDescription>Manage hardware products and stock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Reviews</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="capitalize">{product.category}</TableCell>
                            <TableCell>₹{product.price}</TableCell>
                            <TableCell>
                              <Badge variant={product.stock < 10 ? "destructive" : "default"}>
                                {product.stock}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>{product.reviews}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
