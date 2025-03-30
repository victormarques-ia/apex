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
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-base text-primary">{authorName}</h4>
          <p className="text-sm text-secondary">{authorRole}</p>
        </div>
      </div>
    </div>
  )
}
