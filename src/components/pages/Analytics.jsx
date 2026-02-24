import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import ChartCard from '../ui/ChartCard'
import Button from '../ui/Button'
import { analyticsAPI } from '../../services/api'
import { 
  TrendingUp,
  DollarSign,
  Users,
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
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B']

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [performance, setPerformance] = useState({})
  const [monthlyGrowth, setMonthlyGrowth] = useState([])
  const [revenueSplit, setRevenueSplit] = useState({ breakdown: [], total: 0 })
  const [topServices, setTopServices] = useState([])
  const [topMedicines, setTopMedicines] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [performanceData, monthlyData, revenueData, servicesData, medicinesData] = await Promise.all([
        analyticsAPI.getPerformance(),
        analyticsAPI.getMonthlyGrowth(),
        analyticsAPI.getRevenueSplit(),
        analyticsAPI.getTopServices(5),
        analyticsAPI.getTopMedicines(5)
      ])
      
      setPerformance(performanceData.data)
      setMonthlyGrowth(monthlyData.data)
      setRevenueSplit(revenueData.data)
      setTopServices(servicesData.data)
      setTopMedicines(medicinesData.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Clinic performance and insights</p>
        </div>
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

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{performance.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{performance.totalPatients || 0}</p>
              <p className="text-xs text-blue-600 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{performance.thisMonthRevenue?.toLocaleString() || 0}</p>
              <p className={`text-xs mt-1 ${performance.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performance.growthPercentage >= 0 ? '+' : ''}{performance.growthPercentage}% vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Bill Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{performance.avgBillAmount?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Per transaction</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <ChartCard title="Monthly Revenue Growth">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`₹${value?.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563EB" 
                strokeWidth={2}
                dot={{ fill: '#2563EB' }}
              />
            </LineChart>
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <ChartCard title="Top Services">
          {topServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No service data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Count']}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Top Medicines */}
        <ChartCard title="Top Medicines Sold">
          {topMedicines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No medicine data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMedicines} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Units Sold']}
                />
                <Bar dataKey="quantitySold" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}