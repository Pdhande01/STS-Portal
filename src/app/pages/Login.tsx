import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Wrench, Sparkles, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

import { signIn, getProfile, signOut } from "../../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      if (!user) throw new Error("Login failed");

      const profile = await getProfile(user.id);
      if (!profile) throw new Error("Profile not found. Please register first.");

      if (profile.status === "suspended") {
        await signOut();
        throw new Error("Your account has been suspended by an administrator.");
      }

      if (profile.role === "admin") navigate("/admin/dashboard");
      else if (profile.role === "technician") navigate("/technician/dashboard");
      else navigate("/user/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
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
          <Link to="/" className="flex flex-col items-center gap-4 mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-2xl flex items-center justify-center w-32 h-32">
              <img src="/logo.png" alt="Smart Tech Logo" className="w-28 h-28 object-contain" />
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-white block">Smart Tech Service</span>
              <span className="text-blue-200 text-sm flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Secure Client Portal
              </span>
            </div>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-white/20 overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

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
          Smart Tech Service • Secure Portal
        </p>
      </div>
    </div>
  );
}
