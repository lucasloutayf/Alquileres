import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ 
  children, 
  className, 
  direction = 'up', 
  delay = 0, 
  duration = 0.5,
  distance = 30,
  threshold = 0.1
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
      x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for smooth ease-out
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
