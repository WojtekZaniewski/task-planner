'use client'

import { useState, useEffect, useRef } from 'react'

export function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('splash-shown')) return
    setVisible(true)
    sessionStorage.setItem('splash-shown', 'true')

    // Fallback: force dismiss after 7s if video doesn't end
    const timeout = setTimeout(() => dismiss(), 7000)
    return () => clearTimeout(timeout)
  }, [])

  function dismiss() {
    setFading(true)
    setTimeout(() => setVisible(false), 800)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <video
        ref={videoRef}
        src="/videos/splash.mp4"
        autoPlay
        muted
        playsInline
        onEnded={dismiss}
        onError={dismiss}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
