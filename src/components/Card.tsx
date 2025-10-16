import React from "react";
import { motion } from "framer-motion";

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative rounded-2xl border border-card bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md ${className}`}
  >
    {children}
  </motion.div>
);

export default Card;
