"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home as HomeIcon, Loader2 } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const registered = searchParams.get("registered") === "true";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith(".edu")) {
      newErrors.email = "Must be a valid .edu email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth error codes to user-friendly messages
        if (result.error === "CredentialsSignin" || result.error === "CallbackRouteError") {
          setServerError("Invalid email or password. Please check your credentials and try again.");
        } else if (result.error === "Configuration") {
          setServerError("No account found with that email. Please sign up first.");
        } else {
          setServerError(result.error);
        }
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-primary via-gray-900 to-school-primary p-4">
      <Card className="w-full max-w-md bg-white text-gray-900">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-school-secondary rounded-lg">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-center text-gray-700">
            Sign in to your CampusNest account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {registered && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Account created successfully! Please sign in.
                </p>
              </div>
            )}

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                Student Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="student@school.edu"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-school-secondary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-school-secondary hover:bg-school-secondary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-school-secondary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-primary via-gray-900 to-school-primary p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-8">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-school-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
