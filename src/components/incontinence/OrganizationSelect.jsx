import React from 'react';

export default function OrganizationSelect({ 
  providers,
  selectedProvider,
  onProviderChange,
  buildings,
  selectedBuilding,
  onBuildingChange
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Healthcare Provider</label>
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select Provider</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProvider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
          <select
            value={selectedBuilding}
            onChange={(e) => onBuildingChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select Building</option>
            {buildings.map(building => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}