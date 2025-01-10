import { useAuth } from '@/contexts/AuthContext'

interface AdminOnlyProps {
  children: React.ReactNode
}

export function AdminOnly({ children }: AdminOnlyProps) {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}

