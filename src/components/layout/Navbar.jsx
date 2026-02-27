import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  User, 
  Search, 
  Plus,
  LogOut,
  ChevronDown,
  Users,
  Package,
  Settings
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { patientsAPI, medicinesAPI, servicesAPI } from '../../services/api'

// Get current date formatted
const getCurrentDate = () => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  return new Date().toLocaleDateString('en-US', options)
}

export default function Navbar({ onSidebarToggle }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ patients: [], medicines: [], services: [] })
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  // Store current date on component mount
  const currentDate = getCurrentDate()

  // Search functionality
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults({ patients: [], medicines: [], services: [] })
      setShowSearchDropdown(false)
      return
    }

    setSearching(true)
    setShowSearchDropdown(true)

    try {
      const [patientsRes, medicinesRes, servicesRes] = await Promise.all([
        patientsAPI.getAll(`?search=${query}&limit=5`),
        medicinesAPI.getAll(`?search=${query}&limit=5`),
        servicesAPI.getAll(`?search=${query}&limit=5`)
      ])

      setSearchResults({
        patients: patientsRes.data || [],
        medicines: medicinesRes.data || [],
        services: servicesRes.data || []
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (type, item) => {
    setShowSearchDropdown(false)
    setSearchQuery('')
    
    switch (type) {
      case 'patient':
        navigate(`/patients`)
        break
      case 'medicine':
        navigate(`/inventory`)
        break
      case 'service':
        navigate(`/services`)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

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
            <span className="text-sm text-gray-500">Today: {currentDate}</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients, medicines, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                {searching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    {/* Patients */}
                    {searchResults.patients.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                          Patients
                        </div>
                        {searchResults.patients.map((patient) => (
                          <button
                            key={patient._id}
                            onClick={() => handleResultClick('patient', patient)}
                            className="w-full flex items-center px-3 py-2 hover:bg-gray-50 text-left"
                          >
                            <Users className="w-4 h-4 text-blue-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                              <p className="text-xs text-gray-500">{patient.phone} • {patient.gender}, {patient.age}yrs</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Medicines */}
                    {searchResults.medicines.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                          Medicines
                        </div>
                        {searchResults.medicines.map((medicine) => (
                          <button
                            key={medicine._id}
                            onClick={() => handleResultClick('medicine', medicine)}
                            className="w-full flex items-center px-3 py-2 hover:bg-gray-50 text-left"
                          >
                            <Package className="w-4 h-4 text-green-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                              <p className="text-xs text-gray-500">₹{medicine.sellingPrice} • Stock: {medicine.stock}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Services */}
                    {searchResults.services.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                          Services
                        </div>
                        {searchResults.services.map((service) => (
                          <button
                            key={service._id}
                            onClick={() => handleResultClick('service', service)}
                            className="w-full flex items-center px-3 py-2 hover:bg-gray-50 text-left"
                          >
                            <Settings className="w-4 h-4 text-purple-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{service.name}</p>
                              <p className="text-xs text-gray-500">₹{service.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchResults.patients.length === 0 && 
                     searchResults.medicines.length === 0 && 
                     searchResults.services.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Dr. Mihir Thakor'}</p>
                <p className="text-xs text-gray-500">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Administrator'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Dr. Mihir Thakor'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'rutveda.clinic@gmail.com'}</p>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 mr-3 text-gray-400" />
                  My Profile
                </Link>
                
                <div className="border-t border-gray-100 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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