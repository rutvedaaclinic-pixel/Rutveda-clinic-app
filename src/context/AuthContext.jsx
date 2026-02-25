import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        // Verify token is still valid by fetching user data
        const response = await authAPI.getMe()
        setUser(response.data)
        setIsAuthenticated(true)
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      
      if (response.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        toast.success('Login successful!')
        return { success: true }
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (data) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        setUser(result.data)
        localStorage.setItem('user', JSON.stringify(result.data))
        toast.success('Profile updated successfully')
        return { success: true }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('Password changed successfully')
        return { success: true }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext