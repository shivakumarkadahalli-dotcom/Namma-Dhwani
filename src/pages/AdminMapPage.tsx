import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { Search, Filter, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminMapPage: React.FC = () => {
  const { complaints, recurringAssets, navigate } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showDensity, setShowDensity] = useState(true);

  const filteredComplaints = complaints.filter(c => 
    selectedCategory === 'All' ? true : c.category === selectedCategory
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col font-sans">
      
      {/* Map Control Bar */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
            🗺️
          </div>
          <div>
            <h1 className="text-sm font-extrabold font-sans">City GIS Intelligence Map</h1>
            <p className="text-[11px] text-slate-400">Real-time complaint pins & recurring asset density heatmaps</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Roads & Footpaths">Roads & Footpaths</option>
            <option value="Stormwater Drainage">Stormwater Drainage</option>
            <option value="Solid Waste Management">Solid Waste</option>
            <option value="Water Supply">Water Supply</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <input
              type="checkbox"
              checked={showDensity}
              onChange={(e) => setShowDensity(e.target.checked)}
              className="rounded-md border-slate-600 text-blue-600"
            />
            <span>Density Radii</span>
          </label>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative">
        <MapComponent
          complaints={filteredComplaints}
          recurringAssets={recurringAssets}
          center={[12.9750, 77.6380]}
          zoom={13}
          height="100%"
          showDensityCircles={showDensity}
          onMarkerClick={(id, type) => {
            if (type === 'complaint') navigate(`/citizen/complaints/${id}`);
            if (type === 'asset') navigate(`/admin/insights/${id}`);
          }}
        />
      </div>

    </div>
  );
};
