import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint, RecurringAssetInsight } from '../types';

// Safe inline fallback for Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

export interface MapComponentProps {
  complaints?: Complaint[];
  recurringAssets?: RecurringAssetInsight[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (id: string, type: 'complaint' | 'asset') => void;
  showDensityCircles?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  userLocationStatus?: 'locating' | 'success' | 'error' | 'idle';
  userLocationError?: string | null;
  onRefreshLocation?: () => void;
  showUserProximityCircle?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  complaints = [],
  recurringAssets = [],
  center = [12.9750, 77.6380], // Default fallback center for report bounds
  zoom = 13,
  height = '400px',
  onMarkerClick,
  showDensityCircles = true,
  userLocation = null,
  userLocationStatus = 'idle',
  userLocationError = null,
  onRefreshLocation,
  showUserProximityCircle = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const lastCenteredKeyRef = useRef<string>('');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Target center coordinates: userLocation if available, else center prop
    const targetLat = userLocation ? userLocation.lat : center[0];
    const targetLng = userLocation ? userLocation.lng : center[1];
    const centerKey = `${targetLat.toFixed(5)},${targetLng.toFixed(5)},${zoom}`;

    // Initialize Leaflet map instance if not existing
    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([targetLat, targetLng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      lastCenteredKeyRef.current = centerKey;
    } else {
      // Only setView if centerKey has actually changed (e.g. initial location set or refresh)
      if (lastCenteredKeyRef.current !== centerKey) {
        mapInstanceRef.current.setView([targetLat, targetLng], zoom);
        lastCenteredKeyRef.current = centerKey;
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Invalidate map size slightly after render to ensure correct tile layout in containers
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 100);

    // Clear previous vector layers and markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // 1. Render User Location Marker (🔵) if userLocation is valid
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const userSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="30" height="38">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20C24 5.37 18.63 0 12 0z" fill="#2563EB" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff"/>
          <circle cx="12" cy="11" r="2.5" fill="#2563EB"/>
        </svg>
      `;
      const userIcon = L.divIcon({
        className: 'custom-leaflet-user-pin',
        html: userSvg,
        iconSize: [30, 38],
        iconAnchor: [15, 38],
        popupAnchor: [0, -34],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 190px;">
          <div style="font-size: 11px; font-weight: bold; color: #1e40af;">
            📍 Your Location
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            Real Browser GPS Position
          </div>
          <div style="font-size: 9px; font-family: monospace; color: #2563eb; margin-top: 4px; background: #eff6ff; padding: 2px 4px; border-radius: 4px;">
            ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}
          </div>
        </div>
      `);

      if (showUserProximityCircle) {
        L.circle([userLocation.lat, userLocation.lng], {
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.12,
          radius: 350,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);
      }
    }

    // Helper to create custom SVG pin icon
    const createPinIcon = (color: string, label?: string) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20C24 5.37 18.63 0 12 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff"/>
          <text x="12" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="${color}">${label || '!'}</text>
        </svg>
      `;
      return L.divIcon({
        className: 'custom-leaflet-pin',
        html: svg,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -32],
      });
    };

    // Render Complaints Markers
    complaints.forEach((c) => {
      if (!c.location || !c.location.lat || !c.location.lng) return;

      let color = '#3B82F6'; // Default Blue
      let priorityTag = 'LOW';
      if (c.priorityScore >= 80) {
        color = '#EF4444'; // Red (High)
        priorityTag = 'HIGH';
      } else if (c.priorityScore >= 50) {
        color = '#F59E0B'; // Amber (Medium)
        priorityTag = 'MED';
      }

      const marker = L.marker([c.location.lat, c.location.lng], {
        icon: createPinIcon(color, priorityTag.charAt(0)),
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <div style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">
            ${c.category} • Priority ${c.priorityScore}
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px;">
            ${c.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            📍 ${c.location.address}
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 4px; font-weight: 500;">
            Status: ${c.status} ${c.isRecurring ? '⚠️ (Recurring)' : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(c.id, 'complaint'));
      }

      // Add density circles around high priority complaints
      if (showDensityCircles && c.priorityScore >= 75) {
        L.circle([c.location.lat, c.location.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          radius: 200 + c.citizensAffected * 2,
        }).addTo(map);
      }
    });

    // Render Recurring Asset Markers
    recurringAssets.forEach((ast) => {
      let color = '#EF4444'; // Red
      if (ast.riskLevel === 'MEDIUM') color = '#F59E0B';
      if (ast.riskLevel === 'LOW') color = '#10B981';

      const marker = L.marker([ast.lat, ast.lng], {
        icon: createPinIcon(color, 'R'),
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">
            ⚠️ Recurring Asset Risk • Score ${ast.riskScore}/100
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px;">
            ${ast.assetType}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            📍 ${ast.locationName} (${ast.ward})
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 4px; background: #f1f5f9; padding: 4px; border-radius: 4px;">
            ${ast.totalComplaints} complaints logged (${ast.reopenedCount} reopened)
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(ast.id, 'asset'));
      }

      if (showDensityCircles) {
        L.circle([ast.lat, ast.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          radius: 300,
        }).addTo(map);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaints, recurringAssets, center, zoom, showDensityCircles, onMarkerClick, userLocation, showUserProximityCircle]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height }}
      className="w-full rounded-2xl shadow-inner border border-slate-200 overflow-hidden relative"
    />
  );
};
