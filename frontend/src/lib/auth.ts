import { api } from './api'

export interface User {
  id: string
  email: string
  name?: string
  plan?: string
  taxScore?: number
}

export interface AuthState {
  user: User | null
  loading: boolean
}

class AuthService {
  private user: User | null = null
  private listeners: Array<(user: User | null) => void> = []

  constructor() {
    // Check for existing token on initialization
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        this.validateToken()
      }
    }
  }

  private async validateToken() {
    try {
      const response = await api.getCurrentUser()
      if (response.success && response.data?.user) {
        this.user = response.data.user
        this.notifyListeners()
      } else {
        this.clearAuth()
      }
    } catch (error) {
      this.clearAuth()
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.user))
  }

  private clearAuth() {
    this.user = null
    api.clearToken()
    this.notifyListeners()
  }

  async signUp(email: string, password: string, name: string) {
    try {
      const nameParts = name.split(' ')
      const firstName = nameParts[0] || name
      const lastName = nameParts.slice(1).join(' ') || ''
      const response = await api.register(firstName, lastName, email, password)
      if (response.success && response.data?.user) {
        this.user = response.data.user
        this.notifyListeners()
        return {
          data: { user: this.user },
          error: null
        }
      }
      throw new Error(response.message || 'Registration failed')
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message }
      }
    }
  }

  async signIn(email: string, password: string) {
    try {
      const response = await api.login(email, password)
      if (response.success && response.data?.user) {
        this.user = response.data.user
        this.notifyListeners()
        return {
          data: { user: this.user },
          error: null
        }
      }
      throw new Error(response.message || 'Login failed')
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message }
      }
    }
  }

  async signOut() {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuth()
    }
    
    return { error: null }
  }

  getCurrentUser(): User | null {
    return this.user
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.push(callback)
    // Call immediately with current user
    callback(this.user)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }
}

const authService = new AuthService()

export async function signUp(email: string, password: string, name: string) {
  return authService.signUp(email, password, name)
}

export async function signIn(email: string, password: string) {
  return authService.signIn(email, password)
}

export async function signOut() {
  return authService.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  return authService.getCurrentUser()
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return authService.onAuthStateChange(callback)
}

// Remove the getUserProfile function as it's replaced by API calls
export const getUserProfile = async (userId: string) => {
  const response = await api.getCurrentUser()
  if (response.success && response.data?.user) {
    return response.data.user
  }
  throw new Error('Failed to get user profile')
} 