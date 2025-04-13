import { create } from 'zustand';
import { sync } from '@tonk/keepsync';
import { useUserStore } from './userStore';

/**
 * Enum for listing types
 */
export enum ListingType {
  SELL = 'sell',
  BUY = 'buy',
  TRADE = 'trade',
  OFFER_SERVICE = 'offer_service',
  REQUEST_SERVICE = 'request_service'
}

/**
 * Enum for item categories
 */
export enum ItemCategory {
  VIDEO_GAME = 'video_game',
  BOARD_GAME = 'board_game',
  CONSOLE = 'console',
  ACCESSORY = 'accessory',
  COLLECTIBLE = 'collectible',
  OTHER = 'other'
}

/**
 * Enum for service categories
 */
export enum ServiceCategory {
  COACHING = 'coaching',
  GAME_MASTER = 'game_master',
  MEDIATION = 'mediation',
  OTHER = 'other'
}

/**
 * Enum for item conditions
 */
export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  FOR_PARTS = 'for_parts'
}

/**
 * Interface for image data
 */
export interface ListingImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

/**
 * Main listing interface
 */
export interface Listing {
  id: string;
  createdAt: number;
  updatedAt: number;
  sellerId: string;
  sellerName: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  listingType: ListingType;
  category: ItemCategory | ServiceCategory;
  price: string;
  condition?: ItemCondition;
  location: string;
  isRemote: boolean;
  contactInfo: string;
  tags: string[];
  images: ListingImage[];
  status: 'active' | 'pending' | 'sold' | 'inactive';
}

/**
 * Form data used for creating/updating listings
 */
export interface ListingFormData {
  listingType: ListingType;
  category: ItemCategory | ServiceCategory;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  price: string;
  condition?: ItemCondition;
  location: string;
  isRemote: boolean;
  contactInfo: string;
  tags: string;
}

/**
 * Store state interface
 */
interface ListingState {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
  
  // Selectors
  getListingById: (id: string) => Listing | undefined;
  getListingsBySeller: (sellerId: string) => Listing[];
  getActiveListings: () => Listing[];
  
  // Actions
  createListing: (formData: ListingFormData, imageFiles: File[]) => Promise<Listing>;
  updateListing: (id: string, formData: Partial<ListingFormData>, imageFiles?: File[]) => Promise<Listing | null>;
  deleteListing: (id: string) => Promise<boolean>;
  setListingStatus: (id: string, status: Listing['status']) => Promise<boolean>;
}

/**
 * Generate a random ID
 */
const generateId = () => Math.random().toString(36).substring(2, 15);

/**
 * Create a mock URL for an image file
 */
const createMockImageUrl = (file: File) => {
  // Check if this file has a custom URL attached (used for direct image URLs)
  if ('customUrl' in file) {
    return (file as any).customUrl;
  }
  
  // In a real app, this would upload to a server and return a URL
  // For now, we'll just use a mock URL based on the file name
  return `https://placehold.co/300x200?text=${encodeURIComponent(file.name)}`;
};

/**
 * Create a default image when no images are provided
 */
const createDefaultImage = (): ListingImage => {
  // Generate a random game-related placeholder
  const gameNames = ['Zelda', 'Mario', 'Minecraft', 'Fortnite', 'Pokemon', 'FIFA'];
  const randomGame = gameNames[Math.floor(Math.random() * gameNames.length)];
  
  return {
    id: generateId(),
    url: `https://placehold.co/300x200?text=${encodeURIComponent(randomGame)}`,
    isPrimary: true
  };
};

/**
 * Create the listing store
 */
export const useListingStore = create<ListingState>(
  sync(
    (set, get) => ({
      listings: [],
      isLoading: false,
      error: null,
      
      // Selectors
      getListingById: (id) => {
        return get().listings.find(listing => listing.id === id);
      },
      
      getListingsBySeller: (sellerId) => {
        return get().listings.filter(listing => listing.sellerId === sellerId);
      },
      
      getActiveListings: () => {
        return get().listings.filter(listing => listing.status === 'active');
      },
      
      // Actions
      createListing: async (formData, imageFiles) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = useUserStore.getState().getCurrentUser();
          
          if (!currentUser) {
            throw new Error('You must be logged in to create a listing');
          }
          
          // Convert tags string to array
          const tagsArray = formData.tags
            ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : [];
          
          // Create mock image URLs (in a real app, this would upload to a server)
          let images: ListingImage[] = [];
          
          if (imageFiles && imageFiles.length > 0) {
            images = await Promise.all(
              imageFiles.map(async (file, index) => {
                const url = createMockImageUrl(file);
                return {
                  id: generateId(),
                  url,
                  isPrimary: index === 0
                };
              })
            );
          } else {
            // Add a default image if none provided
            images = [createDefaultImage()];
          }
          
          // Create new listing
          const newListing: Listing = {
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sellerId: currentUser.id,
            sellerName: currentUser.name,
            title: formData.title,
            shortDescription: formData.shortDescription,
            detailedDescription: formData.detailedDescription,
            listingType: formData.listingType,
            category: formData.category,
            price: formData.price,
            condition: formData.condition,
            location: formData.location,
            isRemote: formData.isRemote,
            contactInfo: formData.contactInfo,
            tags: tagsArray,
            images: images,
            status: 'active'
          };
          
          // Add to listings
          set(state => ({
            listings: [...state.listings, newListing],
            isLoading: false
          }));
          
          console.log('Created new listing:', newListing);
          
          return newListing;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create listing';
          console.error('Error creating listing:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      updateListing: async (id, formData, imageFiles = []) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = useUserStore.getState().getCurrentUser();
          
          if (!currentUser) {
            throw new Error('You must be logged in to update a listing');
          }
          
          // Find the listing to update
          const listing = get().getListingById(id);
          
          if (!listing) {
            throw new Error('Listing not found');
          }
          
          // Verify ownership
          if (listing.sellerId !== currentUser.id) {
            throw new Error('You can only update your own listings');
          }
          
          // Process tags if provided
          let tagsArray = listing.tags;
          if (formData.tags !== undefined) {
            tagsArray = formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean);
          }
          
          // Process new images if provided
          let updatedImages = [...listing.images];
          
          if (imageFiles.length > 0) {
            const newImages: ListingImage[] = await Promise.all(
              imageFiles.map(async (file) => {
                const url = createMockImageUrl(file);
                return {
                  id: generateId(),
                  url,
                  isPrimary: false
                };
              })
            );
            
            updatedImages = [...updatedImages, ...newImages];
            
            // Ensure there's a primary image
            if (!updatedImages.some(img => img.isPrimary) && updatedImages.length > 0) {
              updatedImages[0].isPrimary = true;
            }
          }
          
          // Update the listing
          const updatedListing: Listing = {
            ...listing,
            ...formData,
            tags: tagsArray,
            images: updatedImages,
            updatedAt: Date.now()
          };
          
          // Update in state
          set(state => ({
            listings: state.listings.map(l => 
              l.id === id ? updatedListing : l
            ),
            isLoading: false
          }));
          
          console.log('Updated listing:', updatedListing);
          
          return updatedListing;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update listing';
          console.error('Error updating listing:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },
      
      deleteListing: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = useUserStore.getState().getCurrentUser();
          
          if (!currentUser) {
            throw new Error('You must be logged in to delete a listing');
          }
          
          // Find the listing to delete
          const listing = get().getListingById(id);
          
          if (!listing) {
            throw new Error('Listing not found');
          }
          
          // Verify ownership
          if (listing.sellerId !== currentUser.id) {
            throw new Error('You can only delete your own listings');
          }
          
          // Remove from state
          set(state => ({
            listings: state.listings.filter(l => l.id !== id),
            isLoading: false
          }));
          
          console.log('Deleted listing:', id);
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete listing';
          console.error('Error deleting listing:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      setListingStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = useUserStore.getState().getCurrentUser();
          
          if (!currentUser) {
            throw new Error('You must be logged in to update a listing status');
          }
          
          // Find the listing to update
          const listing = get().getListingById(id);
          
          if (!listing) {
            throw new Error('Listing not found');
          }
          
          // Verify ownership
          if (listing.sellerId !== currentUser.id) {
            throw new Error('You can only update your own listings');
          }
          
          // Update status
          set(state => ({
            listings: state.listings.map(l => 
              l.id === id ? { ...l, status, updatedAt: Date.now() } : l
            ),
            isLoading: false
          }));
          
          console.log(`Updated listing ${id} status to: ${status}`);
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update listing status';
          console.error('Error updating listing status:', errorMessage);
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      }
    }),
    {
      docId: "marketplace-listings",
      initTimeout: 30000,
      onInitError: (error) => {
        console.error("Listing sync initialization error:", error);
      }
    }
  )
);
