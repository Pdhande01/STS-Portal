import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Wrench, LogOut, Calendar, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAuth } from "../../../contexts/AuthContext";
import { createServiceRequest } from "../../../lib/services";

export function BookService() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    issue: "",
    description: "",
    serviceLocation: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
    phone: profile?.phone ?? "",
  });

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createServiceRequest({
        device_type: formData.deviceType,
        brand: formData.brand,
        model: formData.model,
        issue_type: formData.issue,
        description: formData.description,
        service_location: formData.serviceLocation as "home" | "shop",
        address: formData.serviceLocation === "home" ? formData.address : undefined,
        phone: formData.phone,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
      });
      alert("Service request submitted successfully! You will be notified once a technician is assigned.");
      navigate("/user/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold mb-2">Book Repair Service</h2>
          <p className="text-gray-600">Fill in the details to schedule a repair service</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Provide information about your device and the issue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Device Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Device Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceType">Device Type *</Label>
                    <Select
                      value={formData.deviceType}
                      onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="all-in-one">All-in-One PC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Dell, HP, Apple"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., XPS 15, MacBook Pro 2020"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue">Issue Type *</Label>
                  <Select
                    value={formData.issue}
                    onValueChange={(value) => setFormData({ ...formData, issue: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screen">Screen Issues</SelectItem>
                      <SelectItem value="battery">Battery Problems</SelectItem>
                      <SelectItem value="keyboard">Keyboard/Touchpad Issues</SelectItem>
                      <SelectItem value="performance">Performance Issues</SelectItem>
                      <SelectItem value="hardware">Hardware Failure</SelectItem>
                      <SelectItem value="software">Software Problems</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Service Location */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Service Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="serviceLocation">Service Type *</Label>
                  <Select
                    value={formData.serviceLocation}
                    onValueChange={(value) => setFormData({ ...formData, serviceLocation: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Service</SelectItem>
                      <SelectItem value="shop">Shop Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.serviceLocation === "home" && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Preferred Schedule
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Preferred Date *</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Time *</Label>
                    <Select
                      value={formData.preferredTime}
                      onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                        <SelectItem value="evening">Evening (4 PM - 7 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    "Submit Service Request"
                  )}
                </Button>
                <Link to="/user/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
