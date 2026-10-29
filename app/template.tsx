'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Transisi halaman ringan (Fase 5). Next.js me-mount ulang template setiap
 * navigasi, jadi fade+slide pendek di sini sudah cukup — tanpa AnimatePresence
 * dan tanpa menahan render halaman berikutnya.
 *
 * Penampakan bertahap antar-seksi tetap ditangani `FadeIn` di dalam halaman,
 * jadi keduanya sengaja dibuat pendek supaya tidak terasa berlipat.
 */
export default function Template({ children }: { children: ReactNode }) {
  const kurangiGerak = useReducedMotion();

  return (
    <motion.div
      initial={kurangiGerak ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={kurangiGerak ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
