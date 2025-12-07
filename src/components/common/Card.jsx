import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ 
  className, 
  children, 
  hover3d = false,
  glass = false,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={hover3d ? { rotateX: 0, rotateY: 0, z: 0 } : undefined}
      whileHover={hover3d ? { 
        y: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 -2px 6px 0 rgba(255, 255, 255, 0.1) inset"
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        glass && "bg-white/70 dark:bg-black/40 backdrop-blur-xl border-white/20 shadow-glass",
        hover3d && "transform-gpu transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
