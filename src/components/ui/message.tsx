'use client'

import React from 'react'
import { X } from 'lucide-react'

type MessageProps = {
  onClose: () => void
}

export default function Message({ onClose }: MessageProps) {
  return (
    <div className="fixed bottom-4 right-4 w-72 h-72 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Mensagens</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">Nenhuma mensagem no momento</p>
      </div>
    </div>
  )
}
