"use client";

import { useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const canUploadMore = value.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Image Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canUploadMore && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Upload images of the property ({value.length}/{maxImages})
            </p>

            <UploadButton
              endpoint="reviewImageUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  const newUrls = res.map((file) => file.url);
                  onChange([...value, ...newUrls].slice(0, maxImages));
                  setIsUploading(false);
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Upload error: ${error.message}`);
                setIsUploading(false);
              }}
              onUploadBegin={() => {
                setIsUploading(true);
              }}
              appearance={{
                button:
                  "ut-ready:bg-school-secondary ut-ready:hover:bg-school-secondary/90 ut-uploading:bg-school-secondary/50 ut-uploading:cursor-not-allowed",
                allowedContent: "text-xs text-gray-500",
              }}
            />

            <p className="text-xs text-gray-500 mt-2">
              Max file size: 4MB. Accepted: JPEG, PNG, WebP
            </p>
          </div>
        </div>
      )}

      {!canUploadMore && (
        <p className="text-sm text-gray-600 text-center">
          Maximum of {maxImages} images reached
        </p>
      )}
    </div>
  );
}
