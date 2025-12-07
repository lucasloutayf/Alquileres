import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const buttonVariants = {
  default: "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-lg shadow-emerald-500/20",
  destructive: "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 shadow-lg shadow-rose-500/20",
  outline: "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
  secondary: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
  link: "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline",
  glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-glass",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  isLoading = false, 
  children, 
  disabled,
  type = "button",
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;
