import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Dashboard from './components/pages/Dashboard'
import Patients from './components/pages/Patients'
import Billing from './components/pages/Billing'
import Analytics from './components/pages/Analytics'
import Inventory from './components/pages/Inventory'
import Services from './components/pages/Services'
import AddPatient from './components/pages/AddPatient'
import AddMedicine from './components/pages/AddMedicine'
import CreateBill from './components/pages/CreateBill'
import { ToastProvider } from './components/ui/Toast'

// 404 Not Found Page
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for doesn't exist.</p>
      <a 
        href="/" 
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back Home
      </a>
    </div>
  </div>
)

function App() {
  return (
    <ToastProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="billing" element={<Billing />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="services" element={<Services />} />
            <Route path="add-patient" element={<AddPatient />} />
            <Route path="add-medicine" element={<AddMedicine />} />
            <Route path="create-bill" element={<CreateBill />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App