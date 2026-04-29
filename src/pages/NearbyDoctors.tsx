import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Navigation, Phone, ExternalLink, Building2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  address?: string;
  distance: number; // in METERS (not km)
  type?: string;
  openingHours?: string;
}

// Haversine → meters
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Format: < 1 km → "800 m", ≥ 1 km → "2.3 km"
function formatDist(meters: number, prefix = ""): string {
  if (meters < 1000) return `${prefix}${meters} m`;
  return `${prefix}${(meters / 1000).toFixed(1)} km`;
}

// ─── Google Maps SDK loader ──────────────────────────────────────────
const GMAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || "";
let gmapsReady = false;

function loadGoogleSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gmapsReady || (window as any).google?.maps?.DistanceMatrixService) {
      gmapsReady = true;
      return resolve();
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}`;
    s.async = true;
    s.onload = () => { gmapsReady = true; resolve(); };
    s.onerror = () => reject(new Error("Google Maps SDK failed"));
    document.head.appendChild(s);
  });
}

// ─── Distance providers ──────────────────────────────────────────────
type DistSource = "google" | "osrm" | "haversine";

async function googleDistances(oLat: number, oLng: number, list: Hospital[]): Promise<Hospital[]> {
  await loadGoogleSDK();
  const g = (window as any).google.maps;
  const svc = new g.DistanceMatrixService();
  const out = [...list];
  const B = 25; // Google batch limit

  for (let i = 0; i < out.length; i += B) {
    const batch = out.slice(i, i + B);
    const dests = batch.map((h: Hospital) => new g.LatLng(h.lat, h.lng));
    const res: any = await new Promise((ok, fail) =>
      svc.getDistanceMatrix(
        { origins: [new g.LatLng(oLat, oLng)], destinations: dests, travelMode: g.TravelMode.DRIVING },
        (r: any, s: string) => (s === "OK" && r ? ok(r) : fail(s))
      )
    );
    res.rows[0].elements.forEach((el: any, j: number) => {
      if (el.status === "OK") out[i + j] = { ...out[i + j], distance: el.distance.value };
    });
  }
  return out.sort((a, b) => a.distance - b.distance);
}

async function osrmDistances(oLat: number, oLng: number, list: Hospital[]): Promise<Hospital[]> {
  const coords = [`${oLng},${oLat}`, ...list.map((h) => `${h.lng},${h.lat}`)].join(";");
  const res = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance`);
  if (!res.ok) throw new Error("OSRM error");
  const d = await res.json();
  if (d.code !== "Ok" || !d.distances?.[0]) throw new Error("OSRM bad");
  const dists: number[] = d.distances[0];
  return list
    .map((h, i) => ({ ...h, distance: dists[i + 1] > 0 ? Math.round(dists[i + 1]) : h.distance }))
    .sort((a, b) => a.distance - b.distance);
}

async function bestDistances(
  oLat: number, oLng: number, list: Hospital[], setSource: (s: DistSource) => void
): Promise<Hospital[]> {
  if (GMAPS_KEY) {
    try { const r = await googleDistances(oLat, oLng, list); setSource("google"); return r; }
    catch (e) { console.warn("Google failed:", e); }
  }
  try { const r = await osrmDistances(oLat, oLng, list); setSource("osrm"); return r; }
  catch (e) { console.warn("OSRM failed:", e); }
  setSource("haversine");
  return list;
}

// ═════════════════════════════════════════════════════════════════════
export default function NearbyHospitals() {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(10);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [distSrc, setDistSrc] = useState<DistSource>("haversine");
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Map init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([28.6139, 77.209], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Map markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (userLat && userLng) {
      markersRef.current.push(
        L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("<strong>📍 You</strong>")
      );
      if (!hospitals.length) map.setView([userLat, userLng], 13);
    }

    hospitals.forEach((h) => {
      markersRef.current.push(
        L.marker([h.lat, h.lng], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-size:13px;min-width:150px"><strong>🏥 ${h.name}</strong><br/>${
              h.address ? "📍 " + h.address + "<br/>" : ""
            }${h.phone ? "📞 " + h.phone + "<br/>" : ""}<em>${formatDist(h.distance)} away</em></div>`
          )
      );
    });

    if (hospitals.length && userLat && userLng) {
      const pts: [number, number][] = [[userLat, userLng], ...hospitals.map((h) => [h.lat, h.lng] as [number, number])];
      map.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    }
  }, [userLat, userLng, hospitals]);

  const detectLocation = () => {
    if (!navigator.geolocation) return toast({ title: "Geolocation not supported", variant: "destructive" });
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserLat(p.coords.latitude); setUserLng(p.coords.longitude); setLocating(false); toast({ title: "📍 Location detected!" }); },
      () => { toast({ title: "Could not detect. Enter manually.", variant: "destructive" }); setLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  // ─── Search ────────────────────────────────────────────────────────
  const searchHospitals = async () => {
    if (!userLat || !userLng) return toast({ title: "Detect/enter location first.", variant: "destructive" });
    setLoading(true);
    setHospitals([]);

    try {
      // Convert km radius to rough degrees for the search square (viewbox)
      const rDeg = radius / 111.32; 
      const minLon = userLng - rDeg;
      const minLat = userLat - rDeg;
      const maxLon = userLng + rDeg;
      const maxLat = userLat + rDeg;

      // Ask OpenStreetMap Nominatim for highly reliable, fast POI lookups
      // 'bounded=1' restricts results tightly to the viewbox
      const urls = [
        `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=100`,
        `https://nominatim.openstreetmap.org/search?format=json&q=clinic&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=50`
      ];

      const fetchPromises = urls.map(url => fetch(url).then(r => r.ok ? r.json() : []).catch(() => []));
      const resultsArray = await Promise.all(fetchPromises);
      const combinedJson = [...resultsArray[0], ...resultsArray[1]];

      if (!combinedJson.length) {
        toast({ title: "No hospitals found in this range. Try increasing radius." });
        setLoading(false);
        return;
      }

      // Deduplicate results by place_id
      const uniqueMap = new Map();
      combinedJson.forEach((el: any) => {
        if (!uniqueMap.has(el.place_id)) uniqueMap.set(el.place_id, el);
      });
      const uniqueJson = Array.from(uniqueMap.values());

      let list: Hospital[] = uniqueJson
        .map((el: any) => {
          const hLat = parseFloat(el.lat);
          const hLng = parseFloat(el.lon);
          const name = el.name || el.display_name.split(",")[0] || "Hospital/Clinic";
          return {
            id: el.place_id || Math.random(),
            name,
            lat: hLat,
            lng: hLng,
            address: el.display_name,
            distance: haversineMeters(userLat, userLng, hLat, hLng),
            type: el.type === "clinic" ? "Clinic" : "Hospital",
          };
        })
        .filter((h: Hospital) => h.distance <= radius * 1000) // Strict spherical range constraint explicitly required by user
        .sort((a: Hospital, b: Hospital) => a.distance - b.distance);

      // Get precise road distances
      list = await bestDistances(userLat, userLng, list.slice(0, 100), setDistSrc);

      // CRITICAL: bestDistances computes *driving* distance which is larger than straight-line.
      // E.g., an 8km straight-line hospital might take 12km to drive to. 
      // We must strictly re-filter anything that exceeds the requested radius after road conversion
      // and double-check ascending sorting as explicitly requested by the user.
      const maxMeters = radius * 1000;
      list = list
        .filter((h: Hospital) => h.distance <= maxMeters)
        .sort((a: Hospital, b: Hospital) => a.distance - b.distance);

      setHospitals(list);

      if (!list.length) toast({ title: "No hospitals strictly inside radius." });
      else toast({ title: `Found ${list.length} hospital${list.length > 1 ? "s" : ""}!` });
    } catch (err) {
      console.error(err);
      toast({ title: "Search failed. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { detectLocation(); }, []);
  useEffect(() => { if (userLat && userLng) searchHospitals(); }, [userLat, userLng]);

  const openDirections = (h: Hospital) => {
    const o = userLat && userLng ? `${userLat},${userLng}` : "";
    window.open(`https://www.google.com/maps/dir/${o}/${h.lat},${h.lng}`, "_blank");
  };

  const focusOnMap = (h: Hospital) => {
    setSelectedId(h.id);
    mapRef.current?.setView([h.lat, h.lng], 16);
    markersRef.current.forEach((m) => {
      const p = m.getLatLng();
      if (Math.abs(p.lat - h.lat) < 0.0001 && Math.abs(p.lng - h.lng) < 0.0001) m.openPopup();
    });
  };

  const dp = distSrc === "google" ? "" : "~"; // prefix ~ for approximate

  // ─── RENDER ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Nearby Hospitals</h1>
            <p className="mt-2 text-muted-foreground">Find hospitals & clinics closest to your location</p>
          </div>

          {/* Controls */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Latitude</label>
                  <Input type="number" step="any" placeholder="e.g. 28.6139" value={userLat ?? ""} onChange={(e) => setUserLat(parseFloat(e.target.value) || null)} className="text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Longitude</label>
                  <Input type="number" step="any" placeholder="e.g. 77.2090" value={userLng ?? ""} onChange={(e) => setUserLng(parseFloat(e.target.value) || null)} className="text-sm" />
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Search Radius: <span className="text-primary font-semibold">{radius} km</span>
                </label>
                <input type="range" min="1" max="50" step="1" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[hsl(199,89%,48%)]" style={{ background: `linear-gradient(to right,hsl(199,89%,48%) ${((radius - 1) / 49) * 100}%,hsl(210,18%,90%) ${((radius - 1) / 49) * 100}%)` }} />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>1 km</span><span>25 km</span><span>50 km</span></div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button onClick={detectLocation} variant="outline" disabled={locating} className="gap-2">
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />} Detect
                </Button>
                <Button onClick={searchHospitals} disabled={!userLat || !userLng || loading} className="gradient-primary border-0 text-primary-foreground gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} Search
                </Button>
              </div>
            </div>
          </div>

          {/* Map + List */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 rounded-xl overflow-hidden border border-border shadow-card relative z-0" style={{ height: "550px" }}>
              <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading text-lg font-bold text-foreground">Hospitals & Clinics</h2>
                <span className="text-sm text-muted-foreground rounded-full bg-muted px-3 py-1">{hospitals.length} found</span>
              </div>

              {/* Distance source badge */}
              {hospitals.length > 0 && (
                <div className="mb-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${distSrc === "google" ? "bg-green-500" : distSrc === "osrm" ? "bg-amber-500" : "bg-gray-400"}`} />
                  {distSrc === "google" ? "Google Maps distances (exact)" : distSrc === "osrm" ? "Road distances (OSRM ~ approx)" : "Straight-line (add VITE_GOOGLE_MAPS_KEY for exact)"}
                </div>
              )}

              <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "490px" }}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)
                ) : !hospitals.length ? (
                  <div className="rounded-xl border border-border bg-card p-10 text-center">
                    <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">{userLat ? "No hospitals found" : "Detect your location first"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{userLat ? "Try increasing the radius" : "Click Detect above"}</p>
                  </div>
                ) : (
                  hospitals.map((h, i) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => focusOnMap(h)}
                      className={`rounded-xl border bg-card p-4 shadow-card cursor-pointer transition-all hover:shadow-elevated ${selectedId === h.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🏥</span>
                            <h3 className="font-semibold text-foreground text-sm truncate">{h.name}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${h.type === "Clinic" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>{h.type}</span>
                            <span className="text-xs text-muted-foreground">{formatDist(h.distance, dp)} away</span>
                          </div>
                        </div>
                      </div>

                      {h.address && <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">📍 {h.address}</p>}
                      {h.phone && <p className="text-xs text-muted-foreground mb-2">📞 {h.phone}</p>}
                      {h.openingHours && <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Clock className="h-3 w-3" /> {h.openingHours}</p>}

                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); openDirections(h); }} className="flex-1 gradient-primary border-0 text-primary-foreground text-xs h-8">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" /> Get Directions
                        </Button>
                        {h.phone && (
                          <a href={`tel:${h.phone}`} onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="text-xs h-8 px-2.5 text-green-600 border-green-600/30 hover:bg-green-600/10" title="Call"><Phone className="h-3.5 w-3.5" /></Button>
                          </a>
                        )}
                        {h.website && (
                          <a href={h.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="text-xs h-8 px-2.5 text-primary border-primary/30 hover:bg-primary/10" title="Website">🌐</Button>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
