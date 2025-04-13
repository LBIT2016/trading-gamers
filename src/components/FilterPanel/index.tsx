import React from 'react';

/**
 * Props for the FilterSection component
 */
interface FilterSectionProps {
  /**
   * Title of the filter section
   */
  title: string;
  /**
   * Children elements to be rendered within the section
   */
  children: React.ReactNode;
}

/**
 * A section within the filter panel
 */
const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="font-medium text-gray-700 mb-2">{title}</h3>
    <div className="pl-2">{children}</div>
  </div>
);

/**
 * Props for the FilterPanel component
 */
export interface FilterPanelProps {
  /**
   * Handler for when filters change
   */
  onFilterChange?: (filters: Record<string, any>) => void;
}

/**
 * A panel containing filter options for the marketplace
 * 
 * @param props - The component props
 * @returns A filter panel with various filtering options
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  // This would be connected to a store in a real implementation
  const handleFilterChange = () => {
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="space-y-6">
      <FilterSection title="Game Categories">
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={handleFilterChange} />
            <span>Role-Playing</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={handleFilterChange} />
            <span>Strategy</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={handleFilterChange} />
            <span>Action</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={handleFilterChange} />
            <span>Adventure</span>
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full p-1 border rounded" 
              onChange={handleFilterChange}
            />
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full p-1 border rounded" 
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <select className="w-full p-2 border rounded" onChange={handleFilterChange}>
          <option value="">Any Location</option>
          <option value="local">Local Only</option>
          <option value="national">National</option>
          <option value="international">International</option>
        </select>
      </FilterSection>

      <FilterSection title="Seller Type">
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={handleFilterChange} />
            <span>Individual Sellers</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={handleFilterChange} />
            <span>Service Providers</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
};
