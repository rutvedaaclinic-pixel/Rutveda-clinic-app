import React, { useState, useEffect } from 'react'
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
  Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Billing() {
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

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
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{Math.round(totalEarnings / bills.length).toLocaleString()}</p>
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
                    {new Date(bill.createdAt).toLocaleDateString()}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}