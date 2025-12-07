import React from 'react';
import { cn } from '../../utils/cn';

const ThemeAwareCard = ({ children, className = '' }) => {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm",
      className
    )}>
      {children}
    </div>
  );
};

export default ThemeAwareCard;
