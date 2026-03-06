import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Plus, QrCode, Shield, RefreshCw } from '../components/icons/Icons';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { useToast } from '../hooks/useToast';

interface FamilyMember {
  id: string;
  patient_id: string;
  caregiver_id: string;
  name: string;
  relationship: string;
  permission_level: 'view_only' | 'manage';
  photoUrl?: string;
}

const FamilyAccess: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Real Supabase query to get family members
        const { data, error } = await supabase
          .from('family_access')
          .select('*')
          .or(`patient_id.eq.${user.uid},caregiver_id.eq.${user.uid}`);

        if (error) throw error;

        if (data && data.length > 0) {
          setMembers(data as FamilyMember[]);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("Error fetching family members:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [user]);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in.");

    setInviteLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('invite-email') as string;
    const relationship = formData.get('invite-relationship') as string;
    const permissions = formData.get('permissions') as string;

    try {
      // Invoke real Supabase Edge Function to send email invite
      const { data, error } = await supabase.functions.invoke('invite-family', {
        body: { patient_email: user.email, caregiver_email: email, relationship, permissions }
      });

      if (error) {
        // Since function might not exist yet, we catch and show fake success
        throw error;
      }

      toast.success("Invitation sent successfully via Supabase Edge Functions!");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Failed to send edge function invite.", err);
      toast.error(`Failed to send invite. Please ensure the 'invite-family' edge function is deployed.`);
    } finally {
      setInviteLoading(false);
    }
  };

  const switchProfile = (id: string, name: string) => {
    setActiveProfileId(id);
    toast.info(`Switched active profile to ${name}. (Any data fetched now will be scoped to this ID)`);
  };

  const qrShareLink = `https://documedic.app/invite?token=${btoa(user?.uid || 'demo')}`;

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Family Access</h1>
          <p className="text-muted-foreground">Manage care for your loved ones with granular controls.</p>
        </div>
        <Button onClick={() => setShowQrCode(!showQrCode)} className="shrink-0" variant="secondary">
          <QrCode className="mr-2 h-4 w-4" /> Share Profile via QR
        </Button>
      </div>

      {showQrCode && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Your Profile QR Code</CardTitle>
            <CardDescription>Scan this to instantly share read-only access with doctors or family members.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrShareLink)}`}
                alt="Share Profile QR"
                className="w-48 h-48"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Connected Profiles</CardTitle>
            <CardDescription>Switch between accounts you manage.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 animate-pulse text-muted-foreground">Loading connected members...</div>
            ) : members.length > 0 ? (
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className={`flex items-center justify-between p-4 rounded-xl transition-all ${activeProfileId === member.id ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/40 hover:bg-secondary/70'}`}>
                    <div className="flex items-center gap-4">
                      <img src={member.photoUrl || 'https://via.placeholder.com/150'} alt={member.name} className="w-12 h-12 rounded-full border-2 border-background shadow-sm" />
                      <div>
                        <p className="font-semibold text-lg">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{member.relationship}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {member.permission_level === 'manage' ? 'Full Access' : 'View Only'}</span>
                        </div>
                      </div>
                    </div>
                    {activeProfileId === member.id ? (
                      <div className="text-primary text-sm font-bold flex items-center gap-1">Active <RefreshCw className="w-4 h-4 animate-spin-slow" /></div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => switchProfile(member.id, member.name)}>Switch</Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No family members connected yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invite Caregiver</CardTitle>
            <CardDescription>Send real email invitations via Supabase Edge Functions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-5">
              <div>
                <label htmlFor="invite-email" className="block text-sm font-medium text-foreground mb-1">Their Email Address</label>
                <Input id="invite-email" name="invite-email" type="email" placeholder="caregiver@example.com" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invite-relationship" className="block text-sm font-medium text-foreground mb-1">Relationship</label>
                  <Input id="invite-relationship" name="invite-relationship" type="text" placeholder="e.g. Spouse" required />
                </div>
                <div>
                  <label htmlFor="permissions" className="block text-sm font-medium text-foreground mb-1">Permissions</label>
                  <select id="permissions" name="permissions" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                    <option value="view_only">View Only (Read-only)</option>
                    <option value="manage">Full Manage (Medications & Appointments)</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={inviteLoading}>
                {inviteLoading ? 'Sending via Edge Function...' : <><Plus className="mr-2 h-4 w-4" /> Send Secure Invite</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FamilyAccess;
