"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for URL error parameters and convert to user-friendly messages
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'SessionRequired':
          setError("Please sign in to access this page");
          break;
        case 'AccessDenied':
          setError("Access denied. Please check your credentials");
          break;
        case 'Configuration':
          setError("Authentication configuration error");
          break;
        default:
          setError(urlError);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        totpCode: showTwoFactor ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "2FA code is required") {
          setShowTwoFactor(true);
        } else {
          // Convert error codes to user-friendly messages
          switch (result.error) {
            case 'CredentialsSignin':
              setError("Invalid email or password. Please try again.");
              break;
            case 'SessionRequired':
              setError("Please sign in to access this page");
              break;
            case 'AccessDenied':
              setError("Access denied. Please check your credentials");
              break;
            default:
              setError(result.error);
          }
        }
      } else if (result?.ok) {
        const session = await getSession();
        if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {showTwoFactor && (
              <div className="space-y-2">
                <Label htmlFor="totpCode">2FA Code</Label>
                <Input
                  id="totpCode"
                  type="text"
                  value={totpCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/20 p-3 rounded-lg border border-red-400/30 font-medium">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
