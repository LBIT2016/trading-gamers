import React, { useState } from 'react';
import { Listing, ItemCondition, ListingType } from '../../stores/listingStore';
import { useUserStore } from '../../stores/userStore';

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ 
  listing, 
  onClose 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { getCurrentUser } = useUserStore();
  const currentUser = getCurrentUser();
  
  // Find the primary image or use the first one
  const primaryImageIndex = listing.images.findIndex(img => img.isPrimary);
  const initialImageIndex = primaryImageIndex >= 0 ? primaryImageIndex : 0;
  
  // Format the date to a readable string
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get a readable condition string
  const getConditionText = (condition?: ItemCondition) => {
    if (!condition) return 'Not specified';
    
    switch (condition) {
      case ItemCondition.NEW:
        return 'New';
      case ItemCondition.LIKE_NEW:
        return 'Like New';
      case ItemCondition.GOOD:
        return 'Used - Good';
      case ItemCondition.FAIR:
        return 'Used - Fair';
      case ItemCondition.FOR_PARTS:
        return 'For Parts Only';
      default:
        return condition.replace('_', ' ');
    }
  };
  
  // Get a readable listing type string
  const getListingTypeText = (type: ListingType) => {
    switch (type) {
      case ListingType.SELL:
        return 'For Sale';
      case ListingType.BUY:
        return 'Wanted';
      case ListingType.TRADE:
        return 'For Trade';
      case ListingType.OFFER_SERVICE:
        return 'Service Offered';
      case ListingType.REQUEST_SERVICE:
        return 'Service Wanted';
      default:
        return type.replace('_', ' ');
    }
  };
  
  // Check if this is the user's own listing
  const isOwnListing = currentUser?.id === listing.sellerId;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">{listing.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Images section */}
            <div className="md:w-1/2">
              {listing.images.length > 0 ? (
                <>
                  <div className="h-64 md:h-80 overflow-hidden rounded-lg border">
                    <img 
                      src={listing.images[currentImageIndex].url} 
                      alt={listing.title} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Thumbnail gallery if more than one image */}
                  {listing.images.length > 1 && (
                    <div className="flex mt-2 gap-2 overflow-x-auto">
                      {listing.images.map((image, index) => (
                        <button
                          key={image.id}
                          className={`w-20 h-20 flex-shrink-0 rounded border-2 ${
                            index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img 
                            src={image.url} 
                            alt={`${listing.title} thumbnail ${index + 1}`} 
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-64 md:h-80 flex items-center justify-center bg-gray-100 rounded-lg border">
                  <span className="text-gray-400">No images available</span>
                </div>
              )}
            </div>
            
            {/* Details section */}
            <div className="md:w-1/2">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <p className="text-2xl font-bold text-blue-600">${parseFloat(listing.price).toFixed(2)}</p>
              </div>
              
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                  {getListingTypeText(listing.listingType)}
                </span>
              </div>
              
              <p className="mt-4 text-gray-600">{listing.shortDescription}</p>
              
              <div className="mt-6 bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{listing.category.replace('_', ' ')}</span>
                  </li>
                  
                  {listing.condition && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium">{getConditionText(listing.condition)}</span>
                    </li>
                  )}
                  
                  <li className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{listing.isRemote ? 'Remote/Online' : listing.location}</span>
                  </li>
                  
                  <li className="flex justify-between">
                    <span className="text-gray-600">Listed on:</span>
                    <span className="font-medium">{formatDate(listing.createdAt)}</span>
                  </li>
                  
                  {listing.tags.length > 0 && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Tags:</span>
                      <div className="flex flex-wrap justify-end gap-1">
                        {listing.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Seller Information</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                    {listing.sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{listing.sellerName}</p>
                    {listing.isRemote ? (
                      <p className="text-sm text-gray-500">Remote/Online</p>
                    ) : (
                      <p className="text-sm text-gray-500">{listing.location}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-2">
                {!isOwnListing && (
                  <button
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Contact Seller
                  </button>
                )}
                
                {isOwnListing && (
                  <>
                    <button
                      className="flex-1 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      Edit Listing
                    </button>
                    <button
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Detailed description section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">Description</h3>
            <div className="text-gray-700 whitespace-pre-line">
              {listing.detailedDescription || 'No detailed description provided.'}
            </div>
          </div>
          
          {/* Contact section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="font-medium text-yellow-800">Contact method provided by seller:</p>
              <p className="mt-1 text-gray-700">{listing.contactInfo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
