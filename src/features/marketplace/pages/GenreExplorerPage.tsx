import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import { Listing } from '../types/marketplace.types';

export const GenreExplorerPage: React.FC = () => {
  const { genre } = useParams<{ genre: string }>();
  const navigate = useNavigate();
  
  const getMockListings = (genre: string): Listing[] => {
    switch(genre?.toLowerCase()) {
      case 'video-games':
        return [
          {
            id: 'zelda-1',
            title: 'The Legend of Zelda: Tears of the Kingdom',
            description: 'Latest Zelda game for Nintendo Switch, mint condition',
            price: 59.99,
            type: 'PRODUCT',
            category: 'video-games',
            imageUrl: 'https://example.com/zelda-totk.jpg',
            seller: { id: 'seller1', name: 'Nintendo Store', rating: 4.9 }
          }
        ];
      
      case 'board-games':
        return [
          {
            id: 'pokemon-1',
            title: 'Pokemon Trading Card Game: Scarlet & Violet',
            description: 'Sealed booster box, latest edition',
            price: 120,
            type: 'PRODUCT',
            category: 'board-games',
            imageUrl: 'https://example.com/pokemon-tcg.jpg',
            seller: { id: 'seller2', name: 'Card Master', rating: 4.8 }
          }
        ];
      
      case 'gaming-services':
        return [
          {
            id: 'gm-1',
            title: 'Professional Game Mastering Services',
            description: 'Experienced GM for your D&D campaigns',
            price: 25,
            type: 'SERVICE',
            category: 'gaming-services',
            imageUrl: 'https://example.com/gm-service.jpg',
            seller: { id: 'seller3', name: 'Master DM', rating: 4.7 }
          }
        ];
      
      default:
        return [];
    }
  };

  const mockListings = getMockListings(genre || '');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {genre?.replace('-', ' ')}
            </h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex space-x-4">
            <select className="rounded-md border-gray-300">
              <option>Sort by</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Recent</option>
            </select>
            <select className="rounded-md border-gray-300">
              <option>All Types</option>
              <option>Products</option>
              <option>Services</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
    </div>
  );
};
