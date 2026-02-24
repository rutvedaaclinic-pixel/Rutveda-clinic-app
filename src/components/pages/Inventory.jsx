import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Table from '../ui/Table'
import { mockMedicines } from '../../context/data/patients'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  Calendar,
  Droplet
} from 'lucide-react'

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [lowStockAlert, setLowStockAlert] = useState(true)

  const filteredMedicines = mockMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'low-stock') {
      return matchesSearch && medicine.status === 'low-stock'
    } else if (filter === 'expiring-soon') {
      return matchesSearch && medicine.status === 'expiring-soon'
    } else if (filter === 'in-stock') {
      return matchesSearch && medicine.status === 'in-stock'
    }
    
    return matchesSearch
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-stock':
        return {
          label: 'In Stock',
          color: 'bg-green-100 text-green-800',
          icon: <Droplet className="w-3 h-3 text-green-600" />
        }
      case 'low-stock':
        return {
          label: 'Low Stock',
          color: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-3 h-3 text-red-600" />
        }
      case 'expiring-soon':
        return {
          label: 'Expiring Soon',
          color: 'bg-orange-100 text-orange-800',
          icon: <Calendar className="w-3 h-3 text-orange-600" />
        }
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: null
        }
    }
  }

  const getStockLevel = (stock) => {
    if (stock <= 10) return 'critical'
    if (stock <= 25) return 'low'
    if (stock <= 50) return 'medium'
    return 'high'
  }

  const getStockColor = (stock) => {
    const level = getStockLevel(stock)
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'low': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getStockWidth = (stock) => {
    if (stock <= 10) return 'w-1/4'
    if (stock <= 25) return 'w-1/2'
    if (stock <= 50) return 'w-3/4'
    return 'w-full'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage medicine stock and supplies</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Import Inventory
          </Button>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {lowStockAlert && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Low Stock Alert</p>
                <p className="text-sm text-red-700">3 medicines need restocking</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setLowStockAlert(false)}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InputField
              label="Search Medicines"
              placeholder="Search by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('all')}
              className="flex-1"
            >
              All
            </Button>
            <Button 
              variant={filter === 'in-stock' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('in-stock')}
              className="flex-1"
            >
              In Stock
            </Button>
            <Button 
              variant={filter === 'low-stock' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('low-stock')}
              className="flex-1"
            >
              Low Stock
            </Button>
            <Button 
              variant={filter === 'expiring-soon' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('expiring-soon')}
              className="flex-1"
            >
              Expiring
            </Button>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table
            headers={['Image', 'Name', 'Stock', 'Price', 'Expiry', 'Status', 'Action']}
          >
            {filteredMedicines.map((medicine) => {
              const status = getStatusBadge(medicine.status)
              const stockLevel = getStockLevel(medicine.stock)
              const stockColor = getStockColor(medicine.stock)
              const stockWidth = getStockWidth(medicine.stock)

              return (
                <tr key={medicine.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{medicine.stock} units</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon && <span className="mr-1">{status.icon}</span>}
                          {status.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 ${stockColor} rounded-full ${stockWidth}`}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: 10 units</span>
                        <span>Max: 200 units</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">₹{medicine.price}</div>
                    <div className="text-xs text-gray-500">per unit</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{medicine.expiry}</span>
                    </div>
                    {medicine.status === 'expiring-soon' && (
                      <span className="text-xs text-orange-600 mt-1">⚠️ Expires soon</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.icon && <span className="mr-1">{status.icon}</span>}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button variant="danger" size="sm" className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </Table>
        </div>
        
        {/* Empty State */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            {filter !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => setFilter('all')} className="mt-4">
                View All Medicines
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Medicines</h3>
              <p className="text-sm text-gray-600">All inventory items</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{mockMedicines.length}</div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Low Stock</h3>
              <p className="text-sm text-gray-600">Items needing restock</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {mockMedicines.filter(m => m.status === 'low-stock').length}
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Expiring Soon</h3>
              <p className="text-sm text-gray-600">Items with expiry alerts</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {mockMedicines.filter(m => m.status === 'expiring-soon').length}
          </div>
        </Card>
      </div>
    </div>
  )
}