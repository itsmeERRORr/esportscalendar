'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setAuthCookie, getAuthCookie, removeAuthCookie } from '../utils/cookies'

interface User {
  id: number
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user data and auth cookie on component mount
    const storedUser = localStorage.getItem('user')
    const authCookie = getAuthCookie()

    if (storedUser && authCookie) {
      setUser(JSON.parse(storedUser))
    } else {
      // If there's no valid session, clear any leftover data
      localStorage.removeItem('user')
      removeAuthCookie()
    }
    console.log('AuthProvider initialized', { storedUser: !!storedUser, authCookie: !!authCookie })
  }, [])

  const login = async (email: string, username: string, password: string) => {
    console.log('Login attempt:', { email, username, environment: process.env.NODE_ENV })
    const lowercaseEmail = email.toLowerCase();
    const lowercaseUsername = username.toLowerCase();
    // Using the specific credentials provided
    if ((lowercaseEmail === 'ferreyrajoao@gmail.com' && lowercaseUsername === 'joao' && password === 'joaojoao') ||
        (lowercaseEmail === 'adelasznajder@gmail.com' && lowercaseUsername === 'adela' && password === 'adel4adel4') ||
        (lowercaseEmail === 'photos.lucbouchon@gmail.com' && lowercaseUsername === 'luc' && password === 'luclucc') ||
        (lowercaseEmail === 'vexanie@gmail.com' && lowercaseUsername === 'steph' && password === 'vexv3x') ||
        (lowercaseEmail === 'guedesnoob@noob.com' && lowercaseUsername === 'guedes' && password === 'guedesguedes') ||
        (lowercaseEmail === 'gilbertoravenvieira@gmail.com' && lowercaseUsername === 'gil' && password === 'gilg1l') ||
        (lowercaseEmail === 'joaolaiafirmo@gmail.com' && lowercaseUsername === 'firmo' && password === 'firmof1rm0')) {
      console.log('Login successful for', username);
      const userData = {
        id: lowercaseEmail === 'ferreyrajoao@gmail.com' ? 1 : 
            lowercaseEmail === 'adelasznajder@gmail.com' ? 2 : 
            lowercaseEmail === 'photos.lucbouchon@gmail.com' ? 3 : 
            lowercaseEmail === 'vexanie@gmail.com' ? 4 : 
            lowercaseEmail === 'gilbertoravenvieira@gmail.com' ? 5 : 
            lowercaseEmail === 'joaolaiafirmo@gmail.com' ? 6 : 7,
        email: lowercaseEmail,
        username: lowercaseUsername
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthCookie(JSON.stringify(userData));
      return true;
    }
    console.log('Login failed')
    return false
  }

  const logout = () => {
    console.log('Logout called')
    setUser(null)
    localStorage.removeItem('user')
    removeAuthCookie() // Remove auth cookie
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Note: Email and username comparisons are now case-insensitive, but password remains case-sensitive

