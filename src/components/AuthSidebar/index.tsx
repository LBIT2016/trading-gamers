import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore';
import { PlayerRole } from '../../types/playerProfile';

/**
 * Props for the AuthSidebar component
 */
export interface AuthSidebarProps {
  /**
   * Optional CSS class names to apply to the component
   */
  className?: string;
}

/**
 * A sidebar component for user authentication (login/signup)
 * 
 * @param props - The component props
 * @returns A sidebar with login and signup forms
 */
export const AuthSidebar: React.FC<AuthSidebarProps> = ({ className = '' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  // Use the userStore login/signup methods
  const { login, signup, error, isLoading, user } = useUserStore();

  // Reset local loading state when userStore's loading state changes
  useEffect(() => {
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading]);
  
  // Check if user has been authenticated
  useEffect(() => {
    if (user) {
      // Reset form state when successfully logged in
      setLocalLoading(false);
      setLocalError('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLocalLoading(true);
    
    if (!username || !password) {
      setLocalError('Username and password are required');
      setLocalLoading(false);
      return;
    }
    
    try {
      let success;
      
      if (isLogin) {
        console.log('Attempting login with:', username);
        success = await login(username, password);
      } else {
        // Password validation
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          setLocalLoading(false);
          return;
        }
        
        console.log('Attempting signup with:', username);
        success = await signup(username, password);
      }
      
      console.log('Authentication result:', success);
      
      if (!success) {
        // If login/signup failed but no error was set in the store
        setLocalError(error || `${isLogin ? 'Login' : 'Signup'} failed. Please try again.`);
      }
      
      // Always reset loading after authentication attempt
      setLocalLoading(false);
    } catch (error) {
      console.error('Authentication error:', error);
      setLocalError('Authentication failed. Please try again.');
      setLocalLoading(false);
    }
    
    // Fallback timeout to prevent stuck loading state
    setTimeout(() => {
      setLocalLoading(false);
    }, 3000);
  };

  return (
    <aside className={`w-64 h-screen bg-gray-50 p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
      
      {/* Enhanced error display */}
      {(localError || error) && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
          <p>{localError || error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={localLoading}
        >
          {localLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 text-sm hover:underline focus:outline-none"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </div>
    </aside>
  );
};
