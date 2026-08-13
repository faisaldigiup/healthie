import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import type { Point } from '#/lib/types'

const COLORS = ['#552bd8', '#8f76f4', '#c0f5e6', '#0aaee2', '#080f1e', '#ffffff']

type Particle = {
  id: number
  dx: number
  dy: number
  rotate: number
  color: string
  size: number
  borderRadius: string
}

function createParticles(): Array<Particle> {
  return Array.from({ length: 42 }, (_, id) => {
    const angle = (Math.PI * 2 * id) / 42 + Math.random() * 0.4
    const distance = 80 + Math.random() * 180
    return {
      id,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 40,
      rotate: (Math.random() - 0.5) * 540,
      color: COLORS[id % COLORS.length] ?? '#552bd8',
      size: 6 + Math.random() * 10,
      borderRadius: Math.random() > 0.45 ? '999px' : '3px',
    }
  })
}

type CelebrationProps = {
  origin: Point | null
  onComplete: () => void
}

export function Celebration({ origin, onComplete }: CelebrationProps) {
  const [burst, setBurst] = useState<Point | null>(null)
  const particles = useMemo(() => (burst ? createParticles() : []), [burst])

  useEffect(() => {
    if (!origin) return

    setBurst(origin)
    const timeout = window.setTimeout(() => setBurst(null), 850)
    return () => window.clearTimeout(timeout)
  }, [origin])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {burst ? (
        <motion.div
          key={`${burst.x}-${burst.y}`}
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute rounded-full border-2 border-primary"
            style={{ left: burst.x, top: burst.y }}
            initial={{ width: 12, height: 12, x: -6, y: -6, opacity: 0.9 }}
            animate={{ width: 220, height: 220, x: -110, y: -110, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full bg-primary/40 blur-md"
            style={{ left: burst.x, top: burst.y }}
            initial={{ width: 18, height: 18, x: -9, y: -9, opacity: 0.8 }}
            animate={{ width: 90, height: 90, x: -45, y: -45, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute block"
              style={{
                left: burst.x,
                top: burst.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: particle.borderRadius,
                boxShadow: `0 0 12px ${particle.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                x: particle.dx,
                y: particle.dy,
                opacity: 0,
                scale: 0.2,
                rotate: particle.rotate,
              }}
              transition={{ duration: 0.9, ease: [0.15, 0.7, 0.25, 1] }}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
