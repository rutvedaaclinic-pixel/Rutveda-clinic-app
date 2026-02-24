import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Menu, 
  Bell, 
  User, 
  Search, 
  Plus 
} from 'lucide-react'

export default function Navbar({ onSidebarToggle }) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="hidden lg:flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">RUTVEDA CLINIC</h1>
            <div className="w-px h-6 bg-gray-300" />
            <span className="text-sm text-gray-500">Today: Feb 24, 2026</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients, medicines, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          {/* Add Patient Button */}
          <Link
            to="/add-patient"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Patient</span>
          </Link>

          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900">Dr. Mihir Thakor</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  )
}