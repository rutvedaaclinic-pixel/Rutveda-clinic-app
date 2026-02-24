import React, { useState } from 'react'
import Table from '../ui/Table'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Card from '../ui/Card'
import { mockPatients } from '../../context/data/patients'
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  FileText,
  Calendar,
  User
} from 'lucide-react'

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.phone.includes(searchQuery) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'today') {
      return matchesSearch && patient.lastVisit === new Date().toISOString().split('T')[0]
    } else if (filter === 'month') {
      const patientDate = new Date(patient.lastVisit)
      const today = new Date()
      const isThisMonth = patientDate.getMonth() === today.getMonth() && 
                         patientDate.getFullYear() === today.getFullYear()
      return matchesSearch && isThisMonth
    }
    
    return matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100'
      case 'Inactive': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
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
          <a href="/add-patient" className="border-2 border-medical-blue text-medical-blue px-4 py-2 rounded-lg hover:bg-medical-blue hover:text-white transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </a>
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
        <div className="overflow-x-auto">
          <Table
            headers={['Patient ID', 'Name', 'Phone', 'Age', 'Gender', 'Last Visit', 'Status', 'Action']}
          >
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="table-row">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-medical-blue" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{patient.id}</div>
                      <div className="text-sm text-gray-500">{patient.status}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-500">DOB: {patient.age} years</div>
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
                    {patient.lastVisit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button variant="primary" size="sm" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Create Bill</span>
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
        
        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>
    </div>
  )
}