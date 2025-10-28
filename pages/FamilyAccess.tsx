
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Plus } from '../components/icons/Icons';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

const mockFamilyMembers = [
  { id: '1', name: 'Rohan Sharma', relationship: 'Son', photo: 'https://i.pravatar.cc/150?u=rohan-sharma' },
  { id: '2', name: 'Sunita Sharma', relationship: 'Spouse', photo: 'https://i.pravatar.cc/150?u=sunita-sharma' },
];

const FamilyAccess: React.FC = () => {
  const { user } = useAuth();
  const [inviteSent, setInviteSent] = useState(false);

  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 5000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Friends & Family Access</h1>
        <p className="text-muted-foreground">Manage care for your loved ones, all from one account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Connected Family Members</CardTitle>
            <CardDescription>You have access to manage these profiles.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockFamilyMembers.length > 0 ? (
              <div className="space-y-4">
                {mockFamilyMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.relationship}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>View Profile</Button>
                  </div>
                ))}
                 <p className="text-xs text-muted-foreground text-center pt-2">Profile switching is a demo feature. This view is for illustrative purposes.</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No family members connected yet.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invite a Family Member</CardTitle>
            <CardDescription>Send an invitation to a family member to manage their health records.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="invite-email" className="block text-sm font-medium text-foreground mb-1">Their Email Address</label>
                <Input id="invite-email" name="invite-email" type="email" placeholder="family.member@example.com" required />
              </div>
              <div>
                <label htmlFor="invite-relationship" className="block text-sm font-medium text-foreground mb-1">Your Relationship</label>
                <Input id="invite-relationship" name="invite-relationship" type="text" placeholder="e.g., Parent, Child, Spouse" required />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Send Invite
              </Button>
            </form>
            {inviteSent && (
              <p className="mt-4 text-sm text-center text-green-600 dark:text-green-400">
                Invitation sent successfully! They will receive an email with instructions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FamilyAccess;
