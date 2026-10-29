'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Transisi masuk yang ringan — sengaja sederhana, sesuai TECH-SPEC bagian 6. */
export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const kurangiGerak = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={kurangiGerak ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        kurangiGerak ? { duration: 0 } : { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
