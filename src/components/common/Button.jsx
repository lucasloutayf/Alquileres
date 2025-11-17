import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  onClick, 
  disabled,
  type = 'button',
  className = ''
}) => {
  const variants = {
    primary: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 border border-gray-900 dark:border-white',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
