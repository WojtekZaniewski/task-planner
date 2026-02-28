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

    // Fallback: force dismiss after 6s if video doesn't end
    const timeout = setTimeout(() => dismiss(), 6000)
    return () => clearTimeout(timeout)
  }, [])

  function dismiss() {
    setFading(true)
    setTimeout(() => setVisible(false), 500)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 500ms ease-out',
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
        className="h-48 w-48 sm:h-64 sm:w-64 object-contain"
      />
    </div>
  )
}
