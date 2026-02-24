import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import InputField from '../ui/InputField'
import { medicinesAPI } from '../../services/api'
import { Upload, Save, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddMedicine() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    buyingPrice: '',
    sellingPrice: '',
    stock: '',
    expiryDate: '',
    manufacturer: '',
    description: '',
    category: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = [
    { value: 'tablets', label: 'Tablets' },
    { value: 'capsules', label: 'Capsules' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'cream', label: 'Cream/Ointment' },
    { value: 'drops', label: 'Drops' },
    { value: 'other', label: 'Other' }
  ]

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required'
    }

    if (!formData.buyingPrice || parseFloat(formData.buyingPrice) <= 0) {
      newErrors.buyingPrice = 'Valid buying price is required'
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required'
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid quantity is required'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
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

    try {
      await medicinesAPI.create({
        ...formData,
        buyingPrice: parseFloat(formData.buyingPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock),
        image: imagePreview
      })
      
      toast.success('Medicine added successfully!')
      navigate('/inventory')
    } catch (error) {
      toast.error(error.message || 'Failed to add medicine')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Medicine</h1>
        <p className="text-gray-600">Add medicine to inventory</p>
      </div>

      {/* Medicine Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Upload Section */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicine Image</h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Medicine preview" 
                    className="w-32 h-32 object-cover mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-blue-500 hover:text-blue-600 font-medium">Upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Medicine Details Section */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicine Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputField
                label="Medicine Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter medicine name"
                error={errors.name}
              />
            </div>

            <InputField
              label="Buying Price (₹)"
              type="number"
              name="buyingPrice"
              value={formData.buyingPrice}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.buyingPrice}
            />

            <InputField
              label="Selling Price (₹)"
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.sellingPrice}
            />

            <InputField
              label="Quantity"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              error={errors.stock}
            />

            <InputField
              label="Expiry Date"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              error={errors.expiryDate}
            />

            <InputField
              label="Manufacturer"
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="Enter manufacturer name"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Enter medicine description, dosage instructions, etc."
              />
            </div>
          </div>

          {/* Profit Calculator */}
          {formData.buyingPrice && formData.sellingPrice && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Profit Calculator</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Buying Price</p>
                  <p className="font-semibold text-green-800">₹{parseFloat(formData.buyingPrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-green-600">Selling Price</p>
                  <p className="font-semibold text-green-800">₹{parseFloat(formData.sellingPrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-green-600">Profit Margin</p>
                  <p className="font-semibold text-green-800">
                    ₹{(parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)).toFixed(2)}
                    {' '}
                    ({((parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)) / parseFloat(formData.buyingPrice) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Form Actions */}
      <Card>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Make sure all information is correct before saving.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" size="md" href="/inventory">
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
              {isSubmitting ? 'Saving...' : 'Save Medicine'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}