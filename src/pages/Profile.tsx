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
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 5MB.", variant: "destructive" });
      return;
    }
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    updateProfile.mutate({ avatar_url: urlData.publicUrl });
    toast({ title: "Avatar updated" });
  };

  const handleSave = () => {
    updateProfile.mutate({
      full_name: editForm.full_name ?? profile?.full_name,
      display_name: editForm.display_name ?? profile?.display_name,
      title: editForm.title ?? profile?.title,
      bio: editForm.bio ?? profile?.bio,
      location: editForm.location ?? profile?.location,
      website: editForm.website ?? profile?.website,
      twitter_handle: editForm.twitter ?? profile?.twitter_handle,
    });
    setIsEditing(false);
  };

  if (isLoading) return <div className="max-w-3xl mx-auto space-y-6">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;

  const p = profile;
  const initials = (p?.display_name || p?.full_name || "??").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Manage your account details and preferences</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 text-2xl">
                {p?.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-serif font-bold text-foreground">{p?.display_name || p?.full_name}</h2>
              <p className="text-sm text-muted-foreground font-body">{p?.title}</p>
            </div>
            <Button variant={isEditing ? "outline" : "default"} onClick={() => {
              if (isEditing) { setIsEditing(false); }
              else {
                setEditForm({
                  full_name: p?.full_name || "",
                  display_name: p?.display_name || "",
                  title: p?.title || "",
                  bio: p?.bio || "",
                  location: p?.location || "",
                  website: p?.website || "",
                  twitter: p?.twitter_handle || "",
                });
                setIsEditing(true);
              }
            }}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-body font-semibold">Appearance</CardTitle>
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

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-body font-semibold">Profile Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Full Name</Label>
                  <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Display Name</Label>
                  <Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-body">Title</Label>
                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-body">Bio</Label>
                <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Location</Label>
                  <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-body">Website</Label>
                  <Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-body">Twitter Handle</Label>
                <Input value={editForm.twitter} onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })} />
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save Changes</Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <ProfileField icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email ?? ""} />
              <ProfileField icon={<Briefcase className="h-4 w-4" />} label="Title" value={p?.title ?? ""} />
              <ProfileField icon={<MapPin className="h-4 w-4" />} label="Location" value={p?.location ?? ""} />
              <ProfileField icon={<Link2 className="h-4 w-4" />} label="Website" value={p?.website ?? ""} />
              <ProfileField icon={<Twitter className="h-4 w-4" />} label="Twitter" value={p?.twitter_handle ?? ""} />
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1">Bio</p>
                <p className="text-sm text-foreground font-body">{p?.bio || "No bio set."}</p>
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
        <p className="text-sm text-foreground font-body">{value || "—"}</p>
      </div>
    </div>
  );
}
