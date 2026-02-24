import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Table from '../ui/Table'
import Modal from '../ui/Modal'
import { servicesAPI } from '../../services/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Stethoscope,
  DollarSign,
  Clock,
  Search,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Services() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  })

  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = searchQuery ? `?search=${searchQuery}` : ''
      const data = await servicesAPI.getAll(params)
      setServices(data.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') fetchServices()
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration || '',
        description: service.description || ''
      })
    } else {
      setEditingService(null)
      setFormData({ name: '', price: '', duration: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    setFormData({ name: '', price: '', duration: '', description: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) return

    try {
      if (editingService) {
        await servicesAPI.update(editingService._id, {
          ...formData,
          price: parseFloat(formData.price)
        })
        toast.success('Service updated successfully')
      } else {
        await servicesAPI.create({
          ...formData,
          price: parseFloat(formData.price)
        })
        toast.success('Service added successfully')
      }
      handleCloseModal()
      fetchServices()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.delete(id)
        toast.success('Service deleted successfully')
        fetchServices()
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const totalValue = services.reduce((sum, s) => sum + s.price, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-medical-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage clinic services and pricing</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" onClick={fetchServices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{services.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{Math.round(totalValue / services.length).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <InputField
          label="Search Services"
          placeholder="Search by service name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </Card>

      {/* Services Table */}
      <Card>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-sm text-gray-500 mb-4">Add your first service to get started.</p>
            <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={['Service ID', 'Service Name', 'Price', 'Duration', 'Actions']}>
              {services.map((service) => (
                <tr key={service._id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                        <Stethoscope className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{service.serviceId}</div>
                        <div className="text-sm text-gray-500">Service</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-gray-500">{service.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-900">₹{service.price}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {service.duration || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenModal(service)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(service._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Service Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter service name"
          />

          <InputField
            label="Price (₹)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="Enter price"
          />

          <InputField
            label="Duration"
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="e.g., 30 minutes"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="input-field"
              placeholder="Enter service description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" size="md" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}