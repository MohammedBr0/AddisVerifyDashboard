import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  company: string
  avatar?: string
  firstname?: string
  lastname?: string
  tenantId?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

interface AuthActions {
  login: (user: User, token: string) => void
  signIn: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

interface DashboardState {
  stats: {
    totalUsers: number
    pendingVerifications: number
    completedVerifications: number
    activeApiKeys: number
  }
  recentActivity: Array<{
    id: string
    user: string
    action: string
    time: string
    status: 'success' | 'pending' | 'info'
  }>
}

interface DashboardActions {
  setStats: (stats: DashboardState['stats']) => void
  setRecentActivity: (activity: DashboardState['recentActivity']) => void
}

// Auth Store
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: (user: User, token: string) => {
        localStorage.setItem('access_token', token)
        set({
          user,
          isAuthenticated: true,
          token,
          isLoading: false,
        })
      },

      signIn: (user: User, token: string) => {
        localStorage.setItem('access_token', token)
        set({
          user,
          isAuthenticated: true,
          token,
          isLoading: false,
        })
      },

      logout: () => {
        // Clear all authentication data
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        sessionStorage.clear()
        
        // Clear any other stored data
        if (typeof window !== 'undefined') {
          // Clear any other localStorage items that might be related to auth
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('auth') || key.includes('token') || key.includes('session'))) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
          
          // Clear any cookies that might be related to auth
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        }
        
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
)

// Dashboard Store
export const useDashboardStore = create<DashboardState & DashboardActions>()(
  (set) => ({
    stats: {
      totalUsers: 0,
      pendingVerifications: 0,
      completedVerifications: 0,
      activeApiKeys: 0,
    },
    recentActivity: [],

    setStats: (stats) => {
      set({ stats })
    },

    setRecentActivity: (activity) => {
      set({ recentActivity: activity })
    },
  })
)

// UI Store for managing UI state
interface UIState {
  sidebarOpen: boolean
  activeTab: string
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>
}

interface UIActions {
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState & UIActions>()(
  (set, get) => ({
    sidebarOpen: false,
    activeTab: 'overview',
    notifications: [],

    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    },

    setActiveTab: (tab: string) => {
      set({ activeTab: tab })
    },

    addNotification: (notification) => {
      const id = Math.random().toString(36).substr(2, 9)
      set((state) => ({
        notifications: [...state.notifications, { ...notification, id }],
      }))
    },

    removeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    },

    clearNotifications: () => {
      set({ notifications: [] })
    },
  })
) 