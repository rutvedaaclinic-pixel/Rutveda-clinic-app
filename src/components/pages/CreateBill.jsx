import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import { patientsAPI, medicinesAPI, servicesAPI, billsAPI } from '../../services/api'
import { 
  Search, 
  Plus, 
  Minus,
  Trash2,
  User,
  Stethoscope,
  Pill,
  Calculator,
  Save,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateBill() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Patient search
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  
  // Bill items
  const [consultationFee, setConsultationFee] = useState(500)
  const [services, setServices] = useState([])
  const [availableServices, setAvailableServices] = useState([])
  const [medicines, setMedicines] = useState([])
  const [availableMedicines, setAvailableMedicines] = useState([])
  
  // Payment details
  const [paymentStatus, setPaymentStatus] = useState('paid')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')

  // Fetch available services and medicines on mount
  useEffect(() => {
    fetchAvailableServices()
    fetchAvailableMedicines()
  }, [])

  // Search patients with debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (patientSearch.length >= 2) {
        searchPatients()
      } else {
        setPatients([])
        setShowPatientDropdown(false)
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [patientSearch])

  const searchPatients = async () => {
    try {
      const data = await patientsAPI.getAll(`?search=${patientSearch}&limit=10`)
      setPatients(data.data)
      setShowPatientDropdown(true)
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const fetchAvailableServices = async () => {
    try {
      const data = await servicesAPI.getAll('/all')
      setAvailableServices(data.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchAvailableMedicines = async () => {
    try {
      const data = await medicinesAPI.getAll('?limit=100')
      setAvailableMedicines(data.data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const selectPatient = (patient) => {
    setSelectedPatient(patient)
    setPatientSearch(patient.name)
    setShowPatientDropdown(false)
  }

  const addService = (service) => {
    const exists = services.find(s => s.service === service._id)
    if (exists) {
      toast.error('Service already added')
      return
    }
    setServices([...services, {
      service: service._id,
      name: service.name,
      price: service.price
    }])
    toast.success(`Added ${service.name}`)
  }

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const addMedicine = (medicine) => {
    const exists = medicines.find(m => m.medicine === medicine._id)
    if (exists) {
      toast.error('Medicine already added')
      return
    }
    setMedicines([...medicines, {
      medicine: medicine._id,
      name: medicine.name,
      price: medicine.sellingPrice,
      quantity: 1,
      total: medicine.sellingPrice
    }])
    toast.success(`Added ${medicine.name}`)
  }

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const updateMedicineQuantity = (index, quantity) => {
    if (quantity < 1) return
    const updated = [...medicines]
    updated[index].quantity = quantity
    updated[index].total = quantity * updated[index].price
    setMedicines(updated)
  }

  // Calculate totals
  const servicesTotal = services.reduce((sum, s) => sum + s.price, 0)
  const medicinesTotal = medicines.reduce((sum, m) => sum + m.total, 0)
  const grandTotal = consultationFee + servicesTotal + medicinesTotal

  const handleSubmit = async () => {
    // Validation
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }
    if (consultationFee < 0) {
      toast.error('Consultation fee cannot be negative')
      return
    }

    setSaving(true)
    try {
      const billData = {
        patient: selectedPatient._id,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        consultationFee: Number(consultationFee),
        services: services.map(s => ({
          service: s.service,
          name: s.name,
          price: s.price
        })),
        medicines: medicines.map(m => ({
          medicine: m.medicine,
          name: m.name,
          price: m.price,
          quantity: m.quantity,
          total: m.total
        })),
        paymentStatus,
        paymentMethod,
        notes
      }

      await billsAPI.create(billData)
      toast.success('Bill created successfully!')
      navigate('/billing')
    } catch (error) {
      console.error('Error creating bill:', error)
      toast.error(error.response?.data?.message || 'Failed to create bill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="md" onClick={() => navigate('/billing')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Bill</h1>
            <p className="text-gray-600">Generate a new bill for a patient</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-medical-blue" />
              Select Patient
            </h2>
            <div className="relative">
              <InputField
                label="Search Patient"
                placeholder="Type patient name or phone to search..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value)
                  if (selectedPatient && e.target.value !== selectedPatient.name) {
                    setSelectedPatient(null)
                  }
                }}
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
              
              {/* Patient Dropdown */}
              {showPatientDropdown && patients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient._id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => selectPatient(patient)}
                    >
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.phone} • {patient.gender}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedPatient && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">{selectedPatient.name}</p>
                    <p className="text-sm text-green-600">{selectedPatient.phone} • {selectedPatient.gender}, {selectedPatient.age} yrs</p>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Selected</span>
                </div>
              </div>
            )}
          </Card>

          {/* Consultation Fee */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-medical-blue" />
              Consultation Fee
            </h2>
            <div className="max-w-xs">
              <InputField
                label="Fee Amount (₹)"
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                min="0"
              />
            </div>
          </Card>

          {/* Services */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-medical-blue" />
              Services
            </h2>
            
            {/* Add Service */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableServices.map((service) => (
                  <button
                    key={service._id}
                    type="button"
                    onClick={() => addService(service)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-medical-blue hover:text-white border border-gray-200 rounded-lg transition-colors text-left"
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs opacity-75">₹{service.price}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected Services */}
            {services.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Services</h3>
                <div className="space-y-2">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{service.name}</span>
                        <span className="text-gray-500 ml-2">₹{service.price}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Medicines */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-medical-blue" />
              Medicines
            </h2>
            
            {/* Add Medicine */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Medicine</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableMedicines
                  .filter(m => m.stock > 0)
                  .map((medicine) => (
                    <button
                      key={medicine._id}
                      type="button"
                      onClick={() => addMedicine(medicine)}
                      disabled={medicines.find(m => m.medicine === medicine._id)}
                      className="px-3 py-2 text-sm bg-gray-50 hover:bg-medical-blue hover:text-white border border-gray-200 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium truncate">{medicine.name}</div>
                      <div className="text-xs opacity-75">₹{medicine.sellingPrice} • Stock: {medicine.stock}</div>
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Selected Medicines */}
            {medicines.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Medicines</h3>
                <div className="space-y-2">
                  {medicines.map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-gray-500 ml-2">₹{medicine.price}/unit</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateMedicineQuantity(index, medicine.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 font-medium">{medicine.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateMedicineQuantity(index, medicine.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-semibold w-20 text-right">₹{medicine.total}</span>
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Summary & Payment */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-medical-blue" />
              Bill Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Consultation Fee</span>
                <span>₹{consultationFee}</span>
              </div>
              
              {services.length > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Services ({services.length})</span>
                  <span>₹{servicesTotal}</span>
                </div>
              )}
              
              {medicines.length > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Medicines ({medicines.length})</span>
                  <span>₹{medicinesTotal}</span>
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-medical-blue">₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="flex space-x-2">
                  {['paid', 'pending', 'partial'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                        paymentStatus === status
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
                  {['cash', 'upi', 'card', 'other'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        paymentMethod === method
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/billing')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving || !selectedPatient}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Bill
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}