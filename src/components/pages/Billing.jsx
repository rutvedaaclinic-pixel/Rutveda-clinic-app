import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import SelectField from '../ui/SelectField'
import Table from '../ui/Table'
import { mockPatients, mockMedicines, mockServices } from '../../context/data/patients'
import { 
  User, 
  FileText, 
  Plus, 
  Trash2, 
  Calculator,
  Save,
  Printer
} from 'lucide-react'

export default function Billing() {
  const [billData, setBillData] = useState({
    patientId: '',
    consultationFee: 500,
    medicines: [],
    services: []
  })

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [newMedicine, setNewMedicine] = useState({
    id: '',
    quantity: 1
  })
  const [newService, setNewService] = useState('')

  const patientOptions = mockPatients.map(patient => ({
    value: patient.id,
    label: `${patient.name} (${patient.id})`
  }))

  const handlePatientSelect = (patientId) => {
    setBillData(prev => ({ ...prev, patientId }))
    const patient = mockPatients.find(p => p.id === patientId)
    setSelectedPatient(patient)
  }

  const addMedicine = () => {
    if (!newMedicine.id || !newMedicine.quantity) return

    const medicine = mockMedicines.find(m => m.id === newMedicine.id)
    if (!medicine) return

    const total = medicine.price * parseInt(newMedicine.quantity)
    
    setBillData(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        quantity: parseInt(newMedicine.quantity),
        total
      }]
    }))

    setNewMedicine({ id: '', quantity: 1 })
  }

  const removeMedicine = (index) => {
    setBillData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }))
  }

  const addService = () => {
    if (!newService) return

    const service = mockServices.find(s => s.id === newService)
    if (!service) return

    setBillData(prev => ({
      ...prev,
      services: [...prev.services, {
        id: service.id,
        name: service.name,
        price: service.price
      }]
    }))

    setNewService('')
  }

  const removeService = (index) => {
    setBillData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const calculateTotals = () => {
    const medicinesTotal = billData.medicines.reduce((sum, med) => sum + med.total, 0)
    const servicesTotal = billData.services.reduce((sum, service) => sum + service.price, 0)
    const consultationTotal = billData.consultationFee || 0
    const grandTotal = medicinesTotal + servicesTotal + consultationTotal

    return {
      medicinesTotal,
      servicesTotal,
      consultationTotal,
      grandTotal
    }
  }

  const totals = calculateTotals()

  const handlePrintBill = () => {
    // Simulate print functionality
    window.print()
  }

  const handleSaveBill = () => {
    // Simulate save functionality
    const bill = {
      id: `BILL${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      patientId: billData.patientId,
      patientName: selectedPatient?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      consultation: billData.consultationFee,
      medicines: billData.medicines,
      services: billData.services,
      total: totals.grandTotal
    }
    
    console.log('Bill saved:', bill)
    alert('Bill saved successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Bill</h1>
          <p className="text-gray-600">Generate billing invoice for patients</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" onClick={handlePrintBill}>
            <Printer className="w-4 h-4 mr-2" />
            Print Bill
          </Button>
          <Button variant="primary" size="md" onClick={handleSaveBill}>
            <Save className="w-4 h-4 mr-2" />
            Save Bill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Consultation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Selection */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Patient Information</h3>
                <p className="text-sm text-gray-600">Select patient for billing</p>
              </div>
            </div>

            <SelectField
              label="Select Patient"
              value={billData.patientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              options={patientOptions}
              placeholder="Choose a patient..."
            />

            {selectedPatient && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    <p className="text-sm text-gray-600">{selectedPatient.id} • {selectedPatient.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Age: {selectedPatient.age}</p>
                    <p className="text-sm text-gray-600">Gender: {selectedPatient.gender}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Consultation Fee */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Consultation Fee</h3>
                <p className="text-sm text-gray-600">Set consultation charges</p>
              </div>
            </div>

            <InputField
              label="Consultation Fee (₹)"
              type="number"
              value={billData.consultationFee}
              onChange={(e) => setBillData(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
              placeholder="500"
            />
          </Card>
        </div>

        {/* Right Column - Medicines & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medicines Section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Medicines</h3>
                  <p className="text-sm text-gray-600">Add prescribed medicines</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={addMedicine}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SelectField
                label="Medicine"
                value={newMedicine.id}
                onChange={(e) => setNewMedicine(prev => ({ ...prev, id: e.target.value }))}
                options={mockMedicines.map(med => ({
                  value: med.id,
                  label: `${med.name} (₹${med.price})`
                }))}
                placeholder="Select medicine..."
              />
              <InputField
                label="Quantity"
                type="number"
                value={newMedicine.quantity}
                onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>

            {billData.medicines.length > 0 ? (
              <Table
                headers={['Medicine', 'Price', 'Quantity', 'Total', 'Action']}
              >
                {billData.medicines.map((medicine, index) => (
                  <tr key={index} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{medicine.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medicine.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{medicine.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeMedicine(index)}
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No medicines added yet. Add medicines using the form above.
              </div>
            )}
          </Card>

          {/* Services Section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Services</h3>
                  <p className="text-sm text-gray-600">Add additional services</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={addService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="mb-4">
              <SelectField
                label="Service"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                options={mockServices.map(service => ({
                  value: service.id,
                  label: `${service.name} (₹${service.price})`
                }))}
                placeholder="Select service..."
              />
            </div>

            {billData.services.length > 0 ? (
              <Table
                headers={['Service', 'Price', 'Action']}
              >
                {billData.services.map((service, index) => (
                  <tr key={index} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{service.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No services added yet. Add services using the form above.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bill Summary */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center">
            <Calculator className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bill Summary</h3>
            <p className="text-sm text-gray-600">Review and finalize the bill</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totals.consultationTotal}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Medicine Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totals.medicinesTotal}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Service Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totals.servicesTotal}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600">Grand Total</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{totals.grandTotal}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="text-sm text-gray-600">
            Patient: {selectedPatient ? `${selectedPatient.name} (${selectedPatient.id})` : 'Not selected'}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="md">
              Reset Bill
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveBill}>
              <Save className="w-4 h-4 mr-2" />
              Save & Print
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}