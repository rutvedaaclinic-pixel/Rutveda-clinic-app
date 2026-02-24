import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import ChartCard from '../ui/ChartCard'
import { mockPatients, mockMedicines, mockServices, mockBills } from '../../context/data/patients'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Pill,
  Stethoscope
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState('daily')

  // Mock data calculations
  const totalPatients = mockPatients.length
  const consultationIncome = mockBills.reduce((sum, bill) => sum + bill.consultation, 0)
  const medicineIncome = mockMedicines.reduce((sum, med) => sum + (med.price * (100 - med.stock)), 0)
  const serviceIncome = mockServices.reduce((sum, service) => sum + service.price, 0)
  const totalRevenue = consultationIncome + medicineIncome + serviceIncome

  // Chart data
  const monthlyGrowthData = [
    { month: 'Jan', revenue: 45000, patients: 45 },
    { month: 'Feb', revenue: 52000, patients: 52 },
    { month: 'Mar', revenue: 48000, patients: 48 },
    { month: 'Apr', revenue: 61000, patients: 61 },
    { month: 'May', revenue: 55000, patients: 55 },
    { month: 'Jun', revenue: 67000, patients: 67 },
    { month: 'Jul', revenue: 72000, patients: 72 },
    { month: 'Aug', revenue: 69000, patients: 69 },
    { month: 'Sep', revenue: 78000, patients: 78 },
    { month: 'Oct', revenue: 82000, patients: 82 },
    { month: 'Nov', revenue: 75000, patients: 75 },
    { month: 'Dec', revenue: 88000, patients: 88 }
  ]

  const dailyRevenueData = [
    { day: 'Mon', revenue: 8500, patients: 12 },
    { day: 'Tue', revenue: 9200, patients: 15 },
    { day: 'Wed', revenue: 7800, patients: 11 },
    { day: 'Thu', revenue: 10500, patients: 18 },
    { day: 'Fri', revenue: 9800, patients: 16 },
    { day: 'Sat', revenue: 12000, patients: 22 },
    { day: 'Sun', revenue: 6500, patients: 9 }
  ]

  const revenueSplitData = [
    { name: 'Consultation', value: Math.round((consultationIncome / totalRevenue) * 100) || 40, amount: consultationIncome || 25000 },
    { name: 'Medicines', value: Math.round((medicineIncome / totalRevenue) * 100) || 35, amount: medicineIncome || 22000 },
    { name: 'Services', value: Math.round((serviceIncome / totalRevenue) * 100) || 25, amount: serviceIncome || 15000 }
  ]

  const COLORS = ['#2563EB', '#10B981', '#8B5CF6']

  const StatCard = ({ title, value, change, icon: Icon, color = 'medical-blue' }) => {
    const colorClasses = {
      'medical-blue': 'bg-blue-500 text-blue-500',
      'success-green': 'bg-green-500 text-green-500',
      'purple': 'bg-purple-500 text-purple-500',
      'orange': 'bg-orange-500 text-orange-500'
    }
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className={`text-xs mt-1 flex items-center ${change.startsWith('+') ? 'text-success-green' : 'text-danger-red'}`}>
              {change.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </p>
          </div>
          <div className={`w-12 h-12 ${colorClasses[color].split(' ')[0]} bg-opacity-10 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
          </div>
        </div>
      </Card>
    )
  }

  const MonthlyGrowthChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={monthlyGrowthData}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name) => [
            name === 'revenue' ? `₹${value.toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Patients'
          ]}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10B981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  const DailyRevenueChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dailyRevenueData}>
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
          formatter={(value, name) => [
            name === 'revenue' ? `₹${value.toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Patients'
          ]}
        />
        <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  const RevenueSplitChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={revenueSplitData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {revenueSplitData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [
            `₹${props.payload.amount.toLocaleString()} (${value}%)`,
            name
          ]}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={timePeriod === 'daily' ? 'primary' : 'outline'} 
            size="md"
            onClick={() => setTimePeriod('daily')}
          >
            Daily
          </Button>
          <Button 
            variant={timePeriod === 'monthly' ? 'primary' : 'outline'} 
            size="md"
            onClick={() => setTimePeriod('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          change="+12% this month"
          icon={Users}
          color="medical-blue"
        />
        <StatCard
          title="Consultation Income"
          value={`₹${consultationIncome.toLocaleString()}`}
          change="+8% this month"
          icon={DollarSign}
          color="success-green"
        />
        <StatCard
          title="Medicine Income"
          value={`₹${medicineIncome.toLocaleString()}`}
          change="+15% this month"
          icon={Pill}
          color="purple"
        />
        <StatCard
          title="Service Income"
          value={`₹${serviceIncome.toLocaleString()}`}
          change="+22% this month"
          icon={Stethoscope}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartCard title={timePeriod === 'daily' ? "Daily Revenue" : "Monthly Growth"}>
          {timePeriod === 'daily' ? <DailyRevenueChart /> : <MonthlyGrowthChart />}
        </ChartCard>

        {/* Revenue Breakdown */}
        <ChartCard title="Revenue Split">
          <RevenueSplitChart />
        </ChartCard>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <TrendingUp className="w-5 h-5 text-success-green" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Revenue per Patient</span>
              <span className="font-semibold">₹{(totalRevenue / totalPatients).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medicine Sales %</span>
              <span className="font-semibold">{Math.round((medicineIncome / totalRevenue) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service Utilization</span>
              <span className="font-semibold">{mockServices.length} services</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Patient Retention</span>
              <span className="font-semibold">85%</span>
            </div>
          </div>
        </Card>

        {/* Top Services */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {mockServices.slice(0, 5).map((service, index) => (
              <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">Service #{index + 1}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{service.price}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Business Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Business Summary</h3>
            <DollarSign className="w-5 h-5 text-success-green" />
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success-green bg-opacity-5 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Growth</p>
                <p className="font-semibold text-success-green">+15.2%</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Avg. Bill</p>
                <p className="font-semibold">₹{(totalRevenue / mockBills.length).toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Occupancy</p>
                <p className="font-semibold">78%</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Rating</p>
                <p className="font-semibold">4.8/5.0</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}