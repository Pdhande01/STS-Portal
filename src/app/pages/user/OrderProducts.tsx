import { Link, useParams, useNavigate } from "react-router";
import { Wrench, LogOut, Package, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../../contexts/AuthContext";

export function OrderProducts() {
  const { orderId } = useParams();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await signOut(); navigate("/"); };

  // Mock order data
  const order = {
    id: orderId || "ORD001",
    date: "2026-02-08",
    status: "Shipped",
    total: 89.99,
    items: [
      { name: "16GB DDR4 RAM", quantity: 1, price: 89.99 }
    ],
    shipping: {
      address: "123 Main St, Apt 4B, New York, NY 10001",
      method: "Standard Shipping",
      trackingNumber: "1Z999AA10123456784"
    }
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Order Details</h2>
          <p className="text-gray-600">Order ID: {order.id}</p>
        </div>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Placed on {order.date}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tracking Number</p>
                  <p className="text-sm text-gray-600">{order.shipping.trackingNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold">${item.price}</p>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between items-center">
                  <p className="text-lg font-bold">Total</p>
                  <p className="text-2xl font-bold text-blue-600">${order.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-gray-600">{order.shipping.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Shipping Method</p>
                  <p className="text-sm text-gray-600">{order.shipping.method}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
