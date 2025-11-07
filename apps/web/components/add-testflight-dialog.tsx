"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AddTestFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTestFlightDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTestFlightDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    buildNumber: "",
    testflightUrl: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/testflight/builds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: "",
          version: "",
          buildNumber: "",
          testflightUrl: "",
          notes: "",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add TestFlight build");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add TestFlight Build</CardTitle>
          <CardDescription>
            Add a new TestFlight build to monitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">App Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="My Awesome App"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={handleInputChange("version")}
                  placeholder="1.0.0"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildNumber">Build Number</Label>
                <Input
                  id="buildNumber"
                  value={formData.buildNumber}
                  onChange={handleInputChange("buildNumber")}
                  placeholder="123"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testflightUrl">TestFlight URL</Label>
              <Input
                id="testflightUrl"
                type="url"
                value={formData.testflightUrl}
                onChange={handleInputChange("testflightUrl")}
                placeholder="https://testflight.apple.com/join/..."
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange("notes")}
                placeholder="Additional notes about this build..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Build"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
