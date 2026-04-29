import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmergencyModal from './EmergencyModal';
import { useLocation } from 'react-router-dom';

export default function EmergencyFAB() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide on dashboard and emergency mode itself
  if (location.pathname.startsWith('/dashboard') || location.pathname === '/emergency-mode') {
    return null;
  }

  return (
    <>
      <EmergencyModal open={open} onOpenChange={setOpen} />
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full h-14 px-6 gap-3 text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/30 animate-bounce hover:animate-none group transition-all"
        >
          <AlertTriangle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-lg hidden sm:inline-block">Emergency</span>
        </Button>
      </div>
    </>
  );
}
