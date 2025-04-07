'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MessageSquare, Bell, LogOut } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Import our custom components
import Message from './message'
import Notifications from './notifications'

type Athlete = {
  id: string
  user: {
    id: string
    name: string
  }
}

type HeaderProps = {
  userRole?: string
  userName?: string
  activeTab?: string
  onTabChange?: (tab: string) => void
  athleteId?: string
  athletes?: Athlete[]
  onAthleteChange?: (athleteId: string) => void
  hideAthleteSelector?: boolean
}

const TABS = {
  OVERVIEW: 'overview',
  DIET: 'dieta',
  TRAINING: 'treinos',
  SETTINGS: 'configuracoes',
}

export default function Header({
  userRole = '',
  userName = '',
  activeTab = TABS.OVERVIEW,
  onTabChange,
  athleteId = '',
  athletes = [],
  onAthleteChange,
  hideAthleteSelector = false, // New prop to hide the athlete selector for athlete view
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [showMessage, setShowMessage] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Check if user is nutritionist or trainer to show "Lista de Atletas"
  const isNutritionistOrTrainer = userRole === 'nutritionist' || userRole === 'trainer'
  const shouldShowAthleteSelector =
    isNutritionistOrTrainer && !hideAthleteSelector && athletes.length > 0

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      // Default behavior if no callback provided
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      if (athleteId) {
        params.set('athleteId', athleteId)
      }
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const handleAthleteChange = (value: string) => {
    if (onAthleteChange) {
      onAthleteChange(value)
    } else {
      // Default behavior if no callback provided
      const params = new URLSearchParams(searchParams.toString())
      params.set('athleteId', value)
      if (activeTab) {
        params.set('tab', activeTab)
      }
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Redirect to login page
        router.push('/auth/sign-in')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Toggle message component visibility
  const toggleMessage = () => {
    setShowMessage(!showMessage)
    if (showNotifications) setShowNotifications(false)
  }

  // Toggle notifications component visibility
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (showMessage) setShowMessage(false)
  }

  return (
    <>
      <div className="w-full bg-white border-b border-gray-200 py-4 px-6 fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            {/* Apex Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo.svg"
                alt="Apex Logo"
                width={40}
                height={40}
                className="mr-2"
              />
            </Link>

            {/* Left side content */}
            <div className="font-semibold text-blue-700 cursor-pointer">Olá, {userName}!</div>

            {/* Navigation tabs */}
            <div className="flex items-center space-x-6">
              {/* Only show athlete selector for nutritionists/trainers */}
              {shouldShowAthleteSelector && (
                <div className="px-4">
                  <Select value={athleteId} onValueChange={handleAthleteChange}>
                    <SelectTrigger className="w-48 h-8 text-sm border-gray-300">
                      <SelectValue placeholder="Selecione um atleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {athletes.map((athlete) => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <button
                className={`text-sm ${activeTab === TABS.OVERVIEW ? 'text-blue-700 font-medium' : 'text-gray-600'}`}
                onClick={() => handleTabClick(TABS.OVERVIEW)}
              >
                Overview
              </button>

              <button
                className={`text-sm ${activeTab === TABS.DIET ? 'text-blue-700 font-medium' : 'text-gray-600'}`}
                onClick={() => handleTabClick(TABS.DIET)}
              >
                Dieta
              </button>
              <button
                className={`text-sm ${activeTab === TABS.TRAINING ? 'text-blue-700 font-medium' : 'text-gray-600'}`}
                onClick={() => handleTabClick(TABS.TRAINING)}
              >
                Treinos
              </button>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-6">
            <button onClick={toggleMessage} className="text-gray-600 hover:text-blue-700">
              <MessageSquare size={20} />
            </button>
            <button onClick={toggleNotifications} className="text-gray-600 hover:text-blue-700">
              <Bell size={20} />
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={handleLogout} className="text-gray-600 hover:text-blue-700">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally render message and notification components */}
      {showMessage && <Message onClose={() => setShowMessage(false)} />}
      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </>
  )
}
