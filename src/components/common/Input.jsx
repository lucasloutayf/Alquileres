import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  className,
  type = "text",
  label,
  error,
  success,
  icon: Icon,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="relative w-full group">
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
            "placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-rose-500 focus:ring-rose-500/20" : "border-gray-200 dark:border-gray-700",
            success ? "border-emerald-500 focus:ring-emerald-500/20" : "",
            Icon ? "pl-11" : "",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {Icon && (
          <div className="absolute left-3.5 top-3.5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400">
            <Icon className="h-5 w-5" />
          </div>
        )}

        {label && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none",
              Icon ? "left-11" : "left-4",
              (isFocused || hasValue) 
                ? "-top-2.5 text-xs bg-white dark:bg-gray-900 px-1 text-emerald-600 dark:text-emerald-400 font-medium" 
                : "top-3.5 text-sm text-gray-500 dark:text-gray-400"
            )}
          >
            {label}
          </label>
        )}

        <div className="absolute right-3 top-3.5 flex items-center space-x-2 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <AlertCircle className="h-5 w-5 text-destructive" />
              </motion.div>
            )}
            {success && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[0.8rem] font-medium text-rose-500 mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = "Input";

export default Input;
