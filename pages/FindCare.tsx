
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MapPin, Clock } from '../components/icons/Icons';
import { CareLocation } from '../types';
import { getCareLocations } from '../services/dataSupabase';

const FindCare: React.FC = () => {
  const [locations, setLocations] = useState<CareLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<CareLocation[]>([]);
  const [filter, setFilter] = useState<'All' | 'Urgent Care' | 'Emergency Room'>('All');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchLocations = async () => {
        const data = await getCareLocations();
        setLocations(data);
        setFilteredLocations(data);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (filter === 'All') {
        setFilteredLocations(locations);
    } else {
        setFilteredLocations(locations.filter(loc => loc.type === filter));
    }
  }, [filter, locations]);

  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleImComing = (name: string) => {
      alert(`Thanks! We've let ${name} know you're on your way. This is a demo feature.`);
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Find Care Now</h1>
        <p className="text-muted-foreground">Find nearby Urgent Care or Emergency Departments.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle>Nearby Clinics</CardTitle>
            <div className="flex gap-2">
                <Button variant={filter === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('All')}>All</Button>
                <Button variant={filter === 'Urgent Care' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Urgent Care')}>Urgent Care</Button>
                <Button variant={filter === 'Emergency Room' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Emergency Room')}>Emergency Room</Button>
            </div>
          </div>
          {locationStatus === 'loading' && <CardDescription className="pt-2 text-blue-500">Using your location to find nearby clinics...</CardDescription>}
          {locationStatus === 'success' && <CardDescription className="pt-2 text-green-500">Showing clinics near you.</CardDescription>}
          {locationStatus === 'error' && <CardDescription className="pt-2 text-destructive">Could not get your location. Showing default list.</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLocations.length > 0 ? (
                filteredLocations.map(loc => (
                <div key={loc.id} className="flex flex-col sm:flex-row items-start justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                        <MapPin className={`h-6 w-6 mt-1 flex-shrink-0 ${loc.type === 'Emergency Room' ? 'text-destructive' : 'text-primary'}`} />
                        <div>
                            <p className="font-semibold">{loc.name}</p>
                            <p className="text-sm text-muted-foreground">{loc.address}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> Est. Wait: <span className="font-bold">{loc.waitTime} min</span></span>
                                <span className="font-bold">{loc.distance} km away</span>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => handleImComing(loc.name)} className="mt-4 sm:mt-0 w-full sm:w-auto">Let them know I'm coming</Button>
                </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No clinics found matching your filter.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FindCare;
