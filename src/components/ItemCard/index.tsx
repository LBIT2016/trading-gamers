import React from 'react';

/**
 * Props for the ItemCard component
 */
export interface ItemCardProps {
  /**
   * Unique ID for the item
   */
  itemId: string;
  /**
   * Title of the item
   */
  title: string;
  /**
   * Price of the item
   */
  price: number;
  /**
   * URL to the item's image
   */
  imageUrl: string;
  /**
   * Seller's username
   */
  seller: string;
  /**
   * Brief description of the item
   */
  description: string;
  /**
   * Location of the item/seller
   */
  location?: string;
  /**
   * Handler for when the card is clicked
   */
  onClick?: () => void;
}

/**
 * A card component for displaying marketplace items
 * 
 * @param props - The component props
 * @returns A card displaying item details with image
 */
export const ItemCard: React.FC<ItemCardProps> = ({
  itemId,
  title,
  price,
  imageUrl,
  seller,
  description,
  location,
  onClick
}) => {
  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      data-item-id={itemId}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-blue-600 font-bold mt-1">${price.toFixed(2)}</p>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">By: {seller}</span>
          {location && <span className="text-sm text-gray-500">{location}</span>}
        </div>
      </div>
    </div>
  );
};
