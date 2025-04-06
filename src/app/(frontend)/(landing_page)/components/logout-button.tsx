'use client'

import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { signOutAction } from '@/app/(frontend)/auth/actions/sign-out.action'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = async () => {
    startTransition(async () => {
      const formData = new FormData()
      const result = await signOutAction(null, formData)

      if (result.data?.success) {
        window.location.reload()
      }
    })
  }

  return (
    <Button variant="destructive" onClick={handleLogout} disabled={isPending}>
      Sair
    </Button>
  )
}
