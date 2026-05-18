'use client'

import { motion } from 'framer-motion'

/**
 * A 3D milk bottle component using pure CSS 3D transforms.
 * Decorative element with slow rotation, glass effect, and green/white color scheme.
 */
export function MilkBottle3D() {
  return (
    <div className="perspective-[800px] flex items-center justify-center" style={{ perspective: '800px' }}>
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Main bottle body */}
        <div
          className="relative w-16 h-28 sm:w-20 sm:h-36"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 rounded-b-2xl rounded-t-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(220,252,231,0.9) 50%, rgba(134,239,172,0.85) 100%)',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset -4px -4px 12px rgba(0,0,0,0.06), inset 4px 4px 12px rgba(255,255,255,0.8), 0 8px 32px rgba(34,197,94,0.15)',
              border: '1px solid rgba(74,222,128,0.3)',
            }}
          >
            {/* Glass reflection */}
            <div
              className="absolute top-2 left-1.5 w-3 h-16 sm:w-4 sm:h-20 rounded-full opacity-40"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
              }}
            />
            {/* Label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-6 sm:w-12 sm:h-7 rounded-sm bg-white/80 border border-green-200 flex items-center justify-center">
              <span className="text-[6px] sm:text-[7px] font-bold text-green-600 tracking-wider">MILK</span>
            </div>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 rounded-b-2xl rounded-t-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(187,247,208,0.9) 0%, rgba(134,239,172,0.85) 50%, rgba(74,222,128,0.8) 100%)',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset 4px -4px 12px rgba(0,0,0,0.06), inset -4px 4px 12px rgba(255,255,255,0.4)',
              border: '1px solid rgba(74,222,128,0.3)',
            }}
          />

          {/* Left face */}
          <div
            className="absolute top-0 left-0 w-3 h-full rounded-l-sm"
            style={{
              background: 'linear-gradient(90deg, rgba(74,222,128,0.7) 0%, rgba(134,239,172,0.8) 100%)',
              transform: 'rotateY(-90deg) translateX(-6px)',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
            }}
          />

          {/* Right face */}
          <div
            className="absolute top-0 right-0 w-3 h-full rounded-r-sm"
            style={{
              background: 'linear-gradient(90deg, rgba(134,239,172,0.8) 0%, rgba(74,222,128,0.7) 100%)',
              transform: 'rotateY(90deg) translateX(6px)',
              transformOrigin: 'right center',
              backfaceVisibility: 'hidden',
            }}
          />

          {/* Bottle cap */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 sm:w-10 sm:h-5 rounded-t-md"
            style={{
              background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
              boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
            }}
          />

          {/* Bottle neck */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 sm:w-7 sm:h-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(220,252,231,0.85) 100%)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderTop: 'none',
            }}
          />

          {/* Milk drop floating near the bottle */}
          <motion.div
            className="absolute -right-5 top-4 sm:-right-7 sm:top-5"
            animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 0C8 0 0 10 0 14.5C0 18.6 3.6 22 8 22C12.4 22 16 18.6 16 14.5C16 10 8 0 8 0Z"
                fill="url(#dropGrad3d)"
                stroke="rgba(74,222,128,0.4)"
                strokeWidth="0.5"
              />
              <ellipse cx="5.5" cy="14" rx="2.5" ry="3.5" fill="white" opacity="0.3" />
              <defs>
                <linearGradient id="dropGrad3d" x1="0" y1="0" x2="16" y2="22">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* Shadow underneath */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 sm:w-24 sm:h-4 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>
    </div>
  )
}
