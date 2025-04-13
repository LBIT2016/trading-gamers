import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from '../types/marketplace.types';
import { Sidebar } from '../../../components/Sidebar';
import { FilterPanel } from '../../../components/FilterPanel';
import { SearchBar } from '../../../components/SearchBar';
import { ItemCard } from '../../../components/ItemCard';
import { AuthSidebar } from '../../../components/AuthSidebar';
import { AuthenticatedSidebar } from '../../../components/AuthenticatedSidebar';
import { useUserStore } from '../../../stores/userStore';
import { useListingStore, Listing, ItemCategory, ServiceCategory, ListingType, ItemCondition } from '../../../stores/listingStore';
import { ListingDetailModal } from '../../../components/ListingDetailModal';
import { ListingCreationModal } from '../../../components/ListingCreationModal';

// Define filter interface
interface MarketplaceFilters {
  categories: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  location: string;
  sellerTypes: string[];
  condition?: string;
}

const categories: CategoryCard[] = [
  {
    title: 'Video Games',
    description: 'Buy, sell or trade console and PC games',
    icon: '🎮',
    slug: 'video-games'
  },
  {
    title: 'Board Games',
    description: 'Discover board games and card games',
    icon: '🎲',
    slug: 'board-games'
  },
  {
    title: 'Gaming Services',
    description: 'Find coaches, mediators and gaming professionals',
    icon: '👨‍🏫',
    slug: 'gaming-services'
  }
];

/**
 * Main marketplace page component that displays the full layout with filters,
 * search, item listings, and authentication sidebar
 * 
 * @returns The complete marketplace page layout
 */
export const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { getCurrentUser, isLoading: isUserLoading } = useUserStore();
  const { listings, getActiveListings, isLoading: isListingsLoading } = useListingStore();
  const [showLoading, setShowLoading] = useState(false);
  
  // Add filter state
  const [filters, setFilters] = useState<MarketplaceFilters>({
    categories: [],
    priceRange: {
      min: null,
      max: null
    },
    location: '',
    sellerTypes: []
  });
  
  // State for the listing detail modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State for the listing creation modal
  const [showListingModal, setShowListingModal] = useState(false);
  
  // Get current user for conditional rendering
  const currentUser = getCurrentUser();
  const activeListings = getActiveListings();
  
  // Filter listings based on search query and filters
  const getFilteredListings = () => {
    let result = activeListings;
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) || 
        listing.shortDescription.toLowerCase().includes(query) || 
        listing.sellerName.toLowerCase().includes(query) ||
        listing.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filters
    if (filters.categories.length > 0) {
      result = result.filter(listing => {
        // Map category names to the actual category values used in the listing
        const categoryMap: Record<string, string> = {
          'role-playing': ItemCategory.VIDEO_GAME,
          'strategy': ItemCategory.BOARD_GAME,
          'action': ItemCategory.VIDEO_GAME,
          'adventure': ItemCategory.VIDEO_GAME
        };
        
        // Check if the listing's category matches any of the selected categories
        // Simple matching for demo purposes
        return filters.categories.some(cat => {
          const mappedCategory = categoryMap[cat];
          return mappedCategory === listing.category || 
                 // Check if tags contain the category
                 listing.tags.some(tag => tag.toLowerCase().includes(cat.toLowerCase()));
        });
      });
    }
    
    // Apply price range filter
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      result = result.filter(listing => {
        const price = parseFloat(listing.price);
        if (isNaN(price)) return false;
        
        // Check min price if it exists
        if (filters.priceRange.min !== null && price < filters.priceRange.min) {
          return false;
        }
        
        // Check max price if it exists
        if (filters.priceRange.max !== null && price > filters.priceRange.max) {
          return false;
        }
        
        return true;
      });
    }
    
    // Apply location filter
    if (filters.location) {
      result = result.filter(listing => {
        if (filters.location === 'local') {
          // Local means it has a location and is not remote
          return !listing.isRemote && listing.location.trim() !== '';
        } else if (filters.location === 'national') {
          // National can include both local and some remote
          return true; // Simplified logic for demo
        } else if (filters.location === 'international') {
          // International would typically be remote
          return listing.isRemote;
        }
        return true;
      });
    }
    
    // Apply seller type filters
    if (filters.sellerTypes.length > 0) {
      result = result.filter(listing => {
        if (filters.sellerTypes.includes('individual') && 
            [ListingType.SELL, ListingType.BUY, ListingType.TRADE].includes(listing.listingType)) {
          return true;
        }
        
        if (filters.sellerTypes.includes('service') && 
            [ListingType.OFFER_SERVICE, ListingType.REQUEST_SERVICE].includes(listing.listingType)) {
          return true;
        }
        
        return filters.sellerTypes.length === 0; // If no seller types selected, show all
      });
    }
    
    return result;
  };
  
  // Get filtered listings
  const filteredListings = getFilteredListings();
  
  // Handle loading state with a timeout to prevent infinite loading
  useEffect(() => {
    if (isUserLoading || isListingsLoading) {
      setShowLoading(true);
      // Set a timeout to ensure loading doesn't get stuck
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 5000); // 5 seconds timeout
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isUserLoading, isListingsLoading]);
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('Auth state changed:', { currentUser, isUserLoading });
  }, [currentUser, isUserLoading]);

  const handleExplore = (slug: string) => {
    navigate(`/explore/${slug}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };
  
  // Handle clearing the search
  const handleClearSearch = () => {
    setSearchQuery('');
    // This will update the SearchBar since we pass initialValue={searchQuery}
  };
  
  // Handle filter change from FilterPanel
  const handleFilterChange = (newFilters: Partial<MarketplaceFilters>) => {
    console.log('Filters changed:', newFilters);
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      categories: [],
      priceRange: {
        min: null,
        max: null
      },
      location: '',
      sellerTypes: []
    });
  };
  
  // Handle item click to show the detail modal
  const handleItemClick = (itemId: string) => {
    // Find the listing in activeListings
    const listing = activeListings.find(l => l.id === itemId);
    
    // If found, show the detail modal
    if (listing) {
      setSelectedListing(listing);
      setShowDetailModal(true);
    }
  };
  
  // Close the detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedListing(null);
  };

  // Handle opening the listing creation modal
  const handleCreateListing = () => {
    setShowListingModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Filters */}
      <Sidebar title="Filters">
        <button 
          onClick={handleResetFilters}
          className="mb-4 px-2 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filters
        </button>
        <FilterPanel 
          onFilterChange={handleFilterChange} 
          currentFilters={filters}
          listings={activeListings}
        />
      </Sidebar>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Gaming Marketplace</h1>
        
        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch} 
          className="mb-8"
          initialValue={searchQuery}
        />
        
        {/* Active filter pills */}
        {(filters.categories.length > 0 || 
          filters.priceRange.min !== null || 
          filters.priceRange.max !== null || 
          filters.location || 
          filters.sellerTypes.length > 0) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.categories.map(category => (
              <div key={category} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                {category}
                <button 
                  onClick={() => setFilters(prev => ({
                    ...prev, 
                    categories: prev.categories.filter(c => c !== category)
                  }))}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
            
            {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Price: 
                {filters.priceRange.min !== null ? `$${filters.priceRange.min}` : '$0'} 
                {' - '} 
                {filters.priceRange.max !== null ? `$${filters.priceRange.max}` : 'Any'}
                <button 
                  onClick={() => setFilters(prev => ({
                    ...prev, 
                    priceRange: { min: null, max: null }
                  }))}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.location && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Location: {filters.location}
                <button 
                  onClick={() => setFilters(prev => ({
                    ...prev, 
                    location: ''
                  }))}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.sellerTypes.map(type => (
              <div key={type} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                {type === 'individual' ? 'Individual Sellers' : 'Service Providers'}
                <button 
                  onClick={() => setFilters(prev => ({
                    ...prev, 
                    sellerTypes: prev.sellerTypes.filter(t => t !== type)
                  }))}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Clear All
            </button>
          </div>
        )}
        
        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showLoading ? (
            // Show loading placeholders
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm h-64 animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : filteredListings.length > 0 ? (
            // Show filtered listings from store
            filteredListings.map(listing => (
              <ItemCard
                key={listing.id}
                itemId={listing.id}
                title={listing.title}
                price={parseFloat(listing.price) || 0}
                imageUrl={listing.images.length > 0 ? listing.images[0].url : 'https://placehold.co/300x200?text=No+Image'}
                seller={listing.sellerName}
                description={listing.shortDescription}
                location={listing.isRemote ? 'Remote/Online' : listing.location}
                onClick={() => handleItemClick(listing.id)}
              />
            ))
          ) : searchQuery.trim() ? (
            // Show no results message when searching
            <div className="col-span-3 text-center py-16">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">No listings match your search for "{searchQuery}"</p>
              <button 
                onClick={handleClearSearch} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Clear Search
              </button>
            </div>
          ) : (
            // Show empty state when no listings are available
            <div className="col-span-3 text-center py-16">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No listings available</h3>
              <p className="text-gray-600 mb-6">Be the first to create a listing in the marketplace!</p>
              {currentUser && (
                <button 
                  onClick={handleCreateListing} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Create a Listing
                </button>
              )}
            </div>
          )}
          
          {/* Update the no results message to include filters */}
          {filteredListings.length === 0 && !showLoading && (
            <div className="col-span-3 text-center py-16">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery.trim() 
                  ? `No listings match your search for "${searchQuery}"` 
                  : "No listings match your current filters"}
              </p>
              <button 
                onClick={searchQuery.trim() ? handleClearSearch : handleResetFilters} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {searchQuery.trim() ? 'Clear Search' : 'Reset Filters'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - Auth */}
      {showLoading && isUserLoading ? (
        <div className="w-64 h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : currentUser ? (
        <AuthenticatedSidebar />
      ) : (
        <AuthSidebar />
      )}
      
      {/* Listing Detail Modal */}
      {showDetailModal && selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={handleCloseDetailModal}
        />
      )}
      
      {/* Listing Creation Modal */}
      {showListingModal && (
        <ListingCreationModal 
          onClose={() => setShowListingModal(false)}
        />
      )}
    </div>
  );
};
