import React from 'react';
import { usePlayerProfileStore } from '../../stores/playerProfileStore';
import { PlayerRole } from '../../types/playerProfile';

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
  const { profile, clearProfile } = usePlayerProfileStore();
  
  // Guard clause for type safety
  if (!profile) {
    return null;
  }
  
  const handleLogout = () => {
    clearProfile();
  };
  
  const isSeller = profile.roles.includes(PlayerRole.SELLER);
  const isServiceProvider = profile.roles.includes(PlayerRole.SERVICE_PROVIDER);
  
  return (
    <aside className={`w-64 h-screen bg-gray-50 p-4 ${className}`}>
      <div className="flex items-center mb-6">
        {profile.profileImageUrl ? (
          <img 
            src={profile.profileImageUrl} 
            alt="Profile" 
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold">{profile.username}</h2>
          <p className="text-sm text-gray-600">
            {profile.roles.map(role => 
              role.charAt(0).toUpperCase() + role.slice(1)
            ).join(', ')}
          </p>
        </div>
      </div>
      
      <nav className="space-y-1 mb-6">
        <a href="#" className="block p-2 hover:bg-gray-100 rounded">My Profile</a>
        <a href="#" className="block p-2 hover:bg-gray-100 rounded">Messages</a>
        <a href="#" className="block p-2 hover:bg-gray-100 rounded">Wishlist</a>
        <a href="#" className="block p-2 hover:bg-gray-100 rounded">Purchase History</a>
        
        {isSeller && (
          <>
            <div className="pt-2 border-t border-gray-200 mt-2">
              <h3 className="font-medium text-sm mb-1">Seller Tools</h3>
            </div>
            <a href="#" className="block p-2 hover:bg-gray-100 rounded">My Listings</a>
            <a href="#" className="block p-2 hover:bg-gray-100 rounded">Sell an Item</a>
          </>
        )}
        
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
  );
};
