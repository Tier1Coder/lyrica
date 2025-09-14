"use client"
import { useRouter } from 'next/navigation'
import Button from './Button'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await supabase.auth.signOut()
        router.refresh()
      }}
    >
      Logout
    </Button>
  )
}
