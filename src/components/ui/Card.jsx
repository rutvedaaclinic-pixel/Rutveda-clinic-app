import React from 'react'

export default function Card({ children, className = '', variant = 'default' }) {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
  
  const variantClasses = {
    default: '',
    highlight: 'border-blue-500 border-2 bg-gradient-to-br from-blue-50 to-white',
    success: 'border-green-500 border-2 bg-gradient-to-br from-green-50 to-white',
    danger: 'border-red-500 border-2 bg-gradient-to-br from-red-50 to-white'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className} hover:shadow-md transition-shadow`}>
      {children}
    </div>
  )
}
