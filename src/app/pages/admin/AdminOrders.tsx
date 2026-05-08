import { useEffect, useState } from "react";
import { ShoppingBag, Search, Eye, CheckCircle, Package, Truck, XCircle, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getAllOrders, updateOrderStatus } from "../../../lib/admin";
import { Loader2 } from "lucide-react";

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 mt-1">Process customer orders and manage fulfillment status.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 border-b mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by order ID or customer..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ShoppingBag className="w-4 h-4" />
                <span>Total Orders: <strong>{orders.length}</strong></span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-purple-600">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{o.profiles?.full_name}</span>
                          <span className="text-xs text-gray-500">{o.profiles?.phone ?? "No phone"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{o.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`
                          ${o.status === "Delivered" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : 
                            o.status === "Shipped" ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" : 
                            o.status === "Processing" ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200" : 
                            "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200"}
                        `}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {o.status === "Processing" && (
                            <Button size="sm" variant="outline" className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleStatusUpdate(o.id, "Shipped")}>
                              <Truck className="w-3 h-3 mr-1" /> Ship
                            </Button>
                          )}
                          {o.status === "Shipped" && (
                            <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-600 hover:bg-green-50"
                              onClick={() => handleStatusUpdate(o.id, "Delivered")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Deliver
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      No orders found.
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
