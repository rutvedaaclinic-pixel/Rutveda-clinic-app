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
  RefreshCw,
  Eye,
  X,
  Save,
  DollarSign,
  Box
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

  // Modal states
  const [viewModal, setViewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [saving, setSaving] = useState(false)

  // Edit form data
  const [editData, setEditData] = useState({
    name: '',
    buyingPrice: '',
    sellingPrice: '',
    stock: '',
    expiryDate: '',
    manufacturer: '',
    description: '',
    category: ''
  })

  const categories = [
    { value: 'tablets', label: 'Tablets' },
    { value: 'capsules', label: 'Capsules' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'cream', label: 'Cream/Ointment' },
    { value: 'drops', label: 'Drops' },
    { value: 'other', label: 'Other' }
  ]

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

  // View Medicine
  const handleViewMedicine = async (medicine) => {
    try {
      const data = await medicinesAPI.getById(medicine._id)
      setSelectedMedicine(data.data)
      setViewModal(true)
    } catch (error) {
      toast.error('Failed to fetch medicine details')
    }
  }

  // Edit Medicine
  const handleEditMedicine = async (medicine) => {
    try {
      const data = await medicinesAPI.getById(medicine._id)
      setSelectedMedicine(data.data)
      setEditData({
        name: data.data.name || '',
        buyingPrice: data.data.buyingPrice || '',
        sellingPrice: data.data.sellingPrice || '',
        stock: data.data.stock || '',
        expiryDate: data.data.expiryDate ? data.data.expiryDate.split('T')[0] : '',
        manufacturer: data.data.manufacturer || '',
        description: data.data.description || '',
        category: data.data.category || ''
      })
      setEditModal(true)
    } catch (error) {
      toast.error('Failed to fetch medicine details')
    }
  }

  const handleUpdateMedicine = async () => {
    setSaving(true)
    try {
      await medicinesAPI.update(selectedMedicine._id, {
        ...editData,
        buyingPrice: parseFloat(editData.buyingPrice),
        sellingPrice: parseFloat(editData.sellingPrice),
        stock: parseInt(editData.stock)
      })
      toast.success('Medicine updated successfully!')
      setEditModal(false)
      fetchMedicines()
    } catch (error) {
      toast.error('Failed to update medicine')
    } finally {
      setSaving(false)
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewMedicine(medicine)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Medicine"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMedicine(medicine)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Medicine"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </Table>
          </div>
        )}
      </Card>

      {/* View Medicine Modal */}
      {viewModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Medicine Details</h2>
              <button onClick={() => setViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medicine ID</p>
                      <p className="font-semibold">{selectedMedicine.medicineId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Medicine Name</p>
                    <p className="font-semibold text-lg">{selectedMedicine.name}</p>
                  </div>
                  {selectedMedicine.manufacturer && (
                    <div>
                      <p className="text-sm text-gray-500">Manufacturer</p>
                      <p className="font-medium">{selectedMedicine.manufacturer}</p>
                    </div>
                  )}
                  {selectedMedicine.category && (
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium capitalize">{selectedMedicine.category}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className="font-semibold text-lg">{selectedMedicine.stock} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedMedicine.status).color}`}>
                        {getStatusBadge(selectedMedicine.status).label}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Buying Price</p>
                      <p className="font-semibold text-green-600">₹{selectedMedicine.buyingPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Selling Price</p>
                      <p className="font-semibold text-blue-600">₹{selectedMedicine.sellingPrice}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-medium">{new Date(selectedMedicine.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Profit Margin</p>
                    <p className="font-semibold text-green-600">
                      ₹{(selectedMedicine.sellingPrice - selectedMedicine.buyingPrice).toFixed(2)} 
                      {' '}({((selectedMedicine.sellingPrice - selectedMedicine.buyingPrice) / selectedMedicine.buyingPrice * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
              {selectedMedicine.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMedicine.description}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
              <Button variant="primary" onClick={() => {
                setViewModal(false)
                handleEditMedicine(selectedMedicine)
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Medicine
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {editModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Medicine</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Medicine ID</p>
                <p className="font-semibold">{selectedMedicine.medicineId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Medicine Name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
                <InputField
                  label="Stock"
                  type="number"
                  value={editData.stock}
                  onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                />
                <InputField
                  label="Buying Price (₹)"
                  type="number"
                  value={editData.buyingPrice}
                  onChange={(e) => setEditData({ ...editData, buyingPrice: e.target.value })}
                />
                <InputField
                  label="Selling Price (₹)"
                  type="number"
                  value={editData.sellingPrice}
                  onChange={(e) => setEditData({ ...editData, sellingPrice: e.target.value })}
                />
                <InputField
                  label="Expiry Date"
                  type="date"
                  value={editData.expiryDate}
                  onChange={(e) => setEditData({ ...editData, expiryDate: e.target.value })}
                />
                <InputField
                  label="Manufacturer"
                  value={editData.manufacturer}
                  onChange={(e) => setEditData({ ...editData, manufacturer: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Enter medicine description, dosage instructions, etc."
                />
              </div>

              {/* Profit Calculator */}
              {editData.buyingPrice && editData.sellingPrice && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Profit Calculator</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-600">Buying Price</p>
                      <p className="font-semibold text-green-800">₹{parseFloat(editData.buyingPrice).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-green-600">Selling Price</p>
                      <p className="font-semibold text-green-800">₹{parseFloat(editData.sellingPrice).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-green-600">Profit Margin</p>
                      <p className="font-semibold text-green-800">
                        ₹{(parseFloat(editData.sellingPrice) - parseFloat(editData.buyingPrice)).toFixed(2)}
                        {' '}
                        ({((parseFloat(editData.sellingPrice) - parseFloat(editData.buyingPrice)) / parseFloat(editData.buyingPrice) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdateMedicine} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
