"use client";

import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { User, Lock, Bell, Globe, Trash2, Save, Badge } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "@/components/file-uploader";

// Profile settings schema
const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.string().length(0)),
  location: z.string().optional(),
});

// Notification settings schema
const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  newFollowers: z.boolean(),
  songComments: z.boolean(),
  songLikes: z.boolean(),
  newReleases: z.boolean(),
});

// Account preferences schema
const preferencesSchema = z.object({
  defaultVisibility: z.enum(["public", "private"]),
  allowComments: z.boolean(),
  autoplayRelated: z.boolean(),
  language: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update user profile mutation
  const updateProfile = useMutation(api.music.updateUser);

  // Fetch user profile
  const userProfile = useQuery(
    api.music.getUser,
    isLoaded && isSignedIn ? { userId: user?.id } : "skip"
  );

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.name || user?.fullName || "",
      bio: userProfile?.bio || "",
      profileImage: userProfile?.imageUrl || user?.imageUrl || "",
      website: userProfile?.website || "",
      location: userProfile?.location || "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      newFollowers: true,
      songComments: true,
      songLikes: true,
      newReleases: false,
    },
  });

  // Preferences form
  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      defaultVisibility: "public",
      allowComments: true,
      autoplayRelated: true,
      language: "en",
    },
  });

  // Handle profile update
  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!isSignedIn || !user) return;

    setIsSubmitting(true);

    try {
      await updateProfile({
        userId: user.id,
        name: values.displayName,
        imageUrl: values.profileImage || undefined,
        bio: values.bio || undefined,
        website: values.website || undefined,
        location: values.location || undefined,
        name: values.displayName,
        imageUrl: values.profileImage || undefined,
        // Other fields would be saved in a real implementation
      });

      setStatusMessage({
        type: "success",
        message: "Profile updated successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to update profile",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle notification settings update
  const onNotificationSubmit = async (values: NotificationFormValues) => {
    if (!isSignedIn || !user) return;

    setIsSubmitting(true);

    try {
      // In a real implementation, you would save these settings to your database
      console.log("Notification settings:", values);

      setStatusMessage({
        type: "success",
        message: "Notification settings updated successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to update notification settings:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to update notification settings",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle preferences update
  const onPreferencesSubmit = async (values: PreferencesFormValues) => {
    if (!isSignedIn || !user) return;

    setIsSubmitting(true);

    try {
      // In a real implementation, you would save these settings to your database
      console.log("Preferences:", values);

      setStatusMessage({
        type: "success",
        message: "Preferences updated successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to update preferences:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to update preferences",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real implementation, you would show a confirmation dialog and delete the user's account
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
      )
    ) {
      alert(
        "Account deletion is not implemented in this demo. In a real application, this would delete your account."
      );
    }
  };

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <>
      {/* Status message */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-md ${
            statusMessage.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {statusMessage.message}
        </div>
      )}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-[600px]">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account">
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Globe className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage how your profile appears to others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={profileForm.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <div className="h-20 w-20 rounded-full overflow-hidden bg-muted relative">
                                {field.value ? (
                                  <img
                                    src={field.value}
                                    alt="Profile preview"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full bg-muted">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <FileUploader
                                  endpoint="imageUploader"
                                  value={field.value}
                                  onChange={field.onChange}
                                  fileType="image"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a square image for best results. Maximum 8MB.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your display name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the name that will be displayed to other
                            users.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell others about yourself..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description that will appear on your
                            profile.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://yourwebsite.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your personal or artist website.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, Country" {...field} />
                            </FormControl>
                            <FormDescription>
                              Where you&apos;re based (optional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center"
                      >
                        {isSubmitting ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details and login information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email</h3>
                  <p className="text-muted-foreground mb-2">
                    Your email address is used for login and notifications
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <span className="font-medium">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                    <Badge className="ml-2 bg-green-500">Verified</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Password</h3>
                  <p className="text-muted-foreground mb-4">
                    Change your password or reset it if you&apos;ve forgotten it
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/user/settings/password")}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/reset-password")}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Connected Accounts
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Link your social media accounts to enable sharing and
                    cross-posting
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          f
                        </div>
                        <span>Facebook</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Connect
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white">
                          X
                        </div>
                        <span>Twitter</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Connect
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-orange-600 flex items-center justify-center text-white">
                          IG
                        </div>
                        <span>Instagram</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium text-red-600 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    These actions are permanent and cannot be undone
                  </p>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-md">
                      <div>
                        <h4 className="font-medium text-red-600">
                          Sign Out Everywhere
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Sign out from all devices where you&apos;re currently
                          logged in
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600"
                        onClick={() =>
                          alert("This would sign you out from all devices")
                        }
                      >
                        Sign Out Everywhere
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-md">
                      <div>
                        <h4 className="font-medium text-red-600">
                          Delete Account
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all your data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Control which notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form
                    onSubmit={notificationForm.handleSubmit(
                      onNotificationSubmit
                    )}
                    className="space-y-6"
                  >
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Email Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive important notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="newFollowers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              New Followers
                            </FormLabel>
                            <FormDescription>
                              Get notified when someone follows you
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="songComments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Song Comments
                            </FormLabel>
                            <FormDescription>
                              Get notified when someone comments on your songs
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="songLikes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Song Likes
                            </FormLabel>
                            <FormDescription>
                              Get notified when someone likes your songs
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="newReleases"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              New Releases
                            </FormLabel>
                            <FormDescription>
                              Get notified about new music from artists you
                              follow
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center"
                      >
                        {isSubmitting ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Customize your experience on 2kculture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...preferencesForm}>
                  <form
                    onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={preferencesForm.control}
                      name="defaultVisibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Song Visibility</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visibility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose whether new uploads are public or private by
                            default
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred language
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="allowComments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Allow Comments
                            </FormLabel>
                            <FormDescription>
                              Allow others to comment on your songs
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="autoplayRelated"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Autoplay Related
                            </FormLabel>
                            <FormDescription>
                              Automatically play related songs when the current
                              one ends
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center"
                      >
                        {isSubmitting ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
