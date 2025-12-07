import React from 'react';
import { motion } from 'framer-motion';

const IsometricBuilding = ({ className, color = "emerald" }) => {
  const colors = {
    emerald: {
      top: "#34d399", // emerald-400
      left: "#059669", // emerald-600
      right: "#10b981", // emerald-500
      window: "#ecfdf5", // emerald-50
    },
    blue: {
      top: "#60a5fa", // blue-400
      left: "#2563eb", // blue-600
      right: "#3b82f6", // blue-500
      window: "#eff6ff", // blue-50
    },
    purple: {
      top: "#a78bfa", // purple-400
      left: "#7c3aed", // purple-600
      right: "#8b5cf6", // purple-500
      window: "#f5f3ff", // purple-50
    },
    amber: {
      top: "#fbbf24", // amber-400
      left: "#d97706", // amber-600
      right: "#f59e0b", // amber-500
      window: "#fffbeb", // amber-50
    }
  };

  const c = colors[color] || colors.emerald;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2 
      }}
    >
      {/* Shadow */}
      <motion.ellipse 
        cx="50" 
        cy="85" 
        rx="30" 
        ry="10" 
        fill="rgba(0,0,0,0.1)"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
      />

      {/* Building Base */}
      <g transform="translate(0, -5)">
        {/* Left Face */}
        <path d="M50 80 L20 65 L20 35 L50 50 Z" fill={c.left} />
        
        {/* Right Face */}
        <path d="M50 80 L80 65 L80 35 L50 50 Z" fill={c.right} />
        
        {/* Top Face */}
        <path d="M50 50 L80 35 L50 20 L20 35 Z" fill={c.top} />

        {/* Windows Left */}
        <rect x="28" y="42" width="6" height="8" transform="skewY(26.5)" fill={c.window} opacity="0.8" />
        <rect x="38" y="47" width="6" height="8" transform="skewY(26.5)" fill={c.window} opacity="0.8" />
        <rect x="28" y="56" width="6" height="8" transform="skewY(26.5)" fill={c.window} opacity="0.8" />
        <rect x="38" y="61" width="6" height="8" transform="skewY(26.5)" fill={c.window} opacity="0.8" />

        {/* Windows Right */}
        <rect x="56" y="47" width="6" height="8" transform="skewY(-26.5)" fill={c.window} opacity="0.6" />
        <rect x="66" y="42" width="6" height="8" transform="skewY(-26.5)" fill={c.window} opacity="0.6" />
        <rect x="56" y="61" width="6" height="8" transform="skewY(-26.5)" fill={c.window} opacity="0.6" />
        <rect x="66" y="56" width="6" height="8" transform="skewY(-26.5)" fill={c.window} opacity="0.6" />
      </g>
    </motion.svg>
  );
};

export default IsometricBuilding;
