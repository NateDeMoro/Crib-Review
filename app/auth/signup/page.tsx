"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home as HomeIcon, Loader2 } from "lucide-react";
import { autoSignInAction } from "@/app/actions/auth-actions";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith(".edu")) {
      newErrors.email = "Must be a valid .edu email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // Step 1: Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Step 2: Auto sign-in the user
      const signInResult = await autoSignInAction(
        formData.email.toLowerCase(),
        formData.password
      );

      if (!signInResult.success) {
        // If auto sign-in fails, redirect to sign-in page with email pre-filled
        router.push(`/auth/signin?email=${encodeURIComponent(formData.email.toLowerCase())}`);
        return;
      }

      // Step 3: Redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-primary via-gray-900 to-school-primary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-school-secondary rounded-lg">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Join students sharing honest housing reviews
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
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
              <p className="text-xs text-gray-500">
                Must be a valid .edu email address
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
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
              <p className="text-xs text-gray-500">
                At least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
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
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-school-secondary hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
