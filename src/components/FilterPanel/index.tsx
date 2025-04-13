import React, { useState, useEffect, useMemo } from 'react';
import { Listing, ItemCategory, ServiceCategory } from '../../stores/listingStore';

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

// Define the filter structure that matches what MarketplacePage expects
interface MarketplaceFilters {
  categories: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  location: string;
  sellerTypes: string[];
}

/**
 * Props for the FilterPanel component
 */
export interface FilterPanelProps {
  /**
   * Handler for when filters change
   */
  onFilterChange?: (filters: Partial<MarketplaceFilters>) => void;
  /**
   * Current filter values
   */
  currentFilters?: MarketplaceFilters;
  /**
   * Available listings to base filter options on
   */
  listings?: Listing[];
}

/**
 * A panel containing filter options for the marketplace
 * 
 * @param props - The component props
 * @returns A filter panel with various filtering options
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onFilterChange,
  currentFilters = {
    categories: [],
    priceRange: { min: null, max: null },
    location: '',
    sellerTypes: []
  },
  listings = []
}) => {
  // Local state for managing filter inputs
  const [minPrice, setMinPrice] = useState<string>(currentFilters.priceRange.min?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(currentFilters.priceRange.max?.toString() || '');
  
  // Extract filter options from listings data
  const filterOptions = useMemo(() => {
    // Get unique categories with counts
    const categoryMap = new Map<string, number>();
    const locationMap = new Map<string, number>();
    let minListingPrice = Infinity;
    let maxListingPrice = 0;
    
    listings.forEach(listing => {
      // Process category
      const category = listing.category.replace('_', ' ');
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      
      // Process price for bounds
      const price = parseFloat(listing.price);
      if (!isNaN(price)) {
        minListingPrice = Math.min(minListingPrice, price);
        maxListingPrice = Math.max(maxListingPrice, price);
      }
      
      // Process location
      const location = listing.isRemote ? 'Remote/Online' : listing.location;
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });
    
    // Convert maps to sorted arrays
    const categories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
      .map(([name, count]) => ({ name, count }));
    
    const locations = Array.from(locationMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
      .map(([name, count]) => ({ name, count }));
    
    return {
      categories,
      locations,
      priceRange: {
        min: minListingPrice === Infinity ? 0 : Math.floor(minListingPrice),
        max: maxListingPrice === 0 ? 100 : Math.ceil(maxListingPrice)
      }
    };
  }, [listings]);
  
  // Update local state when props change
  useEffect(() => {
    setMinPrice(currentFilters.priceRange.min?.toString() || '');
    setMaxPrice(currentFilters.priceRange.max?.toString() || '');
  }, [currentFilters]);

  // Handle category checkbox changes
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (!onFilterChange) return;
    
    const newCategories = checked
      ? [...currentFilters.categories, category]
      : currentFilters.categories.filter(c => c !== category);
    
    onFilterChange({
      categories: newCategories
    });
  };
  
  // Handle price input changes
  const handlePriceChange = () => {
    if (!onFilterChange) return;
    
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    
    onFilterChange({
      priceRange: { min, max }
    });
  };
  
  // Handle location selection changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onFilterChange) return;
    onFilterChange({ location: e.target.value });
  };
  
  // Handle seller type checkbox changes
  const handleSellerTypeChange = (type: string, checked: boolean) => {
    if (!onFilterChange) return;
    
    const newSellerTypes = checked
      ? [...currentFilters.sellerTypes, type]
      : currentFilters.sellerTypes.filter(t => t !== type);
    
    onFilterChange({
      sellerTypes: newSellerTypes
    });
  };

  return (
    <div className="space-y-6">
      <FilterSection title="Categories">
        <div className="space-y-2">
          {filterOptions.categories.length > 0 ? (
            filterOptions.categories.map(category => (
              <label key={category.name} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={currentFilters.categories.includes(category.name.toLowerCase())}
                  onChange={(e) => handleCategoryChange(category.name.toLowerCase(), e.target.checked)}
                />
                <span>{category.name} <span className="text-gray-400 text-xs">({category.count})</span></span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No categories available</p>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder={`Min (${filterOptions.priceRange.min})`}
              className="w-full p-1 border rounded" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceChange}
            />
            <input 
              type="number" 
              placeholder={`Max (${filterOptions.priceRange.max})`}
              className="w-full p-1 border rounded" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceChange}
            />
          </div>
          {filterOptions.priceRange.min !== 0 && filterOptions.priceRange.max !== 100 && (
            <p className="text-xs text-gray-500">
              Price range: ${filterOptions.priceRange.min} - ${filterOptions.priceRange.max}
            </p>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <select 
          className="w-full p-2 border rounded" 
          value={currentFilters.location}
          onChange={handleLocationChange}
        >
          <option value="">Any Location</option>
          <option value="local">Local Only</option>
          <option value="remote">Remote/Online Only</option>
          {filterOptions.locations.length > 0 && (
            <>
              <option value="" disabled>──────────</option>
              {filterOptions.locations.map(location => (
                <option key={location.name} value={location.name}>
                  {location.name} ({location.count})
                </option>
              ))}
            </>
          )}
        </select>
      </FilterSection>

      <FilterSection title="Listing Type">
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="mr-2" 
              checked={currentFilters.sellerTypes.includes('individual')}
              onChange={(e) => handleSellerTypeChange('individual', e.target.checked)}
            />
            <span>Items (Buy/Sell/Trade)</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="mr-2" 
              checked={currentFilters.sellerTypes.includes('service')}
              onChange={(e) => handleSellerTypeChange('service', e.target.checked)}
            />
            <span>Services</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
};
