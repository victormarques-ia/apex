import Image from 'next/image'

interface SolutionCardProps {
  iconSrc: string
  title: string
  description: string
  iconAlt: string
  iconWidth?: number
  iconHeight?: number
}

export function SolutionCard({
  iconSrc,
  title,
  description,
  iconAlt,
  iconWidth = 70,
  iconHeight = 40,
}: SolutionCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="h-48 bg-gray-300 flex items-center justify-center">
        <Image src={iconSrc} alt={iconAlt} width={iconWidth} height={iconHeight} />
      </div>
      <div className="p-4">
        <h3 className="text-primary-800 font-medium mb-2">{title}</h3>
        <p className="text-sm text-primary mb-2">{description}</p>
      </div>
    </div>
  )
}
