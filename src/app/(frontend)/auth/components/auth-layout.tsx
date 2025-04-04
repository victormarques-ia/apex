'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

export function AuthLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:flex md:w-1/2 bg-gray-200 items-center justify-center py-8 md:py-0">
        <div className="text-center">
          <div className="mb-4">
            <Image
              src="/assets/logo.svg"
              width={450}
              height={450}
              alt="logo"
              className="w-[450px] h-[450px]"
              priority
            />
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col">
        <div className="flex justify-end p-4">
          <Link href="/ajuda" className="text-blue-600 hover:text-blue-800">
            Ajuda
          </Link>
        </div>

        <div className="flex-grow flex items-center justify-center px-4 py-8 md:py-0">
          <div className="w-full max-w-md">
            <div className="md:hidden mb-6 justify-center flex">
              <Image
                src="/assets/logo.svg"
                width={200}
                height={200}
                alt="logo"
                className="w-[200px] h-[200px]"
                priority
              />
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 md:mb-8 text-center">
              {title}
            </h2>
            <Suspense>{children}</Suspense>

            <div className="mt-2 text-center text-xs md:text-sm text-gray-600 max-w-[280px] mx-auto">
              By clicking continue, you agree to our{' '}
              <Link href="/terms" className="text-gray-600 hover:text-gray-800 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-gray-600 hover:text-gray-800 underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
