import React, { useState } from 'react';

/**
 * Props for the SearchBar component
 */
export interface SearchBarProps {
  /**
   * Placeholder text to display when search input is empty
   */
  placeholder?: string;
  /**
   * Handler for when the search query changes
   */
  onSearch?: (query: string) => void;
  /**
   * Optional CSS class names to apply to the component
   */
  className?: string;
}

/**
 * A search input component with search button
 * 
 * @param props - The component props
 * @returns A search bar component
 */
export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search for games, cards, or services...', 
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex w-full ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
};
