import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Wrench, Sparkles, Loader2, Mail, Lock, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSeparator, 
  InputOTPSlot 
} from "../components/ui/input-otp";

import { signInWithEmailOtp, verifyEmailOtp, getProfile } from "../../lib/auth";

type LoginStep = "email" | "otp";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await signInWithEmailOtp(email);
      setStep("otp");
      setMessage("A 6-digit code has been sent to your email.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await verifyEmailOtp(email, otp);
      if (!user) throw new Error("Verification failed");

      const profile = await getProfile(user.id);
      if (!profile) throw new Error("Profile not found. Please register first.");

      if (profile.role === "admin") navigate("/admin/dashboard");
      else if (profile.role === "technician") navigate("/technician/dashboard");
      else navigate("/user/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code. Please check and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="bg-white p-3 rounded-2xl shadow-2xl">
              <Wrench className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-left">
              <span className="text-3xl font-bold text-white block">Smart Tech Service</span>
              <span className="text-blue-200 text-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                OTP Secure Login
              </span>
            </div>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-white/20 overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
              {step === "email" ? "Welcome Back" : "Verify Identity"}
            </CardTitle>
            <CardDescription className="text-base">
              {step === "email" 
                ? "Enter your email to receive a login code" 
                : `Enter the code sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                {message}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Secure Code
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="space-y-4 flex flex-col items-center">
                  <Label className="text-gray-700 font-semibold self-start">Verification Code</Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    containerClassName="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold rounded-xl border-gray-200" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold rounded-xl border-gray-200" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold rounded-xl border-gray-200" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold rounded-xl border-gray-200" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold rounded-xl border-gray-200" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold rounded-xl border-gray-200" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Verifying...</>
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-full text-center text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm border-t pt-6">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline font-bold">
                  Register for access
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/60 text-xs mt-6 uppercase tracking-widest font-bold">
          Smart Tech Service • Secure OTP System
        </p>
      </div>
    </div>
  );
}
