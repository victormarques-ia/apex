import { UserCircle } from 'lucide-react'

interface TestimonialCardProps {
  text: string
  authorName: string
  authorRole: string
}

export function TestimonialCard({ text, authorName, authorRole }: TestimonialCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm w-full md:max-w-[345px] h-[345px] flex flex-col justify-between">
      <p className="text-primary mb-2 text-xl">&quot;{text}&quot;</p>
      <div className="flex items-center">
        <div className="mr-4">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h4 className="font-medium text-base text-primary">{authorName}</h4>
          <p className="text-sm text-secondary">{authorRole}</p>
        </div>
      </div>
    </div>
  )
}
