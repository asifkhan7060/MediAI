import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Copy, Hospital, ArrowLeft, Siren, ShieldAlert, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function EmergencyMode() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      (error) => {
        toast.error('Unable to retrieve your location. Please ensure location services are enabled.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const googleMapsLink = location 
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}` 
    : '';

  const emergencyMessage = location 
    ? `I am in an emergency and need immediate assistance! My location: ${googleMapsLink}`
    : `I am in an emergency and need immediate assistance! (Location not available)`;

  const copyEmergencyMessage = () => {
    navigator.clipboard.writeText(emergencyMessage);
    toast.success('Emergency message with location copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-red-600 text-white flex flex-col p-4 sm:p-8 selection:bg-red-900 overflow-hidden relative">
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[150vw] h-[150vw] sm:w-[100vw] sm:h-[100vw] bg-red-500 rounded-full animate-ping blur-3xl" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Exit Emergency
          </Button>
          <div className="flex items-center gap-2 font-bold opacity-80">
            MediAI <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
          
          <div className="text-center space-y-4">
            <Siren className="h-20 w-20 mx-auto text-white animate-pulse" />
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">EMERGENCY MODE</h1>
            <p className="text-red-200 text-lg sm:text-xl font-medium max-w-md mx-auto">
              Follow instructions below to get immediate help. Stay calm.
            </p>
          </div>

          <div className="w-full space-y-4">
            {/* Call Ambulance Action */}
            <a href="tel:108" className="block w-full">
              <div className="w-full bg-white text-red-600 rounded-2xl p-6 sm:p-8 flex items-center justify-between shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                  <Phone className="h-10 w-10 sm:h-12 sm:w-12" />
                  <div className="text-left">
                    <h2 className="text-2xl sm:text-3xl font-black">Call Ambulance</h2>
                    <p className="text-red-600/70 font-semibold">Dial 108 immediately</p>
                  </div>
                </div>
              </div>
            </a>

            {/* Find Nearby Hospitals */}
            <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noreferrer" className="block w-full">
              <div className="w-full bg-red-700/50 hover:bg-red-700 backdrop-blur-md text-white rounded-2xl p-6 flex items-center justify-between border border-red-500/50 transition-colors shadow-lg">
                <div className="flex items-center gap-4">
                  <Hospital className="h-8 w-8" />
                  <div className="text-left">
                    <h2 className="text-xl font-bold">Find Nearby Hospitals</h2>
                    <p className="text-red-200 text-sm">Open in Google Maps</p>
                  </div>
                </div>
                <Navigation className="h-6 w-6 opacity-70" />
              </div>
            </a>

            {/* Share Location */}
            <div className="w-full bg-red-800/60 backdrop-blur-md rounded-2xl p-6 border border-red-500/30 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <MapPin className="h-7 w-7 mt-1 text-red-300" />
                  <div>
                    <h3 className="text-lg font-bold">My Location</h3>
                    <div className="text-red-200 mt-1 min-h-[1.5rem]">
                      {locating ? (
                        <p className="animate-pulse flex items-center gap-2">Locating you...</p>
                      ) : location ? (
                        <p className="uppercase font-mono text-sm tracking-wider">
                          LAT: {location.lat.toFixed(4)} <br/> LNG: {location.lng.toFixed(4)}
                        </p>
                      ) : (
                        <p>Location not found</p>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={copyEmergencyMessage} 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Copy className="h-4 w-4 mr-2" /> Share Details
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* Safety Instructions */}
        <div className="mt-8 pt-6 border-t border-red-500/30">
          <div className="flex gap-3 text-red-200 items-start bg-red-800/30 p-4 rounded-xl">
            <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">Safety Instructions</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Stay completely calm and take deep breaths.</li>
                <li>Ensure you are in a safe environment away from further harm.</li>
                <li>Do not move anyone who is severely injured unless absolutely necessary.</li>
                <li>Wait for professional medical responders.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
