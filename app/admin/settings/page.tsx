"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  CreditCard,
  Bell,
  Terminal,
  Info,
  AlertTriangle,
  CheckCircle,
  Undo,
  Save,
  Play,
  Upload
} from "lucide-react";

// Define form schema for platform settings
const platformSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  description: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  maxUploadSize: z.number().min(1, "Upload size must be at least 1MB"),
  enableUploads: z.boolean().default(true),
  enableComments: z.boolean().default(true),
  enableAnalytics: z.boolean().default(true),
  defaultPrivacy: z.enum(["public", "private"]),
  uploadFormats: z.array(z.string()),
  maintenanceMode: z.boolean().default(false),
});

// Define form schema for user settings
const userSettingsSchema = z.object({
  defaultUserRole: z.enum(["artist", "listener", "admin"]),
  allowAccountDeletion: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
  autoApproveArtists: z.boolean().default(false),
});

// Settings page for admin
export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("platform");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  
  // Initialize form with default values
  const platformForm = useForm<z.infer<typeof platformSettingsSchema>>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      siteName: "2KCulture",
      description: "Your music streaming platform",
      contactEmail: "admin@2kculture.com",
      maxUploadSize: 50,
      enableUploads: true,
      enableComments: true,
      enableAnalytics: true,
      defaultPrivacy: "private",
      uploadFormats: ["mp3", "wav", "ogg"],
      maintenanceMode: false,
    },
  });
  
  const userForm = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      defaultUserRole: "listener",
      allowAccountDeletion: true,
      requireEmailVerification: true,
      autoApproveArtists: false,
    },
  });
  
  // Handle form submissions
  const onPlatformSubmit = (values: z.infer<typeof platformSettingsSchema>) => {
    setSaveStatus("saving");
    
    // Simulate API call
    setTimeout(() => {
      console.log("Platform settings:", values);
      setSaveStatus("success");
      
      // Reset status after delay
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, 1000);
  };
  
  const onUserSubmit = (values: z.infer<typeof userSettingsSchema>) => {
    setSaveStatus("saving");
    
    // Simulate API call
    setTimeout(() => {
      console.log("User settings:", values);
      setSaveStatus("success");
      
      // Reset status after delay
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, 1000);
  };
  
  const resetForm = () => {
    if (activeTab === "platform") {
      platformForm.reset();
    } else {
      userForm.reset();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your platform and user settings
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platform">Platform Settings</TabsTrigger>
          <TabsTrigger value="users">User Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platform" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>
                Manage how your music platform functions and appears to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...platformForm}>
                <form onSubmit={platformForm.handleSubmit(onPlatformSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">General Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          {...platformForm.register("siteName")}
                        />
                        {platformForm.formState.errors.siteName && (
                          <p className="text-sm text-destructive">{platformForm.formState.errors.siteName.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          {...platformForm.register("contactEmail")}
                        />
                        {platformForm.formState.errors.contactEmail && (
                          <p className="text-sm text-destructive">{platformForm.formState.errors.contactEmail.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Site Description</Label>
                      <Textarea
                        id="description"
                        {...platformForm.register("description")}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Upload Settings</h3>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Uploads</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow users to upload new music to the platform
                          </p>
                        </div>
                        <Switch
                          checked={platformForm.watch("enableUploads")}
                          onCheckedChange={(checked) => platformForm.setValue("enableUploads", checked)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                          <Input
                            id="maxUploadSize"
                            type="number"
                            min="1"
                            {...platformForm.register("maxUploadSize", { valueAsNumber: true })}
                          />
                          {platformForm.formState.errors.maxUploadSize && (
                            <p className="text-sm text-destructive">{platformForm.formState.errors.maxUploadSize.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="defaultPrivacy">Default Privacy</Label>
                          <Select
                            value={platformForm.watch("defaultPrivacy")}
                            onValueChange={(value: "public" | "private") => platformForm.setValue("defaultPrivacy", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select default privacy" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Feature Toggles</h3>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Comments</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow users to comment on songs and albums
                          </p>
                        </div>
                        <Switch
                          checked={platformForm.watch("enableComments")}
                          onCheckedChange={(checked) => platformForm.setValue("enableComments", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Analytics</Label>
                          <p className="text-sm text-muted-foreground">
                            Track user interactions and song metrics
                          </p>
                        </div>
                        <Switch
                          checked={platformForm.watch("enableAnalytics")}
                          onCheckedChange={(checked) => platformForm.setValue("enableAnalytics", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Put the site in maintenance mode for updates
                          </p>
                        </div>
                        <Switch
                          checked={platformForm.watch("maintenanceMode")}
                          onCheckedChange={(checked) => platformForm.setValue("maintenanceMode", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <Undo className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button type="submit" disabled={saveStatus === "saving"}>
                      {saveStatus === "saving" ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {saveStatus === "success" && (
                    <Alert className="mt-4 bg-green-50 text-green-800 border-green-300">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>
                        Your settings have been saved successfully.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Configure user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">User Settings</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultUserRole">Default User Role</Label>
                      <Select
                        value={userForm.watch("defaultUserRole")}
                        onValueChange={(value: "listener" | "artist" | "admin") => userForm.setValue("defaultUserRole", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listener">Listener</SelectItem>
                          <SelectItem value="artist">Artist</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Approve Artists</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically approve artist role requests
                        </p>
                      </div>
                      <Switch
                        checked={userForm.watch("autoApproveArtists")}
                        onCheckedChange={(checked) => userForm.setValue("autoApproveArtists", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must verify email before using the platform
                        </p>
                      </div>
                      <Switch
                        checked={userForm.watch("requireEmailVerification")}
                        onCheckedChange={(checked) => userForm.setValue("requireEmailVerification", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Account Deletion</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to delete their accounts
                        </p>
                      </div>
                      <Switch
                        checked={userForm.watch("allowAccountDeletion")}
                        onCheckedChange={(checked) => userForm.setValue("allowAccountDeletion", checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <Undo className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button type="submit" disabled={saveStatus === "saving"}>
                      {saveStatus === "saving" ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {saveStatus === "success" && (
                    <Alert className="mt-4 bg-green-50 text-green-800 border-green-300">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>
                        Your settings have been saved successfully.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>
            <div className="flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              Advanced System Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Storage Cleanup</h4>
                      <p className="text-sm text-muted-foreground">Remove unused media files</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Run Cleanup
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Database Backup</h4>
                      <p className="text-sm text-muted-foreground">Backup all platform data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Start Backup
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Analytics Reset</h4>
                      <p className="text-sm text-muted-foreground">Reset all analytics data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Reset Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="system-info">
          <AccordionTrigger>
            <div className="flex items-center">
              <Info className="mr-2 h-4 w-4" />
              System Information
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">2.5.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Server Status</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Songs</span>
                    <span className="font-medium">1,245</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-medium">3,982</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span className="font-medium">12.8 GB / 50 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
}
