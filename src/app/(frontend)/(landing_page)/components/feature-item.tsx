import { ReactNode } from 'react'

interface FeatureItemProps {
  iconSrc: ReactNode
  title: string
  description: string
  iconAlt: string
  iconWidth?: number
  iconHeight?: number
}

export function FeatureItem({ iconSrc, title, description }: FeatureItemProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      {iconSrc}
      <div className="flex flex-col items-center text-center max-w-[180px] mt-2 gap-1">
        <h3 className="text-accent font-medium">{title}</h3>
        <p className="text-xs text-primary">{description}</p>
      </div>
    </div>
  )
}
