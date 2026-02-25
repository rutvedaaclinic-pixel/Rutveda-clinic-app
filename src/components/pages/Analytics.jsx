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

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' }
]

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('all')
  const [performance, setPerformance] = useState({})
  const [monthlyGrowth, setMonthlyGrowth] = useState([])
  const [yearlyGrowth, setYearlyGrowth] = useState([])
  const [dailyEarnings, setDailyEarnings] = useState([])
  const [revenueSplit, setRevenueSplit] = useState({ breakdown: [], total: 0 })
  const [topServices, setTopServices] = useState([])
  const [topMedicines, setTopMedicines] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch data based on period
      const [performanceData, revenueData, servicesData, medicinesData] = await Promise.all([
        analyticsAPI.getPerformance(period),
        analyticsAPI.getRevenueSplit(period),
        analyticsAPI.getTopServices(5, period),
        analyticsAPI.getTopMedicines(5, period)
      ])
      
      setPerformance(performanceData.data)
      setRevenueSplit(revenueData.data)
      setTopServices(servicesData.data)
      setTopMedicines(medicinesData.data)

      // Fetch chart data based on period
      if (period === 'today') {
        // Last 7 days for today view
        const dailyData = await analyticsAPI.getDailyEarnings(7)
        setDailyEarnings(dailyData.data)
        setMonthlyGrowth([])
        setYearlyGrowth([])
      } else if (period === 'month') {
        // Last 12 months for month view
        const monthlyData = await analyticsAPI.getMonthlyGrowth()
        setMonthlyGrowth(monthlyData.data)
        setDailyEarnings([])
        setYearlyGrowth([])
      } else {
        // All time - yearly growth
        const yearlyData = await analyticsAPI.getYearlyGrowth()
        setYearlyGrowth(yearlyData.data)
        setDailyEarnings([])
        setMonthlyGrowth([])
      }
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

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Today'
      case 'month':
        return 'This Month'
      case 'all':
      default:
        return 'All Time'
    }
  }

  const getChartTitle = () => {
    switch (period) {
      case 'today':
        return 'Revenue Trend (Last 7 Days)'
      case 'month':
        return 'Monthly Revenue Growth (Last 12 Months)'
      case 'all':
      default:
        return 'Yearly Revenue Growth (All Time)'
    }
  }

  // Render the appropriate chart based on period
  const renderTrendChart = () => {
    if (period === 'today') {
      // Daily bar chart for today
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyEarnings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF" 
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
              formatter={(value) => [`₹${value?.toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Day: ${label}`}
            />
            <Bar dataKey="earnings" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    } else if (period === 'month') {
      // Monthly line chart for month
      return (
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
      )
    } else {
      // Yearly bar chart for all time
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              stroke="#9CA3AF" 
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
              formatter={(value) => [`₹${value?.toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Clinic performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  period === option.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
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
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{performance.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {period === 'all' ? (performance.totalPatients || 0) : (performance.periodPatients || 0)}
              </p>
              <p className="text-xs text-blue-600 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bills Generated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{performance.billsCount || 0}</p>
              <p className="text-xs text-purple-600 mt-1">{getPeriodLabel()}</p>
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
        {/* Trend Chart - Dynamic based on period */}
        <ChartCard title={getChartTitle()}>
          {renderTrendChart()}
        </ChartCard>

        {/* Revenue Breakdown */}
        <ChartCard title={`Revenue Breakdown - ${getPeriodLabel()}`}>
          {revenueSplit.total === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No revenue data available for this period
            </div>
          ) : (
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
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <ChartCard title={`Top Services - ${getPeriodLabel()}`}>
          {topServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No service data available for this period
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
        <ChartCard title={`Top Medicines Sold - ${getPeriodLabel()}`}>
          {topMedicines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No medicine data available for this period
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