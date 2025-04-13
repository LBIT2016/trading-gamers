import React from 'react';

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /**
   * Title text to display at the top of the sidebar
   */
  title: string;
  /**
   * Children elements to be rendered within the sidebar
   */
  children: React.ReactNode;
  /**
   * Optional CSS class names to apply to the component
   */
  className?: string;
}

/**
 * A sidebar container component that can be used for filter panels or navigation
 * 
 * @param props - The component props
 * @returns A sidebar container with title and content
 */
export const Sidebar: React.FC<SidebarProps> = ({ title, children, className = '' }) => {
  return (
    <aside className={`w-64 h-screen bg-gray-100 p-4 overflow-y-auto ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </aside>
  );
};
