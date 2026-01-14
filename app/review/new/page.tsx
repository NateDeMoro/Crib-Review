"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WriteReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Housing info
    housingName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isOnCampus: false,

    // Ratings (1-10)
    overallRating: 5,
    locationRating: 5,
    valueRating: 5,
    maintenanceRating: 5,
    managementRating: 5,
    amenitiesRating: 5,

    // Review text
    title: "",
    description: "",

    // Additional details
    monthlyRent: "",
    utilitiesIncluded: false,
    isFurnished: false,
    petsAllowed: false,

    // Privacy
    isAnonymous: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Housing validation
    if (!formData.housingName.trim()) {
      newErrors.housingName = "Property name is required";
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

    // Review validation
    if (!formData.description.trim()) {
      newErrors.description = "Please write a review";
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "Review must be at least 50 characters";
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
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          housing: {
            name: formData.housingName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            isOnCampus: formData.isOnCampus,
          },
          review: {
            overallRating: formData.overallRating,
            locationRating: formData.locationRating,
            valueRating: formData.valueRating,
            maintenanceRating: formData.maintenanceRating,
            managementRating: formData.managementRating,
            amenitiesRating: formData.amenitiesRating,
            title: formData.title || null,
            description: formData.description,
            monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : null,
            utilitiesIncluded: formData.utilitiesIncluded,
            isFurnished: formData.isFurnished,
            petsAllowed: formData.petsAllowed,
            isAnonymous: formData.isAnonymous,
            images: [], // TODO: Add image upload later
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Redirect to housing page
      router.push(`/housing/${data.housingId}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleRatingChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const RatingInput = ({ label, field }: { label: string; field: string }) => {
    const value = formData[field as keyof typeof formData] as number;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-sm font-bold text-school-secondary">{value}/10</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleRatingChange(field, num)}
              className={`flex-1 h-10 text-xs font-medium rounded transition-colors ${
                num <= value
                  ? "bg-school-secondary text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-600"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/housing"
          className="inline-flex items-center text-school-secondary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Housing
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Write a Review</CardTitle>
            <CardDescription>
              Share your honest experience to help other students
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              {serverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              )}

              {/* Section 1: Property Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Property Information</h3>

                <div className="space-y-2">
                  <label htmlFor="housingName" className="text-sm font-medium">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="housingName"
                    name="housingName"
                    type="text"
                    placeholder="e.g., Bluebird Apartments"
                    value={formData.housingName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.housingName && (
                    <p className="text-sm text-red-600">{errors.housingName}</p>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Corvallis"
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
                      placeholder="OR"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isLoading}
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium">
                      ZIP <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      placeholder="97330"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
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
              </div>

              {/* Section 2: Ratings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Rate Your Experience</h3>

                <RatingInput label="Overall Rating" field="overallRating" />
                <RatingInput label="Location" field="locationRating" />
                <RatingInput label="Value for Money" field="valueRating" />
                <RatingInput label="Maintenance" field="maintenanceRating" />
                <RatingInput label="Management" field="managementRating" />
                <RatingInput label="Amenities" field="amenitiesRating" />
              </div>

              {/* Section 3: Written Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Your Review</h3>

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Review Title (Optional)
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g., Great place for students!"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    placeholder="Share your experience living here... (minimum 50 characters)"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-secondary"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length} characters
                  </p>
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Section 4: Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Details</h3>

                <div className="space-y-2">
                  <label htmlFor="monthlyRent" className="text-sm font-medium">
                    Monthly Rent (Optional)
                  </label>
                  <Input
                    id="monthlyRent"
                    name="monthlyRent"
                    type="number"
                    placeholder="850"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Helps other students budget
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="utilitiesIncluded"
                      name="utilitiesIncluded"
                      checked={formData.utilitiesIncluded}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-school-secondary focus:ring-school-secondary"
                    />
                    <label htmlFor="utilitiesIncluded" className="text-sm cursor-pointer">
                      Utilities included in rent
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFurnished"
                      name="isFurnished"
                      checked={formData.isFurnished}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-school-secondary focus:ring-school-secondary"
                    />
                    <label htmlFor="isFurnished" className="text-sm cursor-pointer">
                      Furnished
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="petsAllowed"
                      name="petsAllowed"
                      checked={formData.petsAllowed}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-school-secondary focus:ring-school-secondary"
                    />
                    <label htmlFor="petsAllowed" className="text-sm cursor-pointer">
                      Pets allowed
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 5: Privacy */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Privacy</h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-school-secondary focus:ring-school-secondary"
                  />
                  <label htmlFor="isAnonymous" className="text-sm cursor-pointer">
                    Post anonymously (your name won't be shown)
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-school-secondary hover:bg-school-secondary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    "Submit Review"
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
