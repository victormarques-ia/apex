import Image from 'next/image'

interface SolutionCardProps {
  iconSrc: string
  title: string
  description: string
  alt: string
}

export function SolutionCard({ iconSrc, title, description, alt }: SolutionCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[350px] w-full md:w-[300px] flex flex-col">
      <div className="h-[200px] w-full overflow-hidden">
        <Image
          src={iconSrc}
          alt={alt}
          width={300}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-primary-800 font-medium mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-primary mb-2 overflow-y-auto line-clamp-4">{description}</p>
      </div>
    </div>
  )
}
