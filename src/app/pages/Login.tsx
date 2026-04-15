import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Wrench, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { signIn, getProfile } from "../../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (!profile) throw new Error("Profile not found. Please contact support.");

      if (profile.role === "user") navigate("/user/dashboard");
      else if (profile.role === "technician") navigate("/technician/dashboard");
      else if (profile.role === "admin") navigate("/admin/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Check your credentials.";
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
                Your Tech Partner
              </span>
            </div>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-white/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="user" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white">
                  User
                </TabsTrigger>
                <TabsTrigger value="technician" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white">
                  Technician
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white">
                  Admin
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* All tabs share the same form — role is determined by the profile after login */}
              {(["user", "technician", "admin"] as const).map((role) => (
                <TabsContent key={role} value={role}>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${role}-email`}>Email</Label>
                      <Input
                        id={`${role}-email`}
                        type="email"
                        placeholder={`${role}@example.com`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${role}-password`}>Password</Label>
                      <Input
                        id={`${role}-password`}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full h-11 shadow-lg ${
                        role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          : role === "technician"
                          ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      }`}
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
                      ) : (
                        `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                      )}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-sm mt-6">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}
