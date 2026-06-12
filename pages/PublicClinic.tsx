import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { Building2, MapPin, Phone, Globe, Stethoscope, ClipboardList, ExternalLink } from '../components/icons/Icons';
import { getClinicPublicProfile, ClinicPublicProfile } from '../services/dataSupabase';

const PublicClinic: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const [profile, setProfile] = useState<ClinicPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!clinicId) return;
      setLoading(true);
      try {
        const data = await getClinicPublicProfile(clinicId);
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="min-h-screen soft-aurora flex pt-20 justify-center">
        <Skeleton variant="dashboard" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background p-4">
        <h1 className="text-3xl font-bold text-destructive">Clinic not found</h1>
        <p className="mt-4 text-muted-foreground">This clinic page doesn't exist or the link is invalid.</p>
      </div>
    );
  }

  const { clinic, departments, doctors } = profile;

  return (
    <div className="min-h-screen soft-aurora p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 mx-auto mb-3 overflow-hidden">
            {clinic.logoUrl ? (
              <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-9 w-9" />
            )}
          </div>
          <h1 className="text-3xl font-bold font-heading">{clinic.name}</h1>
          {clinic.specialties && clinic.specialties.length > 0 && (
            <p className="text-muted-foreground mt-1">{clinic.specialties.join(' · ')}</p>
          )}
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Contact &amp; Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {clinic.address && (
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /> {clinic.address}</p>
            )}
            {clinic.phone && (
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /> {clinic.phone}</p>
            )}
            {clinic.email && (
              <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground shrink-0" /> {clinic.email}</p>
            )}
            {!clinic.address && !clinic.phone && !clinic.email && (
              <p className="text-muted-foreground">No contact details provided yet.</p>
            )}
          </CardContent>
        </Card>

        {departments.length > 0 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {departments.map(d => (
                  <span key={d.id} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-foreground">
                    {d.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" /> Our Doctors</CardTitle>
            <CardDescription>Click a doctor to view their availability and book an appointment.</CardDescription>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No doctors listed yet.</p>
            ) : (
              <div className="space-y-2">
                {doctors.map(doc => (
                  <Link
                    key={doc.id}
                    to={`/book/${doc.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-emerald-400 hover:bg-emerald-500/5 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">Dr. {doc.name}</p>
                      {doc.specialty && <p className="text-xs text-muted-foreground">{doc.specialty}</p>}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicClinic;
