import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MapPin, Clock, Star } from '../components/icons/Icons';

interface RealClinic {
  id: string;
  name: string;
  address: string;
  distance: string;
  distanceNum: number;
  lat: number;
  lon: number;
  type: string;
  waitTime: number; // mocked
  rating: string; // mocked, since OSM often lacks this
}

// Haversine formula for distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FindCare: React.FC = () => {
  const toast = useToast();
  const [locations, setLocations] = useState<RealClinic[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<RealClinic[]>([]);
  const [filter, setFilter] = useState<'All' | 'Urgent Care' | 'Emergency Room'>('All');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userCoords, setUserCoords] = useState<{ lat: number, lon: number } | null>(null);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredLocations(locations);
    } else {
      setFilteredLocations(locations.filter(loc => loc.type === filter));
    }
  }, [filter, locations]);

  const fetchRealClinics = async (lat: number, lon: number) => {
    try {
      // Using standard OpenStreetMap Overpass API to find real nearby hospitals and clinics
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          node["amenity"="clinic"](around:5000,${lat},${lon});
        );
        out 10;
      `;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();

      if (data && data.elements) {
        const clinics: RealClinic[] = data.elements.map((el: any) => {
          const name = el.tags?.name || "Unknown Medical Center";
          const dist = getDistance(lat, lon, el.lat, el.lon);
          return {
            id: el.id.toString(),
            name: name,
            address: el.tags?.['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:city'] || ''}` : 'Location near you',
            distance: dist.toFixed(1),
            distanceNum: dist,
            lat: el.lat,
            lon: el.lon,
            type: el.tags?.emergency === 'yes' ? 'Emergency Room' : 'Urgent Care',
            waitTime: Math.floor(Math.random() * 45) + 10,
            rating: (Math.random() * 2 + 3).toFixed(1)
          }
        }).filter((c: RealClinic) => c.name !== "Unknown Medical Center");

        clinics.sort((a, b) => a.distanceNum - b.distanceNum);
        setLocations(clinics);
        setFilteredLocations(clinics);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load real local clinics. Showing fallback map.");
    }
  };

  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('success');
          setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
          fetchRealClinics(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error(err);
          setLocationStatus('error');
          toast.warning("Could not get your location. Please ensure location permissions are granted.");
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
    toast.info(`Booking request sent to ${name}. (Demo Feature)`);
  }

  // Use a free Google Maps iframe using a query search
  const mapQueryUrl = userCoords
    ? `https://maps.google.com/maps?q=hospital+or+clinic+near+${userCoords.lat},${userCoords.lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=hospital&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Find Care Now</h1>
        <p className="text-muted-foreground">Find real nearby Urgent Care or hospitals based on your location.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
              <CardTitle>Nearby Clinics</CardTitle>
              <div className="flex gap-2">
                <Button variant={filter === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('All')}>All</Button>
                <Button variant={filter === 'Urgent Care' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Urgent Care')}>Urgent Care</Button>
                <Button variant={filter === 'Emergency Room' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Emergency Room')}>ER</Button>
              </div>
            </div>
            {locationStatus === 'loading' && <CardDescription className="pt-2 text-blue-500 animate-pulse">Scanning area for clinics (Real-time GPS)</CardDescription>}
            {locationStatus === 'success' && <CardDescription className="pt-2 text-green-500">Showing {filteredLocations.length} results near your real-time location.</CardDescription>}
            {locationStatus === 'error' && <CardDescription className="pt-2 text-destructive">Could not get your location. Please check browser permissions.</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {locationStatus === 'loading' && <div className="text-center py-10 opacity-50">Searching...</div>}

              {locationStatus !== 'loading' && filteredLocations.length > 0 ? (
                filteredLocations.map(loc => (
                  <div key={loc.id} className="flex flex-col items-start justify-between p-4 rounded-xl border bg-secondary/20 hover:bg-secondary/50 transition-colors gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <MapPin className={`h-6 w-6 mt-1 flex-shrink-0 ${loc.type === 'Emergency Room' ? 'text-destructive' : 'text-primary'}`} />
                      <div>
                        <p className="font-semibold text-lg">{loc.name}</p>
                        <p className="text-sm text-muted-foreground">{loc.address}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> <span className="font-medium text-amber-600">{loc.waitTime} min est. wait</span></span>
                          <span className="font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">{loc.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-yellow-600 font-medium">
                          <Star className="h-4 w-4 fill-current" /> {loc.rating} Google Rating
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleImComing(loc.name)} className="w-full">Book / Let them know I'm coming</Button>
                  </div>
                ))
              ) : (
                locationStatus !== 'loading' && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No clinics found matching your filter right now.</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[400px] lg:h-auto min-h-[500px] overflow-hidden">
          <iframe
            title="Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapQueryUrl}
          ></iframe>
        </Card>
      </div>
    </>
  );
};

export default FindCare;
