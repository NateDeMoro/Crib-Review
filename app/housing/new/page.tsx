"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Home as HomeIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddHousingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isOnCampus: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Property name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid ZIP code format";
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
      const response = await fetch("/api/housing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add housing");
      }

      // Redirect to the new housing page
      router.push(`/housing/${data.id}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link
          href="/housing"
          className="inline-flex items-center text-school-secondary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Housing
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-school-secondary/10 rounded-lg">
                <HomeIcon className="h-6 w-6 text-school-secondary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add New Housing</CardTitle>
                <CardDescription>
                  Add a property so students can review it
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {serverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Bluebird Apartments"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g., 2350 NW Kings Blvd"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g., Corvallis"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="e.g., OR"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={isLoading}
                    maxLength={2}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-medium">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  placeholder="e.g., 97330"
                  value={formData.zipCode}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.zipCode && (
                  <p className="text-sm text-red-600">{errors.zipCode}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOnCampus"
                  name="isOnCampus"
                  checked={formData.isOnCampus}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-school-secondary focus:ring-school-secondary"
                />
                <label htmlFor="isOnCampus" className="text-sm font-medium cursor-pointer">
                  This is on-campus housing
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-school-secondary hover:bg-school-secondary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Property...
                    </>
                  ) : (
                    "Add Property"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
