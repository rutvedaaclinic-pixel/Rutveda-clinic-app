import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Table from '../ui/Table'
import { medicinesAPI } from '../../services/api'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  Calendar,
  Droplet,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [loading, setLoading] = useState(true)
  const [medicines, setMedicines] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    expiringSoon: 0
  })

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filter !== 'all') params.append('filter', filter)
      
      const [medicinesData, statsData] = await Promise.all([
        medicinesAPI.getAll(`?${params.toString()}`),
        medicinesAPI.getStats()
      ])
      
      setMedicines(medicinesData.data)
      setStats(statsData.data)
    } catch (error) {
      console.error('Error fetching medicines:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [filter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') fetchMedicines()
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicinesAPI.delete(id)
        toast.success('Medicine deleted successfully')
        fetchMedicines()
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-stock':
        return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
      case 'low-stock':
        return { label: 'Low Stock', color: 'bg-red-100 text-red-800' }
      case 'expiring-soon':
        return { label: 'Expiring Soon', color: 'bg-orange-100 text-orange-800' }
      case 'out-of-stock':
        return { label: 'Out of Stock', color: 'bg-gray-100 text-gray-800' }
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-medical-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
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
          <Button variant="outline" size="md" onClick={fetchMedicines}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" size="md" href="/add-medicine">
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.inStock}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Droplet className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.expiringSoon}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InputField
              label="Search Medicines"
              placeholder="Search by name or ID..."
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
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-sm text-gray-500 mb-4">Add your first medicine to the inventory.</p>
            <Button variant="primary" size="md" href="/add-medicine">
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={['Name', 'Stock', 'Price', 'Expiry', 'Status', 'Action']}>
              {medicines.map((medicine) => {
                const status = getStatusBadge(medicine.status)
                return (
                  <tr key={medicine._id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">{medicine.medicineId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{medicine.stock} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{medicine.sellingPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(medicine._id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}