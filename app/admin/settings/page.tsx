"use client";

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••");

  const handleSaveProfile = () => {
    toast.success("Profile settings saved");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated");
  };

  const handleSaveContentSettings = () => {
    toast.success("Content settings saved");
  };

  const handleGenerateApiKey = () => {
    // In a real app, this would call an API to generate a new key
    setApiKey("2kc_" + Math.random().toString(36).substring(2, 15));
    toast.success("New API key generated");
  };

  return (
    <AdminDashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Advanced Settings
          </h2>
          <p className="text-muted-foreground">
            Configure your account and content preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account settings and profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  defaultValue={user?.fullName || ""}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  placeholder="Your email"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  To change your email address, please update it in your Clerk
                  account.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Artist Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  className="min-h-32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://yourwebsite.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="notifications"
                  className="flex flex-col space-y-1"
                >
                  <span>Enable Notifications</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Receive notifications about your content performance
                  </span>
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="email-notifications"
                  className="flex flex-col space-y-1"
                >
                  <span>Email Notifications</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Receive updates via email
                  </span>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Notification Types</Label>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="likes"
                      defaultChecked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="likes" className="font-normal">
                      Likes and comments
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="plays"
                      defaultChecked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="plays" className="font-normal">
                      Play count milestones
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="features"
                      defaultChecked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="features" className="font-normal">
                      New features and updates
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>
                Manage how your content is displayed and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="auto-publish"
                  className="flex flex-col space-y-1"
                >
                  <span>Auto-Publish</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Automatically publish songs when uploaded
                  </span>
                </Label>
                <Switch
                  id="auto-publish"
                  checked={autoPublish}
                  onCheckedChange={setAutoPublish}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="enable-downloads"
                  className="flex flex-col space-y-1"
                >
                  <span>Enable Downloads</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Allow users to download your music
                  </span>
                </Label>
                <Switch
                  id="enable-downloads"
                  checked={downloadEnabled}
                  onCheckedChange={setDownloadEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-genres">Default Genres</Label>
                <Input id="default-genres" placeholder="Hip Hop, R&B, Soul" />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of genres to pre-fill when uploading new
                  songs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Notice</Label>
                <Textarea
                  id="copyright"
                  placeholder="© 2025 Your Name. All rights reserved."
                />
                <p className="text-sm text-muted-foreground">
                  This will be displayed on all your song pages
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveContentSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage your API keys for integrating with external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Your API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={handleGenerateApiKey}>
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this key to access your content via the 2KCulture API.
                  Keep this secret!
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>API Documentation</Label>
                <p className="text-sm text-muted-foreground">
                  Access our API documentation to learn how to integrate with
                  2KCulture
                </p>
                <Button variant="outline" className="mt-2">
                  View Documentation
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Rate Limits</Label>
                <p className="text-sm">
                  <strong>Current Plan:</strong> Standard
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 1,000 requests per day</li>
                  <li>• 100 requests per minute</li>
                  <li>• Unlimited song uploads</li>
                </ul>
                <Button variant="link" className="px-0 h-auto">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}
