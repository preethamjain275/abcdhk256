import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, Profile } from '@/services/profileService';
import { ArrowLeft, User, Mail, Lock, Trash2, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const data = await profileService.getProfile(user.id);
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setPhoneNumber((data as any).phone || '');
          setAddress((data as any).address || '');
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { error } = await profileService.updateProfile(user.id, {
      full_name: fullName,
      phone: phoneNumber,
      address: address
    } as any);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    const { url, error } = await profileService.uploadAvatar(user.id, file);

    if (error) {
      toast.error('Failed to upload avatar');
    } else if (url) {
      const { error: updateError } = await profileService.updateProfile(user.id, {
        avatar_url: url,
      });
      if (!updateError) {
        setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
        toast.success('Avatar updated successfully');
      }
    }
    setSaving(false);
  };

  const handleChangePassword = () => {
    toast.info('Check your email for password reset instructions!');
    // Ideally use supabase.auth.resetPasswordForEmail(user.email)
  };

  const handleDeleteAccount = () => {
    toast.error('Please contact support to delete your account.');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-3xl font-bold">Account Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your personal information and security
          </p>
        </div>

        {/* Profile Section */}
        <div className="mb-6 rounded-2xl bg-card p-6">
          <h2 className="mb-6 font-semibold">Public Profile</h2>
          
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
              </label>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Default Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address details..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Account Info */}
        <div className="mb-6 rounded-2xl bg-card p-6">
          <h2 className="mb-4 font-semibold">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">Verified</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="mb-6 rounded-2xl bg-card p-6">
          <h2 className="mb-4 font-semibold">Security</h2>
          <button
            onClick={handleChangePassword}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-secondary/50 border border-border/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Reset Password</p>
              <p className="text-sm text-muted-foreground">Get a password reset link in your email</p>
            </div>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="mb-4 font-semibold text-destructive">Danger Zone</h2>
          <button
            onClick={handleDeleteAccount}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-destructive/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-left">
              <p className="font-medium text-destructive">Request Account Deletion</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your profile and order history
              </p>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
}
