import React, { useState, useEffect } from 'react'
import Table from '../ui/Table'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Card from '../ui/Card'
import { patientsAPI } from '../../services/api'
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  FileText,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react'

export default function Patients() {
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filter !== 'all') params.append('filter', filter)
      params.append('page', pagination.currentPage)
      params.append('limit', 10)
      
      const data = await patientsAPI.getAll(`?${params.toString()}`)
      setPatients(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [filter, pagination.currentPage])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') {
        fetchPatients()
      }
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100'
      case 'Inactive': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600">Manage patient records and information</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-medical-blue animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" onClick={fetchPatients}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" size="md" href="/add-patient">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InputField
              label="Search Patients"
              placeholder="Search by name, phone, or patient ID..."
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
              variant={filter === 'today' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('today')}
              className="flex-1"
            >
              Today
            </Button>
            <Button 
              variant={filter === 'month' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('month')}
              className="flex-1"
            >
              This Month
            </Button>
          </div>
        </div>
      </Card>

      {/* Patients Table */}
      <Card>
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button variant="primary" size="md" href="/add-patient">
              <Plus className="w-4 h-4 mr-2" />
              Add First Patient
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              headers={['Patient ID', 'Name', 'Phone', 'Age', 'Gender', 'Last Visit', 'Status', 'Action']}
            >
              {patients.map((patient) => (
                <tr key={patient._id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-medical-blue" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{patient.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.age} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {patient.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="primary" size="sm" href={`/billing?patient=${patient._id}`}>
                      <FileText className="w-4 h-4 mr-1" />
                      Bill
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {patients.length} of {pagination.totalItems} patients
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}