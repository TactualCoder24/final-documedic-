import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { HeartPulse, Pill, FileText, Share2 } from '../components/icons/Icons';

// Mock data fetching function. In a real app, this would be an API call.
const getEmergencyData = (id: string) => {
  // We'll return the same data regardless of ID for this mock.
  if (id) {
    return {
      name: 'Priya Sharma',
      dob: '1990-07-22',
      bloodType: 'O+',
      emergencyContacts: [
        { name: 'Rohan Sharma', relationship: 'Spouse', phone: '555-123-4567' },
        { name: 'Dr. Patel', relationship: 'Primary Care Physician', phone: '555-987-6543' },
      ],
      allergies: ['Penicillin'],
      conditions: ['Type 2 Diabetes'],
      medications: [
        { name: 'Metformin', dosage: '500mg Twice Daily' },
      ],
    };
  }
  return null;
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/60">
    <dt className="font-semibold text-muted-foreground">{label}</dt>
    <dd className="col-span-2 text-foreground font-medium">{value}</dd>
  </div>
);

const EmergencyInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const data = getEmergencyData(id || '');

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: `Emergency Info for ${data?.name}`,
            text: `View the emergency medical profile for ${data?.name}.`,
            url: window.location.href,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
        // Fallback for browsers that do not support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
    }
  };


  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background p-4">
        <h1 className="text-4xl font-bold text-destructive">Invalid Profile</h1>
        <p className="mt-4 text-lg text-muted-foreground">The emergency profile link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <HeartPulse className="h-12 w-12 text-destructive mx-auto mb-2" />
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-destructive">Emergency Medical Information</h1>
          <p className="text-muted-foreground mt-1">This information is provided for emergency use only.</p>
        </header>
        
        <div className="flex justify-end mb-4">
            <Button onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile
            </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{data.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <InfoRow label="Date of Birth" value={data.dob} />
              <InfoRow label="Blood Type" value={data.bloodType} />
              <InfoRow label="Emergency Contacts" value={
                <ul className="space-y-1">
                  {data.emergencyContacts.map(c => (
                    <li key={c.name}>{c.name} ({c.relationship}) - {c.phone}</li>
                  ))}
                </ul>
              } />
            </dl>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Key Information</CardTitle>
                </CardHeader>
                 <CardContent>
                    <h3 className="font-semibold text-lg mb-2">Allergies</h3>
                    <ul className="list-disc list-inside text-muted-foreground mb-4 bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                        {data.allergies.map(a => <li key={a} className="font-medium">{a}</li>)}
                    </ul>
                     <h3 className="font-semibold text-lg mb-2">Chronic Conditions</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {data.conditions.map(c => <li key={c}>{c}</li>)}
                    </ul>
                 </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary"/> Current Medications</CardTitle>
                </CardHeader>
                 <CardContent>
                    <ul className="space-y-3">
                       {data.medications.map(m => (
                         <li key={m.name}>
                           <p className="font-semibold">{m.name}</p>
                           <p className="text-sm text-muted-foreground">{m.dosage}</p>
                         </li>
                       ))}
                    </ul>
                 </CardContent>
            </Card>
        </div>
         <footer className="text-center mt-12 text-sm text-muted-foreground">
              <p>Information confirmed accurate as of {new Date().toLocaleDateString()}.</p>
              <p className="font-semibold mt-1">Powered by DocuMedic</p>
          </footer>
      </div>
    </div>
  );
};

export default EmergencyInfo;