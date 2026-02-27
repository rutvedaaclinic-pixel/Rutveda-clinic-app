import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../ui/Table'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Card from '../ui/Card'
import { patientsAPI } from '../../services/api'
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import { 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  FileText,
  Calendar,
  User,
  RefreshCw,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Clipboard,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Patients() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  // Modal states
  const [viewModal, setViewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [addVisitModal, setAddVisitModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientBills, setPatientBills] = useState([])
  const [saving, setSaving] = useState(false)

  // Edit form data
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    email: '',
    address: '',
    bloodGroup: '',
    medicalHistory: ''
  })

  // Visit form data
  const [visitData, setVisitData] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    doctorName: ''
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

  // View Patient
  const handleViewPatient = async (patient) => {
    try {
      const data = await patientsAPI.getWithDetails(patient._id)
      setSelectedPatient(data.data.patient)
      setPatientBills(data.data.bills || [])
      setViewModal(true)
    } catch (error) {
      toast.error('Failed to fetch patient details')
    }
  }

  // Edit Patient
  const handleEditPatient = async (patient) => {
    try {
      const data = await patientsAPI.getById(patient._id)
      setSelectedPatient(data.data)
      setEditData({
        name: data.data.name || '',
        phone: data.data.phone || '',
        age: data.data.age || '',
        gender: data.data.gender || '',
        email: data.data.email || '',
        address: data.data.address || '',
        bloodGroup: data.data.bloodGroup || '',
        medicalHistory: data.data.medicalHistory || ''
      })
      setEditModal(true)
    } catch (error) {
      toast.error('Failed to fetch patient details')
    }
  }

  const handleUpdatePatient = async () => {
    setSaving(true)
    try {
      await patientsAPI.update(selectedPatient._id, {
        ...editData,
        age: Number(editData.age)
      })
      toast.success('Patient updated successfully!')
      setEditModal(false)
      fetchPatients()
    } catch (error) {
      toast.error('Failed to update patient')
    } finally {
      setSaving(false)
    }
  }

  // Delete Patient
  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient)
    setDeleteModal(true)
  }

  const handleDeletePatient = async () => {
    setSaving(true)
    try {
      await patientsAPI.delete(selectedPatient._id)
      toast.success('Patient deleted successfully!')
      setDeleteModal(false)
      fetchPatients()
    } catch (error) {
      toast.error('Failed to delete patient')
    } finally {
      setSaving(false)
    }
  }

  // Bill Patient
  const handleBillPatient = (patient) => {
    navigate(`/create-bill?patientId=${patient._id}`)
  }

  // Add Visit
  const handleAddVisitClick = (patient) => {
    setSelectedPatient(patient)
    setVisitData({
      diagnosis: '',
      prescription: '',
      notes: '',
      doctorName: ''
    })
    setAddVisitModal(true)
  }

  const handleAddVisit = async () => {
    if (!visitData.diagnosis && !visitData.notes) {
      toast.error('Please add diagnosis or notes')
      return
    }
    setSaving(true)
    try {
      await patientsAPI.addVisit(selectedPatient._id, visitData)
      toast.success('Visit added successfully!')
      setAddVisitModal(false)
      fetchPatients()
    } catch (error) {
      toast.error('Failed to add visit')
    } finally {
      setSaving(false)
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
                      {formatDate(patient.lastVisit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Patient"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Patient"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBillPatient(patient)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Create Bill"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(patient)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* View Patient Modal */}
      {viewModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
              <button onClick={() => setViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-medical-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Patient ID</p>
                      <p className="font-semibold">{selectedPatient.patientId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-lg">{selectedPatient.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                  {selectedPatient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.email}</span>
                    </div>
                  )}
                  {selectedPatient.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span>{selectedPatient.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-semibold">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-semibold">{selectedPatient.gender}</p>
                    </div>
                  </div>
                  {selectedPatient.bloodGroup && (
                    <div className="flex items-center space-x-2">
                      <Droplet className="w-4 h-4 text-red-500" />
                      <span>Blood Group: <strong>{selectedPatient.bloodGroup}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Last Visit: {formatDate(selectedPatient.lastVisit)}</span>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPatient.status)}`}>
                      {selectedPatient.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              {selectedPatient.medicalHistory && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Clipboard className="w-4 h-4 mr-2" />
                    Medical History
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPatient.medicalHistory}</p>
                </div>
              )}

              {/* Visit History */}
              {selectedPatient.visits && selectedPatient.visits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Visit History</h3>
                  <div className="space-y-3">
                    {selectedPatient.visits.map((visit, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">
                            {formatDateTime(visit.date)}
                          </span>
                          {visit.doctorName && (
                            <span className="text-sm text-gray-500">Dr. {visit.doctorName}</span>
                          )}
                        </div>
                        {visit.diagnosis && (
                          <p className="text-sm"><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                        )}
                        {visit.prescription && (
                          <p className="text-sm"><strong>Prescription:</strong> {visit.prescription}</p>
                        )}
                        {visit.notes && (
                          <p className="text-sm text-gray-600"><strong>Notes:</strong> {visit.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bill History */}
              {patientBills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Bill History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Bill ID</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                          <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientBills.map((bill, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2">{bill.billId}</td>
                            <td className="px-4 py-2">{formatDate(bill.createdAt)}</td>
                            <td className="px-4 py-2 text-right">₹{bill.totalAmount}</td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                bill.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {bill.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
              <Button variant="outline" onClick={() => {
                setViewModal(false)
                handleAddVisitClick(selectedPatient)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Visit
              </Button>
              <Button variant="primary" onClick={() => {
                setViewModal(false)
                handleBillPatient(selectedPatient)
              }}>
                <FileText className="w-4 h-4 mr-2" />
                Create Bill
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Patient</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-semibold">{selectedPatient.patientId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
                <InputField
                  label="Phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
                <InputField
                  label="Age"
                  type="number"
                  value={editData.age}
                  onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <InputField
                label="Email (Optional)"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group (Optional)</label>
                <select
                  value={editData.bloodGroup}
                  onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History (Optional)</label>
                <textarea
                  value={editData.medicalHistory}
                  onChange={(e) => setEditData({ ...editData, medicalHistory: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Allergies, chronic conditions, previous surgeries, etc."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdatePatient} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Patient</h2>
              <p className="text-gray-600 text-center mb-4">
                Are you sure you want to delete patient <span className="font-semibold">{selectedPatient.name}</span>? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-500 text-center">
                ID: {selectedPatient.patientId} | Phone: {selectedPatient.phone}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleDeletePatient} 
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Patient'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Visit Modal */}
      {addVisitModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Visit</h2>
              <button onClick={() => setAddVisitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-semibold">{selectedPatient.name} ({selectedPatient.patientId})</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <textarea
                  value={visitData.diagnosis}
                  onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Enter diagnosis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                <textarea
                  value={visitData.prescription}
                  onChange={(e) => setVisitData({ ...visitData, prescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Enter prescription..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={visitData.notes}
                  onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <InputField
                label="Doctor Name"
                value={visitData.doctorName}
                onChange={(e) => setVisitData({ ...visitData, doctorName: e.target.value })}
                placeholder="Dr. Name"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setAddVisitModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddVisit} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Visit'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}