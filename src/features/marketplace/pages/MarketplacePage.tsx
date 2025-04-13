import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from '../types/marketplace.types';
import { Sidebar } from '../../../components/Sidebar';
import { FilterPanel } from '../../../components/FilterPanel';
import { SearchBar } from '../../../components/SearchBar';
import { ItemCard } from '../../../components/ItemCard';
import { AuthSidebar } from '../../../components/AuthSidebar';
import { AuthenticatedSidebar } from '../../../components/AuthenticatedSidebar';
import { usePlayerProfileStore } from '../../../stores/playerProfileStore';

/**
 * Sample mock data for item listings
 * In a real application, this would come from an API or store
 */
const MOCK_ITEMS = [
  {
    id: '1',
    title: 'Legend of Zelda: Breath of the Wild',
    price: 45.99,
    imageUrl: 'https://placehold.co/300x200?text=Zelda+BOTW',
    seller: 'GameTreasure',
    description: 'Like new condition. Complete in box with all original accessories.',
    location: 'Seattle, WA'
  },
  {
    id: '2',
    title: 'Magic: The Gathering Rare Card Bundle',
    price: 89.99,
    imageUrl: 'https://placehold.co/300x200?text=MTG+Bundle',
    seller: 'CardWizard',
    description: 'Collection of 20 rare cards from recent sets. Perfect for collectors.',
    location: 'Portland, OR'
  },
  {
    id: '3',
    title: 'Pro Gaming Session - Valorant Coaching',
    price: 25.00,
    imageUrl: 'https://placehold.co/300x200?text=Valorant+Coaching',
    seller: 'ProGamerXYZ',
    description: '1-hour coaching session with a professional Valorant player. Learn strategies and improve your skills.',
    location: 'Remote'
  },
  {
    id: '4',
    title: 'PlayStation 5 Console',
    price: 499.99,
    imageUrl: 'https://placehold.co/300x200?text=PS5',
    seller: 'GameStation',
    description: 'Brand new, sealed PlayStation 5 disc edition. Comes with controller and cables.',
    location: 'Chicago, IL'
  },
  {
    id: '5',
    title: 'Dungeons & Dragons Starter Set',
    price: 19.99,
    imageUrl: 'https://placehold.co/300x200?text=DnD+Starter',
    seller: 'TableTopTreasures',
    description: 'Perfect for new players. Includes rule book, pre-generated characters, and adventure module.',
    location: 'Austin, TX'
  },
  {
    id: '6',
    title: 'Custom Gaming PC Build Service',
    price: 150.00,
    imageUrl: 'https://placehold.co/300x200?text=PC+Build+Service',
    seller: 'TechBuilder',
    description: 'I\'ll help you select parts and build your custom gaming PC. Price is for labor only.',
    location: 'Remote'
  },
];

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
  const { profile, isLoading } = usePlayerProfileStore();

  const handleExplore = (slug: string) => {
    navigate(`/explore/${slug}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
    // In a real app, this would trigger a filter or API call
  };
  
  const handleFilterChange = (filters: Record<string, any>) => {
    console.log('Filters changed:', filters);
    // In a real app, this would update a store or trigger an API call
  };
  
  const handleItemClick = (itemId: string) => {
    console.log('Item clicked:', itemId);
    // In a real app, this would navigate to the item detail page
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Filters */}
      <Sidebar title="Filters">
        <FilterPanel onFilterChange={handleFilterChange} />
      </Sidebar>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Gaming Marketplace</h1>
        
        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch} 
          className="mb-8"
        />
        
        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_ITEMS.map(item => (
            <ItemCard
              key={item.id}
              title={item.title}
              price={item.price}
              imageUrl={item.imageUrl}
              seller={item.seller}
              description={item.description}
              location={item.location}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      </main>

      {/* Right Sidebar - Auth */}
      {isLoading ? (
        <div className="w-64 h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : profile ? (
        <AuthenticatedSidebar />
      ) : (
        <AuthSidebar />
      )}
    </div>
  );
};
