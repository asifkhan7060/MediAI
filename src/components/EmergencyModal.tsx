import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmergencyModal({ open, onOpenChange }: EmergencyModalProps) {
  const navigate = useNavigate();

  const handleActivateEmergencyMode = () => {
    onOpenChange(false);
    navigate('/emergency-mode');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-red-500/20 shadow-red-500/10">
        <DialogHeader className="flex flex-col items-center pt-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold font-heading text-center">
            Are you in an emergency?
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Choose an option below to get immediate assistance.
          </p>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4 pt-6">
          <a href="tel:108" className="w-full">
            <Button className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 gap-3">
              <Phone className="h-5 w-5" />
              Call Now (108)
            </Button>
          </a>
          
          <Button 
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 gap-3"
            onClick={handleActivateEmergencyMode}
          >
            <AlertTriangle className="h-5 w-5" />
            Activate Emergency Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
