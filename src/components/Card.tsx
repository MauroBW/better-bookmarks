import React from "react";
import { motion } from "framer-motion";

type CardProps = React.ComponentProps<typeof motion.div> & {
  className?: string;
};

const Card: React.FC<CardProps> = ({ className = "", children, ...props }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border border-card bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
