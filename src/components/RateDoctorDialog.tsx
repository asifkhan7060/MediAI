import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface RateDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  doctorName: string;
  onSuccess: () => void;
}

export default function RateDoctorDialog({
  open,
  onOpenChange,
  appointmentId,
  doctorName,
  onSuccess,
}: RateDoctorDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await reviewsAPI.add({
        appointmentId,
        rating,
        comment,
      });
      toast({ title: "Thank you for your feedback!" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
      if (error.response?.status === 400) {
        // Close if already reviewed
        onSuccess();
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Rate your visit</DialogTitle>
          <DialogDescription>
            How was your appointment with {doctorName}?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Share details of your experience (optional)..."
            className="mt-4"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0} className="gradient-primary border-0 text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
