import React from 'react';
import { Listing } from '../types/marketplace.types';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {listing.imageUrl && (
        <img 
          src={listing.imageUrl} 
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{listing.title}</h3>
        <p className="text-gray-600 mt-1">{listing.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold">${listing.price}</span>
          <span className="text-sm text-gray-500">{listing.type}</span>
        </div>
        <div className="mt-2 flex items-center">
          <span className="text-sm text-gray-500">By {listing.seller.name}</span>
          <span className="ml-2">⭐ {listing.seller.rating}</span>
        </div>
      </div>
    </div>
  );
};
