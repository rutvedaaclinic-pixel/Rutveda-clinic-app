import React from 'react'
import { Link } from 'react-router-dom'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  href,
  ...props 
}) {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center'
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-green-500 text-white hover:bg-green-700 focus:ring-green-500 focus:ring-offset-2',
    danger: 'bg-red-500 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-2',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500 focus:ring-offset-2',
    ghost: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus:ring-offset-2'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        to={href}
        className={combinedClasses}
        {...props}
      >
        {children}
      </Link>
    )
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  )
}
