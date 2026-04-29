import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Stethoscope, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { doctorsAPI } from "@/lib/api";
import DoctorCard from "@/components/DoctorCard";
import { specializations } from "@/lib/diseaseMapping";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  available: boolean;
  avatar_url?: string;
  avatar?: string;
  fee: number;
  bio: string;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const { data } = await doctorsAPI.getAll({ limit: 100 });
      const mapped = (data.data || []).map((d: any) => ({
        id: d.id || d._id,
        name: d.name,
        specialization: d.specialization,
        experience: d.experience,
        rating: d.rating,
        available: d.available,
        avatar_url: d.avatar || '',
        fee: d.fee,
        bio: d.bio,
      }));
      setDoctors(mapped);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || d.specialization === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="container relative mx-auto max-w-6xl px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-5 flex items-center justify-center rounded-2xl gradient-primary p-4 shadow-lg"
              style={{ width: 72, height: 72 }}
            >
              <Stethoscope className="h-9 w-9 text-primary-foreground" />
            </motion.div>
            <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
              Find a <span className="gradient-text">Doctor</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground leading-relaxed">
              Browse our qualified medical professionals and book appointments instantly
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card rounded-2xl p-5 mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  className="h-12 pl-12 rounded-xl border-border/40 bg-background/50 focus:border-primary/40 focus:ring-primary/20 transition-all"
                  placeholder="Search doctors by name or specialization..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 relative">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none rounded-l-xl" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none rounded-r-xl" />
              {/* Scrollable row */}
              <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {["All", ...specializations.slice(0, 8)].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-300 ${
                      filter === s
                        ? "gradient-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</span>
            </div>
          )}

          {/* Doctor Grid */}
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl glass-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="glass-card inline-block rounded-2xl p-8">
                <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No doctors found</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DoctorCard doctor={d} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
