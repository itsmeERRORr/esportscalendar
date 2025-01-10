import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function withAdminAuth(WrappedComponent: React.ComponentType) {
  return function WithAdminAuth(props: any) {
    const { user } = useAuth()
    const router = useRouter()

    if (typeof window !== 'undefined') {
      if (!user || user.role !== 'admin') {
        router.push('/')
        return null
      }
    }

    return <WrappedComponent {...props} />
  }
}

