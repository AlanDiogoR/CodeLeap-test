import { useState } from 'react'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithSkeleton({
  src,
  alt,
  className = '',
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-muted/30"
          aria-hidden
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
