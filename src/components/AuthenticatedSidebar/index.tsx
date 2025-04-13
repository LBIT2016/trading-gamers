import React, { useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { PlayerRole } from '../../types/playerProfile';
import { ListingCreationModal } from '../ListingCreationModal';

/**
 * Props for the AuthenticatedSidebar component
 */
export interface AuthenticatedSidebarProps {
  /**
   * Optional CSS class names to apply to the component
   */
  className?: string;
}

/**
 * A sidebar component for authenticated users showing profile info and actions
 * 
 * @param props - The component props
 * @returns A sidebar with authenticated user information and options
 */
export const AuthenticatedSidebar: React.FC<AuthenticatedSidebarProps> = ({ className = '' }) => {
  const { getCurrentUser, logout } = useUserStore();
  const currentUser = getCurrentUser();
  const [showListingModal, setShowListingModal] = useState(false);
  
  // Guard clause for type safety
  if (!currentUser) {
    return null;
  }
  
  const handleLogout = () => {
    logout();
  };
  
  const handleCreateListing = () => {
    setShowListingModal(true);
  };
  
  // Default roles if not specified
  const roles = currentUser.roles || ['user'];
  const isSeller = roles.includes(PlayerRole.SELLER);
  const isServiceProvider = roles.includes(PlayerRole.SERVICE_PROVIDER);
  
  return (
    <>
      <aside className={`w-64 h-screen bg-gray-50 p-4 ${className}`}>
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{currentUser.name}</h2>
            <p className="text-sm text-gray-600">
              {currentUser.isAdmin ? 'Administrator' : 'Member'}
            </p>
          </div>
        </div>
        
        <nav className="space-y-1 mb-6">
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">My Profile</a>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">Messages</a>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">Wishlist</a>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded">Purchase History</a>
          
          {/* Always show the Sell an Item button, regardless of role */}
          <div className="pt-2 border-t border-gray-200 mt-2">
            <h3 className="font-medium text-sm mb-1">Seller Tools</h3>
          </div>
          {isSeller && (
            <a href="#" className="block p-2 hover:bg-gray-100 rounded">My Listings</a>
          )}
          <button 
            onClick={handleCreateListing}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded text-blue-600 font-medium"
          >
            Sell an Item
          </button>
          
          {isServiceProvider && (
            <>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <h3 className="font-medium text-sm mb-1">Service Provider Tools</h3>
              </div>
              <a href="#" className="block p-2 hover:bg-gray-100 rounded">My Services</a>
              <a href="#" className="block p-2 hover:bg-gray-100 rounded">Offer a Service</a>
            </>
          )}
        </nav>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-center p-2 text-red-600 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {showListingModal && (
        <ListingCreationModal 
          onClose={() => setShowListingModal(false)}
        />
      )}
    </>
  );
};
