import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Layers, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CanalSegment {
  id: string;
  name: string;
  coordinates: [number, number][];
  siltLevel: number;
  potentialMW: number;
  covered: boolean;
}

interface CanalMapProps {
  mapboxToken?: string;
  onSegmentClick?: (segment: CanalSegment) => void;
}

// Sikta Canal approximate coordinates
const SIKTA_CANAL_SEGMENTS: CanalSegment[] = [
  {
    id: 'sikta-1',
    name: 'Sikta Main Canal - Section A',
    coordinates: [[81.65, 28.05], [81.70, 28.08], [81.75, 28.10]],
    siltLevel: 15,
    potentialMW: 2.5,
    covered: true,
  },
  {
    id: 'sikta-2',
    name: 'Sikta Main Canal - Section B',
    coordinates: [[81.75, 28.10], [81.80, 28.12], [81.85, 28.15]],
    siltLevel: 45,
    potentialMW: 3.2,
    covered: false,
  },
  {
    id: 'sikta-3',
    name: 'Sikta Branch Canal - North',
    coordinates: [[81.70, 28.08], [81.72, 28.12], [81.74, 28.16]],
    siltLevel: 25,
    potentialMW: 1.8,
    covered: true,
  },
  {
    id: 'sikta-4',
    name: 'Sikta Branch Canal - South',
    coordinates: [[81.80, 28.12], [81.82, 28.09], [81.85, 28.06]],
    siltLevel: 60,
    potentialMW: 2.1,
    covered: false,
  },
];

export function CanalMap({ mapboxToken, onSegmentClick }: CanalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<CanalSegment | null>(null);
  const [token, setToken] = useState(mapboxToken || '');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);

  useEffect(() => {
    if (!mapContainer.current || !token || mapLoaded) return;

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [81.75, 28.10], // Sikta Canal area
          zoom: 10,
          pitch: 30,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Add canal segments
          SIKTA_CANAL_SEGMENTS.forEach((segment) => {
            const color = segment.covered 
              ? `hsl(160, 84%, ${50 - segment.siltLevel / 2}%)`
              : `hsl(186, 100%, ${50 - segment.siltLevel / 2}%)`;

            map.current?.addSource(segment.id, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: segment.name,
                  siltLevel: segment.siltLevel,
                  potentialMW: segment.potentialMW,
                  covered: segment.covered,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: segment.coordinates,
                },
              },
            });

            map.current?.addLayer({
              id: `${segment.id}-line`,
              type: 'line',
              source: segment.id,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': color,
                'line-width': 6,
                'line-opacity': 0.8,
              },
            });

            // Add glow effect for covered segments
            if (segment.covered) {
              map.current?.addLayer({
                id: `${segment.id}-glow`,
                type: 'line',
                source: segment.id,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': 'hsl(160, 84%, 50%)',
                  'line-width': 12,
                  'line-opacity': 0.3,
                  'line-blur': 8,
                },
              });
            }

            // Add click handler
            map.current?.on('click', `${segment.id}-line`, () => {
              setSelectedSegment(segment);
              onSegmentClick?.(segment);
            });

            map.current?.on('mouseenter', `${segment.id}-line`, () => {
              if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });

            map.current?.on('mouseleave', `${segment.id}-line`, () => {
              if (map.current) map.current.getCanvas().style.cursor = '';
            });
          });

          // Add markers for stations
          const stationCoords: [number, number][] = [
            [81.67, 28.06],
            [81.77, 28.11],
            [81.72, 28.14],
          ];

          stationCoords.forEach((coords, i) => {
            const el = document.createElement('div');
            el.className = 'w-4 h-4 bg-primary rounded-full border-2 border-background pulse-glow cursor-pointer';
            
            new mapboxgl.Marker(el)
              .setLngLat(coords)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`<div class="text-sm"><strong>Station ${i + 1}</strong><br/>Capacity: ${(50 + i * 25)} kW</div>`)
              )
              .addTo(map.current!);
          });
        });
      } catch (error) {
        console.error('Error loading map:', error);
        setShowTokenInput(true);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [token, mapLoaded, onSegmentClick]);

  const handleTokenSubmit = () => {
    if (token) {
      setShowTokenInput(false);
      setMapLoaded(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-4 md:p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Canal System
        </h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 px-2">
            <Layers className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2">
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {showTokenInput ? (
        <div className="h-64 md:h-80 flex flex-col items-center justify-center bg-muted/20 rounded-lg">
          <MapPin className="w-8 h-8 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4 text-center px-4">
            Enter your Mapbox public token to view the interactive map
          </p>
          <div className="flex gap-2 px-4 w-full max-w-sm">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTokenSubmit} disabled={!token}>
              Load
            </Button>
          </div>
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2"
          >
            Get a token from Mapbox
          </a>
        </div>
      ) : (
        <>
          <div 
            ref={mapContainer} 
            className="h-64 md:h-80 rounded-lg overflow-hidden"
          />
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-primary rounded" />
              <span className="text-muted-foreground">Covered (Solar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-secondary rounded" />
              <span className="text-muted-foreground">Uncovered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Station</span>
            </div>
          </div>

          {/* Selected Segment Info */}
          {selectedSegment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{selectedSegment.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Silt Level: <span className={selectedSegment.siltLevel > 40 ? 'text-warning' : 'text-primary'}>
                      {selectedSegment.siltLevel}%
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display text-primary">
                    {selectedSegment.potentialMW} MW
                  </p>
                  <p className="text-xs text-muted-foreground">Potential Capacity</p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
