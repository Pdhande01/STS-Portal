import { useEffect, useState } from "react";
import { ShoppingBag, Search, Eye, CheckCircle, Package, Truck, XCircle, MoreVertical, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { getAllOrders, updateOrderStatus, deleteOrder } from "../../../lib/admin";
import { Loader2 } from "lucide-react";

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) {
      return;
    }
    try {
      await deleteOrder(orderId);
      alert("Order deleted successfully.");
      await loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    }
  };

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
                          {o.delivery_address && (
                            <span className="text-xs text-gray-600 mt-1.5 font-sans bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block max-w-[220px] truncate" title={o.delivery_address}>
                              📍 {o.delivery_address}
                            </span>
                          )}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 focus:ring-0 focus:ring-offset-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-1 z-50">
                              <DropdownMenuItem 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                onClick={() => setSelectedOrder(o)}
                              >
                                <Eye className="w-4 h-4 text-purple-500" />
                                View Details
                              </DropdownMenuItem>
                              
                              {o.status === "Processing" && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                  onClick={() => handleStatusUpdate(o.id, "Shipped")}
                                >
                                  <Truck className="w-4 h-4 text-blue-500" />
                                  Ship Order
                                </DropdownMenuItem>
                              )}
                              
                              {o.status === "Shipped" && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                  onClick={() => handleStatusUpdate(o.id, "Delivered")}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  Deliver Order
                                </DropdownMenuItem>
                              )}

                              {o.status !== "Processing" && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                  onClick={() => handleStatusUpdate(o.id, "Processing")}
                                >
                                  <Package className="w-4 h-4 text-orange-500" />
                                  Set Processing
                                </DropdownMenuItem>
                              )}

                              {o.status !== "Cancelled" && o.status !== "Delivered" && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors font-medium"
                                  onClick={() => handleStatusUpdate(o.id, "Cancelled")}
                                >
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  Cancel Order
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors border-t border-gray-100 mt-1 font-medium"
                                onClick={() => handleDeleteOrder(o.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-2xl border-none">
            <DialogHeader className="border-b pb-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Order Details
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Order ID: #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </DialogDescription>
                </div>
                <Badge className={`
                  ${selectedOrder.status === "Delivered" ? "bg-green-500" : 
                    selectedOrder.status === "Shipped" ? "bg-blue-500" : 
                    selectedOrder.status === "Processing" ? "bg-orange-500" : 
                    "bg-gray-500"}
                `}>
                  {selectedOrder.status}
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
                  <h4 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Customer</h4>
                  <p className="font-medium text-gray-900">{selectedOrder.profiles?.full_name}</p>
                  <p className="text-gray-600">{selectedOrder.profiles?.phone ?? "No phone"}</p>
                  <p className="text-gray-600 italic whitespace-pre-line">{selectedOrder.delivery_address ?? "Not specified"}</p>
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
                    {selectedOrder.order_items?.map((item: any) => (
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
                  <span>₹{(selectedOrder.total_amount - (selectedOrder.total_amount * 0.18)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18% Included)</span>
                  <span>₹{(selectedOrder.total_amount * 0.18).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b pb-2">
                  <span>Shipping Fee</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
                  <span>Grand Total</span>
                  <span className="text-blue-600">₹{selectedOrder.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
