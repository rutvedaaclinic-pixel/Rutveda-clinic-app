import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Table from '../ui/Table'
import Modal from '../ui/Modal'
import { mockServices } from '../../context/data/patients'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Stethoscope,
  DollarSign,
  Clock,
  Search
} from 'lucide-react'

export default function Services() {
  const [services, setServices] = useState(mockServices)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  })

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) return

    if (editingService) {
      setServices(prev => prev.map(s => 
        s.id === editingService.id 
          ? { ...s, name: formData.name, price: parseFloat(formData.price), duration: formData.duration, description: formData.description }
          : s
      ))
    } else {
      const newService = {
        id: `SER${String(services.length + 1).padStart(3, '0')}`,
        name: formData.name,
        price: parseFloat(formData.price),
        duration: formData.duration,
        description: formData.description
      }
      setServices(prev => [...prev, newService])
    }

    handleCloseModal()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(s => s.id !== id))
    }
  }

  const totalValue = services.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage clinic services and pricing</p>
        </div>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
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
        <div className="overflow-x-auto">
          <Table
            headers={['Service ID', 'Service Name', 'Price', 'Duration', 'Actions']}
          >
            {filteredServices.map((service) => (
              <tr key={service.id} className="table-row">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{service.id}</div>
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
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(service.id)}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-sm text-gray-500">Add your first service to get started.</p>
            <Button variant="primary" size="sm" onClick={() => handleOpenModal()} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
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