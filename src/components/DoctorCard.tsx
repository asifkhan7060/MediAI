import { Doctor } from "@/lib/types";
import { Star, Clock, BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";

interface Props {
  doctor: Doctor;
  rank?: number;
}

export default function DoctorCard({ doctor, rank }: Props) {
  const { isOnline } = useSocket();
  const doctorOnline = isOnline(doctor.id || (doctor as any)._id || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl glass-card p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
    >
      {rank && (
        <div className="absolute right-4 top-4 gradient-primary rounded-xl px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
          #{rank}
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar with gradient ring */}
        <div className="relative shrink-0">
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
            {doctor.name.charAt(0)}
          </div>
          {/* Online dot — real-time */}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card transition-colors duration-300 ${doctorOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {doctor.name}
          </h3>
          <p className="text-sm text-primary font-medium">{doctor.specialization}</p>

          <div className="mt-2.5 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              {doctor.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {doctor.experience} yrs
            </span>
            <span className="flex items-center gap-1">
              <BadgeCheck className={`h-3.5 w-3.5 ${doctorOnline ? 'text-emerald-500' : 'text-muted-foreground/50'}`} />
              {doctorOnline ? "Online" : "Offline"}
            </span>
          </div>

          {doctor.bio && (
            <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">{doctor.bio}</p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{doctor.fee}</span>
            <Link to={`/book/${doctor.id}`}>
              <Button
                size="sm"
                className="gradient-primary border-0 text-primary-foreground btn-premium rounded-xl shadow-md gap-1.5"
              >
                Book Now
                <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
