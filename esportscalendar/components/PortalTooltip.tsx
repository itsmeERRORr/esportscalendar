import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface PortalTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
}

export function PortalTooltip({ children, content }: PortalTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '0'
    container.style.zIndex = '9999'
    document.body.appendChild(container)
    setPortalContainer(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [])

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.bottom + window.scrollY })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
      {portalContainer &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'absolute',
                  left: position.x,
                  top: position.y,
                }}
                className="bg-gray-800 text-gray-100 p-2 rounded-md shadow-lg w-64"
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          portalContainer
        )}
    </>
  )
}

