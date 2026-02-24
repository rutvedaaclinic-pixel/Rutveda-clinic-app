import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import SelectField from '../ui/SelectField'
import { mockPatients } from '../../context/data/patients'
import { UserPlus, Save, X } from 'lucide-react'

export default function AddPatient() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    email: '',
    bloodGroup: '',
    medicalHistory: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const genders = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ]

  const bloodGroups = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ]

  const generatePatientId = () => {
    const lastPatient = mockPatients[mockPatients.length - 1]
    const lastId = lastPatient ? parseInt(lastPatient.id.replace('DOC', '')) : 0
    const newId = `DOC${String(lastId + 1).padStart(3, '0')}`
    return newId
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Success simulation
    console.log('Patient data:', {
      ...formData,
      id: generatePatientId(),
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'Active'
    })

    setIsSubmitting(false)
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      age: '',
      gender: '',
      address: '',
      email: '',
      bloodGroup: '',
      medicalHistory: ''
    })

    // Show success message (in real app, use toast notification)
    alert('Patient added successfully!')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
          <p className="text-gray-600">Fill in the patient information below</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" href="/patients">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </Button>
        </div>
      </div>

      {/* Patient Information Form */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <InputField
                label="Patient Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient full name"
                error={errors.name}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <InputField
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  error={errors.age}
                />
                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={genders}
                  error={errors.gender}
                />
              </div>

              <InputField
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                error={errors.phone}
                className="mt-4"
              />

              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@example.com"
                className="mt-4"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              
              <SelectField
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={bloodGroups}
              />

              <InputField
                label="Address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter patient address"
                className="mt-4"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Patient ID</h4>
                  <p className="text-sm text-gray-600">Auto-generated</p>
                </div>
              </div>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{generatePatientId()}</p>
                <p className="text-sm text-gray-500 mt-1">Patient ID will be assigned automatically</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows={6}
                    className="input-field w-full"
                    placeholder="Enter any relevant medical history, allergies, or conditions..."
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700">
                    I confirm that the information provided is accurate and the patient has given consent for data processing.
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
          <Button variant="outline" size="md" href="/patients">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </Button>
        </div>
      </Card>
    </div>
  )
}