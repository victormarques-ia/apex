import Image from 'next/image'

interface FeatureItemProps {
  iconSrc: string
  title: string
  description: string
  iconAlt: string
  iconWidth?: number
  iconHeight?: number
}

export function FeatureItem({
  iconSrc,
  title,
  description,
  iconAlt,
  iconWidth = 76,
  iconHeight = 40,
}: FeatureItemProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image src={iconSrc} alt={iconAlt} width={iconWidth} height={iconHeight} />
      <div className="flex flex-col items-center text-center max-w-[180px] mt-2 gap-1">
        <h3 className="text-accent font-medium">{title}</h3>
        <p className="text-xs text-primary">{description}</p>
      </div>
    </div>
  )
}
