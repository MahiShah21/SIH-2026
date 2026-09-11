import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

// Fix Leaflet default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function InteractiveMapPicker({ 
  initialLat = 23.0428, 
  initialLng = 84.5421, 
  district = 'Gumla',
  onLocationChange 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #064e3b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.bindPopup(`<b>Selected Civic Location</b><br/>${district} District, Jharkhand`).openPopup();

      marker.on('dragend', function (e) {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        if (onLocationChange) {
          onLocationChange({
            lat: `${position.lat.toFixed(4)}° N`,
            lng: `${position.lng.toFixed(4)}° E`,
            numericLat: position.lat,
            numericLng: position.lng
          });
        }
      });

      map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        if (onLocationChange) {
          onLocationChange({
            lat: `${e.latlng.lat.toFixed(4)}° N`,
            lng: `${e.latlng.lng.toFixed(4)}° E`,
            numericLat: e.latlng.lat,
            numericLng: e.latlng.lng
          });
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when initialLat/Lng change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      if (typeof initialLat === 'number' && typeof initialLng === 'number') {
        markerRef.current.setLatLng([initialLat, initialLng]);
        mapInstanceRef.current.panTo([initialLat, initialLng]);
      }
    }
  }, [initialLat, initialLng]);

  // GPS Auto-detect
  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    setGpsStatus('Accessing device GPS...');

    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser. Using district centroid.');
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        setGpsStatus(`GPS Locked (Accuracy: ±${Math.round(position.coords.accuracy || 5)}m)`);
        setIsDetectingGps(false);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([userLat, userLng]);
          mapInstanceRef.current.setView([userLat, userLng], 14);
          markerRef.current.bindPopup('<b>Detected Current Location</b><br/>Grievance Coordinate Point').openPopup();
        }

        if (onLocationChange) {
          onLocationChange({
            lat: `${userLat.toFixed(4)}° N`,
            lng: `${userLng.toFixed(4)}° E`,
            numericLat: userLat,
            numericLng: userLng,
            autoDetected: true
          });
        }
      },
      (err) => {
        console.warn('GPS error, using default Jharkhand coordinates:', err.message);
        // Fallback to Gumla coords
        const fallbackLat = 23.0428;
        const fallbackLng = 84.5421;
        setCoords({ lat: fallbackLat, lng: fallbackLng });
        setGpsStatus('Using Jharkhand regional GPS anchor (Gumla/Ranchi).');
        setIsDetectingGps(false);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([fallbackLat, fallbackLng]);
          mapInstanceRef.current.setView([fallbackLat, fallbackLng], 13);
        }

        if (onLocationChange) {
          onLocationChange({
            lat: `${fallbackLat}° N`,
            lng: `${fallbackLng}° E`,
            numericLat: fallbackLat,
            numericLng: fallbackLng,
            autoDetected: false
          });
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      {/* Top Map Bar */}
      <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-slate-800">
            Interactive OpenStreetMap &amp; GPS Pin Drag
          </span>
          <span className="text-slate-500 hidden sm:inline">
            (Click map or drag pin to pinpoint exact problem location)
          </span>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGps}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
          <span>{isDetectingGps ? 'Locating...' : 'Auto-Detect My GPS'}</span>
        </button>
      </div>

      {/* Real Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-64 sm:h-72 z-10 relative bg-slate-100"
        style={{ minHeight: '260px' }}
      />

      {/* Bottom Coordinates Status */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-teal-700" />
          <span>Lat: <strong>{coords.lat.toFixed ? coords.lat.toFixed(4) : coords.lat}° N</strong></span>
          <span>•</span>
          <span>Lng: <strong>{coords.lng.toFixed ? coords.lng.toFixed(4) : coords.lng}° E</strong></span>
        </div>
        {gpsStatus && (
          <span className="text-emerald-700 font-sans font-semibold">
            {gpsStatus}
          </span>
        )}
      </div>
    </div>
  );
}
