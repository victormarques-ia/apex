'use client'

import React from 'react'
import { X } from 'lucide-react'

type NotificationsProps = {
  onClose: () => void
}

export default function Notifications({ onClose }: NotificationsProps) {
  return (
    <div className="fixed top-16 right-4 w-72 max-h-96 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Notificações</h3>
        <button className="text-gr</div>ay-500 hover:text-gray-700" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">05/04/25 - Bianca não anotou suas refeições</p>
        <p className="text-gray-500 text-sm">02/04/25 - Bianca atingiu 100% das metas nutricionais do dia</p>
        <p className="text-gray-500 text-sm">01/04/25 - Bianca relatou dor muscular após o treino</p>
      </div>
    </div>
  )
}
