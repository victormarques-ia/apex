// components/VideoSection.tsx
"use client";
import { useState } from 'react'
import { Play } from 'lucide-react' // Import the Play icon from lucide-react

interface VideoSectionProps {
  videoUrl: string
  thumbnailUrl: string
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl, thumbnailUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 md:px-10 max-w-screen-lg">
        <div className="relative max-w-3xl mx-auto rounded-lg aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
          {isPlaying ? (
            <iframe
              src={`${videoUrl}?autoplay=1`}
              title="Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${thumbnailUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.7,
                }}
              ></div>
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md z-10"
              >
                <Play className="w-8 h-8 text-primary" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default VideoSection
