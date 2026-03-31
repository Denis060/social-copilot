"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Social-Copilot</CardTitle>
          <CardDescription>Let&apos;s finish setting up your profile before we get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={completeOnboarding} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Photo</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Display Name</Label>
              <Input id="fullName" name="fullName" placeholder="Jane Doe" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">Primary Use Case</Label>
              <Select name="useCase" required defaultValue="creator">
                <SelectTrigger>
                  <SelectValue placeholder="Select a use case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
