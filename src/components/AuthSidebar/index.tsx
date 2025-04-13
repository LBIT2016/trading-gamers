import React, { useState } from 'react';
import { usePlayerProfileStore } from '../../stores/playerProfileStore';
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
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get store actions for authentication
  const { setProfile, setLoading, setError } = usePlayerProfileStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      if (isLogin) {
        // Handle login
        // In a real implementation, this would call an API
        console.log('Login attempt', { username, password });
        
        // Mock successful login (replace with actual API call)
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock profile (in real app, this would come from API)
        const mockProfile = {
          player_id: '12345',
          username: username,
          email: `${username}@example.com`, // Generate mock email
          passwordHash: 'hashed_password_would_not_be_returned',
          roles: [PlayerRole.BUYER],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setProfile(mockProfile);
        setLoading(false);
      } else {
        // Handle signup
        if (!username || !password) {
          setErrorMessage('Username and password are required');
          return;
        }
        
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters');
          return;
        }
        
        console.log('Signup attempt', { username, password });
        
        // Mock successful signup (replace with actual API call)
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock profile (in real app, this would come from API)
        const mockProfile = {
          player_id: '12345',
          username: username,
          email: `${username}@example.com`, // Generate mock email
          passwordHash: 'hashed_password_would_not_be_returned',
          roles: [PlayerRole.BUYER],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setProfile(mockProfile);
        setLoading(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrorMessage('Authentication failed. Please try again.');
      setError('Authentication failed');
      setLoading(false);
    }
  };

  return (
    <aside className={`w-64 h-screen bg-gray-50 p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
          <p>{errorMessage}</p>
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
        >
          {isLogin ? 'Login' : 'Sign Up'}
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
