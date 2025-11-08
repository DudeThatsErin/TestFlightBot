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
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Add TestFlight Build</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Add a new TestFlight build to monitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">App Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="My Awesome App"
                required
                disabled={isLoading}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="testflightUrl" className="text-slate-700 dark:text-slate-300">TestFlight URL</Label>
              <Input
                id="testflightUrl"
                type="url"
                value={formData.testflightUrl}
                onChange={handleInputChange("testflightUrl")}
                placeholder="https://testflight.apple.com/join/..."
                required
                disabled={isLoading}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300">Notes (Optional)</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange("notes")}
                placeholder="Additional notes about this build..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</div>
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
              <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white">
                {isLoading ? "Adding & Checking Status..." : "Add Build"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
