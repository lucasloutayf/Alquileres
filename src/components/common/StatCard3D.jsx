import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn'; // Assuming I'll create this utility or use the one in Button/Card

const StatCard3D = ({ title, value, icon, colorClass, trend }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  
  const getColorClasses = () => {
    const colorMap = {
      primary: 'from-primary/80 to-primary shadow-primary/20',
      secondary: 'from-secondary/80 to-secondary shadow-secondary/20',
      accent: 'from-accent/80 to-accent shadow-accent/20',
      green: 'from-emerald-500/80 to-emerald-600 shadow-emerald-500/20',
      red: 'from-rose-500/80 to-rose-600 shadow-rose-500/20',
      blue: 'from-blue-500/80 to-blue-600 shadow-blue-500/20',
      yellow: 'from-amber-500/80 to-amber-600 shadow-amber-500/20',
      orange: 'from-orange-600 to-orange-700 shadow-orange-500/20', // Fixed: darker, opaque gradient for better contrast
      purple: 'from-purple-500/80 to-purple-600 shadow-purple-500/20',
    };
    return colorMap[colorClass] || 'from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-gray-200 dark:border-gray-700';
  };

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8; 
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-xl p-6 overflow-hidden",
        "bg-gradient-to-br shadow-lg transition-all duration-200 ease-out",
        getColorClasses()
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
      
      {/* Shine effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ mixBlendMode: 'overlay' }}
      />

      <div className={cn(
        "relative z-10 flex flex-col h-full justify-between",
        colorClass ? "text-white" : "text-gray-900 dark:text-white"
      )}>
        <div className="flex justify-between items-start">
          <div className={cn(
            "p-3 backdrop-blur-md rounded-xl shadow-inner-light",
            colorClass ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
          )}>
            {React.cloneElement(icon, { className: cn('w-6 h-6', colorClass ? 'text-white' : 'text-gray-600 dark:text-gray-300') })}
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full backdrop-blur-md",
              colorClass ? "bg-white/20 text-emerald-100" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        
        <div className="mt-4">
          <p className={cn(
            "text-sm font-medium uppercase tracking-wider mb-1",
            colorClass ? "text-white/80" : "text-gray-500 dark:text-gray-400"
          )}>
            {title}
          </p>
          <h3 className={cn(
            "text-3xl font-bold tracking-tight font-display",
            colorClass ? "text-white" : "text-gray-900 dark:text-white"
          )}>
            {value}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard3D;
