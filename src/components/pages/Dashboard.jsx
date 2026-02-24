import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import ChartCard from '../ui/ChartCard'
import Button from '../ui/Button'
import { analyticsAPI, patientsAPI } from '../../services/api'
import { 
  Users, 
  DollarSign, 
  Pill, 
  Stethoscope,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#2563EB', '#10B981', '#8B5CF6']

const SummaryCard = ({ title, value, icon: Icon, change, variant = 'default' }) => (
  <Card variant={variant} className="hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-1 flex items-center ${change.startsWith('+') ? 'text-success-green' : 'text-danger-red'}`}>
            {change.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
            {change}
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-medical-blue bg-opacity-10 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-medical-blue" />
      </div>
    </div>
  </Card>
)

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState({
    patientsToday: 0,
    earningsToday: 0,
    totalPatients: 0,
    totalMedicines: 0,
    totalServices: 0,
    lowStockCount: 0,
    expiringSoonCount: 0
  })
  const [dailyEarnings, setDailyEarnings] = useState([])
  const [revenueSplit, setRevenueSplit] = useState({ breakdown: [], total: 0 })
  const [recentPatients, setRecentPatients] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [summaryData, earningsData, revenueData, patientsData] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getDailyEarnings(7),
        analyticsAPI.getRevenueSplit(),
        analyticsAPI.getRecentPatients(5)
      ])
      
      setSummary(summaryData.data)
      setDailyEarnings(earningsData.data)
      setRevenueSplit(revenueData.data)
      setRecentPatients(patientsData.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-medical-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to RUTVEDA CLINIC</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="md" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard
          title="Patients Today"
          value={summary.patientsToday}
          icon={Users}
          change="+2 from yesterday"
          variant="highlight"
        />
        <SummaryCard
          title="Earnings Today"
          value={`₹${summary.earningsToday.toLocaleString()}`}
          icon={DollarSign}
          change="+12% from yesterday"
          variant="success"
        />
        <SummaryCard
          title="Total Patients"
          value={summary.totalPatients}
          icon={Users}
          change={`${summary.totalMedicines} medicines`}
        />
        <SummaryCard
          title="Total Services"
          value={summary.totalServices}
          icon={Stethoscope}
          change={`${summary.lowStockCount} low stock`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Earnings Chart */}
        <ChartCard title="Daily Earnings">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyEarnings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
              />
              <Bar dataKey="earnings" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Breakdown */}
        <ChartCard title="Revenue Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={revenueSplit.breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {revenueSplit.breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Share']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Patients */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
          <a href="/patients" className="text-medical-blue hover:text-blue-700 text-sm font-medium">
            View All Patients →
          </a>
        </div>
        
        {recentPatients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No patients found. Add your first patient!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-medical-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.patientId} • {patient.phone}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{patient.age} years</p>
                  <p className="text-xs text-gray-500 flex items-center justify-end">
                    <Calendar className="w-3 h-3 mr-1" />
                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" href={`/patients/${patient._id}`}>
                    View
                  </Button>
                  <Button variant="primary" size="sm" href={`/billing?patient=${patient._id}`}>
                    Create Bill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}