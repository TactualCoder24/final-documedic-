import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { HeartPulse, Pill, FileText, Share2 } from '../components/icons/Icons';
import { getFullUserData } from '../services/dataSupabase';
import { Medication } from '../types';

interface EmergencyData {
  name: string;
  dob: string;
  bloodType: string;
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  allergies: string[];
  conditions: string[];
  medications: { name: string; dosage: string }[];
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/60">
    <dt className="font-semibold text-muted-foreground">{label}</dt>
    <dd className="col-span-2 text-foreground font-medium">{value}</dd>
  </div>
);

const EmergencyInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null); // Use any for simplicity as it combines multiple types
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
        if (id) {
            const userData = await getFullUserData(id);
            if (userData && userData.profile && userData.profile.age) {
                setData(userData);
            }
        }
        setLoading(false);
    };

    fetchUserData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: `Emergency Info`,
            text: `View the emergency medical profile.`,
            url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background p-4">
        <h1 className="text-4xl font-bold text-destructive">Invalid or Incomplete Profile</h1>
        <p className="mt-4 text-lg text-muted-foreground">The emergency profile link is invalid or the user has not completed their profile.</p>
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
            <CardTitle className="text-2xl">Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <InfoRow label="Age" value={data.profile.age || 'N/A'} />
              <InfoRow label="Blood Type" value={data.profile.bloodType || 'N/A'} />
              <InfoRow label="Target Blood Sugar" value={data.profile.targetBloodSugar ? `${data.profile.targetBloodSugar} mg/dL` : 'N/A'} />
              <InfoRow label="Emergency Contact" value={
                data.profile.emergencyContactName ? 
                `${data.profile.emergencyContactName} - ${data.profile.emergencyContactPhone}` : 'N/A'
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
                    <h3 className="font-semibold text-lg mb-2">Chronic Conditions</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {data.profile.conditions ? data.profile.conditions.split(',').map((c:string) => <li key={c}>{c.trim()}</li>) : <li>None specified</li>}
                    </ul>
                 </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary"/> Current Medications</CardTitle>
                </CardHeader>
                 <CardContent>
                    {data.medications.length > 0 ? (
                        <ul className="space-y-3">
                        {data.medications.map((m: Medication) => (
                            <li key={m.id}>
                            <p className="font-semibold">{m.name}</p>
                            <p className="text-sm text-muted-foreground">{m.dosage} - {m.frequency}</p>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No medications listed.</p>
                    )}
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