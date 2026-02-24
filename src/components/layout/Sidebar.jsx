import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Package, 
  Settings, 
  LogOut 
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', path: '/patients', icon: Users },
  { id: 'billing', label: 'Billing', path: '/billing', icon: FileText },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package },
  { id: 'services', label: 'Services', path: '/services', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed on left */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/image /PHOTO-2026-02-24-11-32-06-removebg-preview.png" 
                alt="Rutveda Clinic Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">RUTVEDA CLINIC</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose()
                  }
                }}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-500 bg-opacity-10 text-blue-600 border border-blue-500 border-opacity-20' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}