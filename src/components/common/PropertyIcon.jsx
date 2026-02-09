import React from 'react';
import { motion } from 'framer-motion';

const PropertyIcon = ({ className, color = "emerald" }) => {
  const colors = {
    emerald: {
      primary: "#10b981", // emerald-500
      secondary: "#34d399", // emerald-400
      accent: "#059669", // emerald-600
      window: "#ecfdf5", // emerald-50
      glass: "rgba(16, 185, 129, 0.15)",
    },
    blue: {
      primary: "#3b82f6", // blue-500
      secondary: "#60a5fa", // blue-400
      accent: "#2563eb", // blue-600
      window: "#eff6ff", // blue-50
      glass: "rgba(59, 130, 246, 0.15)",
    },
    purple: {
      primary: "#8b5cf6", // purple-500
      secondary: "#a78bfa", // purple-400
      accent: "#7c3aed", // purple-600
      window: "#f5f3ff", // purple-50
      glass: "rgba(139, 92, 246, 0.15)",
    },
    amber: {
      primary: "#f59e0b", // amber-500
      secondary: "#fbbf24", // amber-400
      accent: "#d97706", // amber-600
      window: "#fffbeb", // amber-50
      glass: "rgba(245, 158, 11, 0.15)",
    }
  };

  const c = colors[color] || colors.emerald;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.1 
      }}
    >
      {/* Glow Effect */}
      <defs>
        <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.secondary} />
          <stop offset="100%" stopColor={c.accent} />
        </linearGradient>
      </defs>
      
      {/* Ground Shadow */}
      <motion.ellipse 
        cx="50" 
        cy="88" 
        rx="28" 
        ry="6" 
        fill={c.primary}
        opacity="0.2"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ delay: 0.3 }}
      />

      <g transform="translate(0, -2)">
        {/* Main Building Structure - Modern House Shape */}
        <motion.path
          d="M 50 15 L 85 40 L 85 80 Q 85 85 80 85 L 20 85 Q 15 85 15 80 L 15 40 L 50 15 Z"
          fill={c.glass}
          stroke={c.primary}
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Roof Fill - for depth */}
        <path 
          d="M 50 15 L 85 40 L 15 40 Z" 
          fill={`url(#grad-${color})`}
          opacity="0.9"
        />

        {/* Chimney */}
        <path
          d="M 70 25 L 70 15 L 78 15 L 78 31"
          fill={c.secondary}
          stroke={c.accent}
          strokeWidth="0"
        />

        {/* Door */}
        <rect 
          x="42" 
          y="55" 
          width="16" 
          height="30" 
          rx="2"
          fill={c.primary} 
          opacity="0.9"
        />
        
        {/* Windows */}
        <rect x="25" y="50" width="12" height="12" rx="2" fill={c.window} stroke={c.primary} strokeWidth="1.5" />
        <rect x="63" y="50" width="12" height="12" rx="2" fill={c.window} stroke={c.primary} strokeWidth="1.5" />
        
         {/* Attic Window (Circular) */}
        <circle cx="50" cy="32" r="5" fill={c.window} stroke={c.platform} strokeWidth="0" opacity="0.8" />


        {/* Decorative Lines/accents */}
        <path d="M 22 85 L 78 85" stroke={c.accent} strokeWidth="2" strokeLinecap="round" />

      </g>
    </motion.svg>
  );
};

export default PropertyIcon;
