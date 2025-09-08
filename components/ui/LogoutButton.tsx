"use client"
import { useRouter } from 'next/navigation'
import Button from './Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()
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
