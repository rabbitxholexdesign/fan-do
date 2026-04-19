"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface LogoutButtonProps {
  children: React.ReactNode
  className?: string
}

export function LogoutButton({ children, className }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  )
}
