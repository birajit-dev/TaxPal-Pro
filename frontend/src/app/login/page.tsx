"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Calculator,
  Shield,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <Card className="shadow-elegant-lg border-0 backdrop-blur-sm bg-white/95 animate-fade-in">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto mb-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gradient">TaxPal Pro</h1>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account to continue managing your taxes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={!!error}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    error={!!error}
                    className="h-12 text-base pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-slide-up">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-red-600 text-sm">!</span>
                    </div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-elegant"
                loading={loading}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div
          className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center mb-3">
            <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-900">
              Demo Credentials
            </h3>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <strong>Email:</strong> demo@taxpalpro.com
            </p>
            <p>
              <strong>Password:</strong> demo123
            </p>
            <p className="text-blue-600 mt-2 flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Use these credentials to explore the app safely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
