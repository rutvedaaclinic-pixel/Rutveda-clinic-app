import React, { useState, useEffect, useRef } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import Table from '../ui/Table'
import { patientsAPI, medicinesAPI, servicesAPI, billsAPI } from '../../services/api'
import { 
  Search, 
  Plus, 
  FileText,
  DollarSign,
  Calendar,
  User,
  RefreshCw,
  Printer,
  Eye,
  Edit2,
  Trash2,
  X,
  Stethoscope,
  Pill
} from 'lucide-react'
import toast from 'react-hot-toast'

// Safe date formatting helper
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString();
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleTimeString();
};

export default function Billing() {
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  
  // View/Edit/Delete modal states
  const [viewModal, setViewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [editData, setEditData] = useState({
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const printRef = useRef(null)

  const fetchBills = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filter !== 'all') params.append('paymentStatus', filter)
      
      const data = await billsAPI.getAll(`?${params.toString()}`)
      setBills(data.data)
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [filter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') fetchBills()
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalEarnings = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)

  // View Bill
  const handleViewBill = async (bill) => {
    try {
      const data = await billsAPI.getById(bill._id)
      setSelectedBill(data.data)
      setViewModal(true)
    } catch (error) {
      toast.error('Failed to fetch bill details')
    }
  }

  // Edit Bill
  const handleEditBill = async (bill) => {
    try {
      const data = await billsAPI.getById(bill._id)
      setSelectedBill(data.data)
      setEditData({
        paymentStatus: data.data.paymentStatus,
        paymentMethod: data.data.paymentMethod || 'cash',
        notes: data.data.notes || ''
      })
      setEditModal(true)
    } catch (error) {
      toast.error('Failed to fetch bill details')
    }
  }

  const handleUpdateBill = async () => {
    setSaving(true)
    try {
      await billsAPI.update(selectedBill._id, editData)
      toast.success('Bill updated successfully!')
      setEditModal(false)
      fetchBills()
    } catch (error) {
      toast.error('Failed to update bill')
    } finally {
      setSaving(false)
    }
  }

  // Delete Bill
  const handleDeleteClick = (bill) => {
    setSelectedBill(bill)
    setDeleteModal(true)
  }

  const handleDeleteBill = async () => {
    setSaving(true)
    try {
      await billsAPI.delete(selectedBill._id)
      toast.success('Bill deleted successfully!')
      setDeleteModal(false)
      fetchBills()
    } catch (error) {
      toast.error('Failed to delete bill')
    } finally {
      setSaving(false)
    }
  }

  // Print Bill
  const handlePrintBill = async (bill) => {
    try {
      const data = await billsAPI.getById(bill._id)
      setSelectedBill(data.data)
      setTimeout(() => {
        window.print()
      }, 100)
    } catch (error) {
      toast.error('Failed to fetch bill details for printing')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-medical-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">Manage patient bills and payments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" onClick={fetchBills}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" size="md" href="/create-bill">
            <Plus className="w-4 h-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{bills.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalEarnings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Bill</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{bills.length > 0 ? Math.round(totalEarnings / bills.length).toLocaleString() : 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InputField
              label="Search Bills"
              placeholder="Search by bill ID or patient name..."
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
              variant={filter === 'paid' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('paid')}
              className="flex-1"
            >
              Paid
            </Button>
            <Button 
              variant={filter === 'pending' ? 'primary' : 'outline'} 
              size="md"
              onClick={() => setFilter('pending')}
              className="flex-1"
            >
              Pending
            </Button>
          </div>
        </div>
      </Card>

      {/* Bills Table */}
      <Card>
        {bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No bills found</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first bill for a patient.</p>
            <Button variant="primary" size="md" href="/patients">
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={['Bill ID', 'Patient', 'Date', 'Items', 'Total', 'Status', 'Actions']}>
              {bills.map((bill) => (
                <tr key={bill._id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{bill.billId}</div>
                        <div className="text-sm text-gray-500">Bill</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{bill.patientName}</div>
                        <div className="text-sm text-gray-500">{bill.patientPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>Consultation: ₹{bill.consultationFee}</div>
                    {bill.medicines?.length > 0 && (
                      <div>Medicines: {bill.medicines.length}</div>
                    )}
                    {bill.services?.length > 0 && (
                      <div>Services: {bill.services.length}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-900">₹{bill.totalAmount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(bill.paymentStatus)}`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Bill"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditBill(bill)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintBill(bill)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Print Bill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bill)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Bill"
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
      </Card>

      {/* View Bill Modal */}
      {viewModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Bill Details</h2>
              <button onClick={() => setViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bill ID</p>
                  <p className="font-semibold">{selectedBill.billId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{formatDate(selectedBill.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-semibold">{selectedBill.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient Phone</p>
                  <p className="font-semibold">{selectedBill.patientPhone || 'N/A'}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Bill Items</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-medium">₹{selectedBill.consultationFee}</span>
                  </div>
                  
                  {selectedBill.services?.length > 0 && (
                    <div className="py-2 border-b">
                      <p className="text-sm font-medium text-gray-700 mb-2">Services</p>
                      {selectedBill.services.map((service, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span className="text-gray-600">{service.name}</span>
                          <span>₹{service.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedBill.medicines?.length > 0 && (
                    <div className="py-2 border-b">
                      <p className="text-sm font-medium text-gray-700 mb-2">Medicines</p>
                      {selectedBill.medicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span className="text-gray-600">{med.name} x {med.quantity}</span>
                          <span>₹{med.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-medical-blue">₹{selectedBill.totalAmount}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedBill.paymentStatus)}`}>
                    {selectedBill.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold uppercase">{selectedBill.paymentMethod || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-700">{selectedBill.notes || 'No notes'}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
              <Button variant="primary" onClick={() => {
                setViewModal(false)
                handlePrintBill(selectedBill)
              }}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {editModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Bill</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Bill ID</p>
                <p className="font-semibold">{selectedBill.billId}</p>
                <p className="text-sm text-gray-500 mt-1">Total: ₹{selectedBill.totalAmount}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="flex space-x-2">
                  {['paid', 'pending', 'partial'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditData({ ...editData, paymentStatus: status })}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                        editData.paymentStatus === status
                          ? 'bg-medical-blue text-white border-medical-blue'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['cash', 'upi'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setEditData({ ...editData, paymentMethod: method })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        editData.paymentMethod === method
                          ? 'bg-medical-blue text-white border-medical-blue'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Add notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdateBill} disabled={saving}>
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
      {deleteModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Bill</h2>
              <p className="text-gray-600 text-center mb-4">
                Are you sure you want to delete bill <span className="font-semibold">{selectedBill.billId}</span>? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-500 text-center">
                Patient: {selectedBill.patientName} | Total: ₹{selectedBill.totalAmount}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteBill} 
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Bill'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print Template - Hidden but used for printing */}
      {selectedBill && (
        <div className="print-only" ref={printRef} style={{ display: 'none' }}>
          <style>
            {`
              @media print {
                .print-only {
                  display: block !important;
                }
                body * {
                  visibility: hidden;
                }
                .print-only, .print-only * {
                  visibility: visible;
                }
                .print-only {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  padding: 20px;
                }
              }
            `}
          </style>
          <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
              <img 
                src="/image /PHOTO-2026-02-24-11-32-06-removebg-preview.png" 
                alt="RUTVEDA CLINIC Logo" 
                style={{ width: '80px', height: '80px', margin: '0 auto 10px', display: 'block', objectFit: 'contain' }}
              />
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>RUTVEDA CLINIC</h1>
              <p style={{ color: '#666', margin: '5px 0' }}>Your Trusted Healthcare Partner</p>
              <p style={{ fontSize: '14px', color: '#888' }}>Contact: +91 9876543210 | Email: clinic@example.com</p>
            </div>

            {/* Bill Title */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', textDecoration: 'underline' }}>INVOICE / BILL</h2>
            </div>

            {/* Bill Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '5px 0' }}><strong>Bill ID:</strong> {selectedBill.billId}</p>
                <p style={{ margin: '5px 0' }}><strong>Date:</strong> {formatDate(selectedBill.createdAt)}</p>
                <p style={{ margin: '5px 0' }}><strong>Time:</strong> {formatTime(selectedBill.createdAt)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0' }}><strong>Patient Name:</strong> {selectedBill.patientName}</p>
                <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {selectedBill.patientPhone || 'N/A'}</p>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Item</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Price</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>Consultation Fee</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>₹{selectedBill.consultationFee}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>₹{selectedBill.consultationFee}</td>
                </tr>
                {selectedBill.services?.map((service, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{service.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>1</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>₹{service.price}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>₹{service.price}</td>
                  </tr>
                ))}
                {selectedBill.medicines?.map((med, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{med.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{med.quantity}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>₹{med.price}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>₹{med.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Grand Total: ₹{selectedBill.totalAmount}
              </p>
            </div>

            {/* Payment Info */}
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '5px' }}>
              <p style={{ margin: '5px 0' }}><strong>Payment Status:</strong> {selectedBill.paymentStatus.toUpperCase()}</p>
              <p style={{ margin: '5px 0' }}><strong>Payment Method:</strong> {selectedBill.paymentMethod?.toUpperCase() || 'N/A'}</p>
              {selectedBill.notes && <p style={{ margin: '5px 0' }}><strong>Notes:</strong> {selectedBill.notes}</p>}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>Thank you for your visit!</p>
              <p style={{ fontSize: '12px', color: '#888', margin: '5px 0' }}>This is a computer-generated invoice.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}