import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Wrench, LogOut, ArrowLeft, Printer, CalendarRange, Laptop, Monitor, Smartphone, Tablet, Calculator, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAuth } from "../../../contexts/AuthContext";

const DEVICE_TYPES = [
  { id: "laptop", label: "Laptop", Icon: Laptop },
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "smartphone", label: "Smartphone", Icon: Smartphone },
  { id: "tablet", label: "Tablet", Icon: Tablet },
];

const ISSUES = [
  { id: "screen", label: "Screen Replacement", partsBase: 3500, laborBase: 500, eta: "1-2 Days" },
  { id: "battery", label: "Battery Replacement", partsBase: 1800, laborBase: 300, eta: "Same Day" },
  { id: "keyboard", label: "Keyboard/Touchpad Issues", partsBase: 1200, laborBase: 400, eta: "1-2 Days" },
  { id: "performance", label: "Slow Performance (RAM/SSD)", partsBase: 2500, laborBase: 300, eta: "Same Day" },
  { id: "hardware", label: "Motherboard/Hardware Repair", partsBase: 4800, laborBase: 800, eta: "3-5 Days" },
  { id: "software", label: "OS Installation / Software Problems", partsBase: 0, laborBase: 500, eta: "Same Day" },
  { id: "other", label: "Other Diagnostics / Repairs", partsBase: 800, laborBase: 400, eta: "1-2 Days" },
];

const BRAND_MULTIPLIERS: Record<string, number> = {
  apple: 1.5,
  macbook: 1.5,
  iphone: 1.5,
  ipad: 1.5,
  dell: 1.1,
  hp: 1.0,
  lenovo: 1.0,
  samsung: 1.1,
  sony: 1.2,
  asus: 1.0,
  acer: 1.0,
};

export function CostEstimator() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Selection states
  const [deviceType, setDeviceType] = useState("laptop");
  const [brand, setBrand] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState("screen");
  const [serviceLocation, setServiceLocation] = useState("shop");

  // Calculations
  const [partsCost, setPartsCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [travelFee, setTravelFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [eta, setEta] = useState("");

  const handleLogout = async () => { await signOut(); navigate("/"); };

  // Calculate costs in real-time
  useEffect(() => {
    const issue = ISSUES.find(i => i.id === selectedIssueId);
    if (!issue) return;

    let multiplier = 1.0;
    const cleanBrand = brand.trim().toLowerCase();
    if (cleanBrand && BRAND_MULTIPLIERS[cleanBrand] !== undefined) {
      multiplier = BRAND_MULTIPLIERS[cleanBrand];
    } else {
      // Fuzzy match for Apple or MacBook
      if (cleanBrand.includes("apple") || cleanBrand.includes("mac") || cleanBrand.includes("ios") || cleanBrand.includes("ipad") || cleanBrand.includes("iphone")) {
        multiplier = 1.5;
      }
    }

    const calculatedParts = Math.round(issue.partsBase * multiplier);
    const calculatedLabor = issue.laborBase;
    const calculatedTravel = serviceLocation === "home" ? 250 : 0;
    
    const subtotal = calculatedParts + calculatedLabor + calculatedTravel;
    const calculatedTax = Math.round(subtotal * 0.18); // 18% GST
    const calculatedTotal = subtotal + calculatedTax;

    setPartsCost(calculatedParts);
    setLaborCost(calculatedLabor);
    setTravelFee(calculatedTravel);
    setTax(calculatedTax);
    setTotal(calculatedTotal);
    setEta(issue.eta);
  }, [deviceType, brand, selectedIssueId, serviceLocation]);

  const handlePrintEstimate = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to save or print the estimate.");
      return;
    }

    const issue = ISSUES.find(i => i.id === selectedIssueId);
    const issueName = issue?.label ?? "Diagnostics";
    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric"
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Repair Cost Estimate</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 45px; margin: 0; line-height: 1.6; }
            .container { max-width: 750px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 24px; margin-bottom: 30px; }
            .logo-text { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
            .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 35px; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .val-text { font-size: 14px; color: #334155; margin: 0 0 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; text-align: left; padding: 10px 0; border-bottom: 2px solid #cbd5e1; }
            td { padding: 12px 0; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .summary { width: 280px; margin-left: auto; margin-top: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
            .summary-total { font-size: 18px; font-weight: 800; color: #2563eb; border-top: 2px solid #3b82f6; padding-top: 10px; margin-top: 6px; }
            .footer { border-top: 1px solid #e2e8f0; margin-top: 50px; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
            .disclaimer { font-size: 11px; color: #64748b; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #f1f5f9; margin-top: 25px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <span class="logo-text">SMART TECH SERVICE</span>
                <div class="meta">Computer Repair & Hardware Store</div>
              </div>
              <div style="text-align: right;">
                <h1 class="title">Cost Estimate</h1>
                <div class="meta">Date: ${dateStr}</div>
                <div class="meta">Valid For: 15 Days</div>
              </div>
            </div>

            <div class="grid">
              <div>
                <h3 class="section-title">Device & Job Details</h3>
                <p class="val-text"><strong>Device:</strong> ${deviceType.toUpperCase()} (${brand || "Standard Brand"})</p>
                <p class="val-text"><strong>Service Needed:</strong> ${issueName}</p>
                <p class="val-text"><strong>Service Type:</strong> ${serviceLocation === "home" ? "On-Site Home Service" : "In-Shop Repair"}</p>
                <p class="val-text"><strong>Estimated Turnaround:</strong> ${eta}</p>
              </div>
              <div>
                <h3 class="section-title">Customer Information</h3>
                <p class="val-text"><strong>Name:</strong> ${profile?.full_name ?? "Valued Customer"}</p>
                <p class="val-text"><strong>Phone:</strong> ${profile?.phone ?? "—"}</p>
                <p class="val-text"><strong>Email:</strong> ${profile?.email ?? "—"}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 60%;">Description</th>
                  <th style="width: 40%; text-align: right;">Estimated Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Spare Parts & Components Estimate (${brand || "Standard"})</td>
                  <td style="text-align: right;">₹${partsCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Technician Service Labor Charges</td>
                  <td style="text-align: right;">₹${laborCost.toLocaleString()}</td>
                </tr>
                ${serviceLocation === "home" ? `
                <tr>
                  <td>On-Site Travel & Logistics Fee</td>
                  <td style="text-align: right;">₹${travelFee.toLocaleString()}</td>
                </tr>` : ""}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal (excluding Tax)</span>
                <span>₹${(partsCost + laborCost + travelFee).toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>GST (18% Included)</span>
                <span>₹${tax.toLocaleString()}</span>
              </div>
              <div class="summary-row summary-total">
                <span>Grand Total</span>
                <span>₹${total.toLocaleString()}</span>
              </div>
            </div>

            <div class="disclaimer">
              <strong>Disclaimer:</strong> This cost calculation is an approximation based on standard parts and average labor. The final billing price may vary depending on actual device inspection, exact part models, and additional underlying issues found during diagnostics.
            </div>

            <div class="footer">
              <p>Smart Tech Service Portal • Mumbai, MH, 400001 • support@smarttech.com</p>
              <p>This document is a digital quotation estimate and does not constitute a final bill receipt.</p>
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

  const handleBookNow = () => {
    const selectedIssue = ISSUES.find(i => i.id === selectedIssueId);
    navigate("/user/book-service", {
      state: {
        deviceType: deviceType,
        brand: brand,
        issue: selectedIssueId,
        description: `Automated Request from Cost Estimator.\nDevice: ${deviceType} (${brand})\nSelected Repair: ${selectedIssue?.label ?? "Diagnostics"}\nEstimated Cost: ₹${total.toLocaleString()}\nEstimated ETA: ${eta}`,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/user/dashboard" className="mr-2 text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Tech Service Portal
              </h1>
              <p className="text-xs text-gray-500">Repair Cost Estimator</p>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Repair Cost Estimator</h2>
          <p className="text-gray-600">Estimate pricing for spare parts, service labor, and schedule times before booking.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Select Device & Issue Details
                </CardTitle>
                <CardDescription>Choose options below to calculate instant repair quotes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Device Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">1. Select Device Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DEVICE_TYPES.map((dt) => {
                      const IconComp = dt.Icon;
                      const active = deviceType === dt.id;
                      return (
                        <button
                          key={dt.id}
                          onClick={() => setDeviceType(dt.id)}
                          className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                            active
                              ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-md font-bold scale-[1.02]"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                          }`}
                        >
                          <IconComp className={`w-8 h-8 ${active ? "text-blue-600" : "text-gray-400"}`} />
                          <span className="text-sm">{dt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Brand & Location */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="estimator-brand" className="font-semibold text-gray-700">2. Device Brand</Label>
                    <Input
                      id="estimator-brand"
                      placeholder="e.g., Dell, HP, Apple, Samsung"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="bg-white border-gray-200"
                    />
                    <p className="text-xs text-gray-400">
                      We apply premium multipliers for specialized parts (e.g. Apple).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">3. Service Location</Label>
                    <Select value={serviceLocation} onValueChange={setServiceLocation}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shop">Shop Service (No travel fee)</SelectItem>
                        <SelectItem value="home">Home Service (+₹250 travel fee)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 3. Issue Select */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">4. Select Issue or Hardware Failure</Label>
                  <Select value={selectedIssueId} onValueChange={setSelectedIssueId}>
                    <SelectTrigger className="bg-white border-gray-200 py-3 h-auto">
                      <SelectValue placeholder="Select repair service" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUES.map((issue) => (
                        <SelectItem key={issue.id} value={issue.id}>
                          {issue.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Invoice card */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden sticky top-24">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-white/10">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Price Quote</span>
                  <Badge className="bg-white/20 text-white border-none font-bold uppercase tracking-wider text-[10px]">
                    Valid 15 Days
                  </Badge>
                </CardTitle>
                <CardDescription className="text-blue-100 text-xs">
                  Computer Generated Repair Estimate
                </CardDescription>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Device Type</span>
                    <span className="font-medium capitalize">{deviceType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Brand</span>
                    <span className="font-medium">{brand.trim() || "Standard"}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-4">
                    <span className="text-slate-300">Service Category</span>
                    <span className="font-medium text-right max-w-[180px] truncate" title={ISSUES.find(i => i.id === selectedIssueId)?.label}>
                      {ISSUES.find(i => i.id === selectedIssueId)?.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Parts Cost</span>
                    <span>₹{partsCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Service Labor Charge</span>
                    <span>₹{laborCost.toLocaleString()}</span>
                  </div>
                  {travelFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Travel & Logistics Fee</span>
                      <span>₹{travelFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">GST Tax (18% Included)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-white/20 pt-4 flex justify-between items-baseline">
                  <span className="text-lg font-bold">Total Estimate</span>
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                    ₹{total.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Repair Duration</span>
                  <span className="font-semibold text-blue-300 uppercase tracking-wider">{eta}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold"
                    onClick={handleBookNow}
                  >
                    <CalendarRange className="w-4 h-4 mr-2" />
                    Book This Service
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                    onClick={handlePrintEstimate}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print / Save Estimate
                  </Button>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-black/20 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 border-t border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Verified Smart Tech repair price matrix.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
