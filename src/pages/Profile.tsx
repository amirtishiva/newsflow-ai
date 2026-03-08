import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Save, Moon, Sun, Mail, Briefcase, MapPin, Link2, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Jane Reporter",
    title: "Senior Correspondent",
    email: "jane.reporter@newsflow.com",
    bio: "Award-winning journalist covering technology, politics, and global affairs. 12+ years of experience in investigative reporting.",
    location: "New York, NY",
    website: "https://janereporter.com",
    twitter: "@janereporter",
  });

  const [editForm, setEditForm] = useState(profile);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 5MB.", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast({ title: "Avatar updated", description: "Your profile picture has been changed." });
  };

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
    toast({ title: "Profile saved", description: "Your profile has been updated successfully." });
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Manage your account details and preferences
        </p>
      </div>

      {/* Avatar & Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 text-2xl">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={profile.name} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {profile.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-serif font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground font-body">{profile.title}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{profile.email}</p>
            </div>

            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => {
                if (isEditing) handleCancel();
                else { setEditForm(profile); setIsEditing(true); }
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dark Mode */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-body font-semibold">Appearance</CardTitle>
          <CardDescription className="font-body text-xs">Toggle between light and dark mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-warning" />}
              <span className="text-sm font-body text-foreground">{darkMode ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-body font-semibold">Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Full Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Title</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-body">Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-body">Bio</Label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Location</Label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Website</Label>
                  <Input
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-body">Twitter Handle</Label>
                <Input
                  value={editForm.twitter}
                  onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                />
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <ProfileField icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
              <ProfileField icon={<Briefcase className="h-4 w-4" />} label="Title" value={profile.title} />
              <ProfileField icon={<MapPin className="h-4 w-4" />} label="Location" value={profile.location} />
              <ProfileField icon={<Link2 className="h-4 w-4" />} label="Website" value={profile.website} />
              <ProfileField icon={<Twitter className="h-4 w-4" />} label="Twitter" value={profile.twitter} />
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1">Bio</p>
                <p className="text-sm text-foreground font-body">{profile.bio}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground font-body">{label}</p>
        <p className="text-sm text-foreground font-body">{value}</p>
      </div>
    </div>
  );
}
