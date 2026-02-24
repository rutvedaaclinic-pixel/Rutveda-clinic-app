import React from 'react'
import Card from '../ui/Card'
import ChartCard from '../ui/ChartCard'
import { mockPatients, mockMedicines, mockServices, mockBills } from '../../context/data/patients'
import { 
  Users, 
  DollarSign, 
  Pill, 
  Stethoscope,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar
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
  Legend,
  LineChart,
  Line
} from 'recharts'

// Mock data calculations
const today = new Date().toISOString().split('T')[0]
const patientsToday = mockPatients.filter(p => p.lastVisit === today).length
const earningsToday = mockBills.reduce((sum, bill) => sum + bill.total, 0)
const medicineSales = mockMedicines.reduce((sum, med) => sum + (med.price * (100 - med.stock)), 0)
const serviceSales = mockServices.reduce((sum, service) => sum + service.price, 0)

// Chart data
const dailyEarningsData = [
  { day: 'Mon', earnings: 4500, patients: 8 },
  { day: 'Tue', earnings: 5200, patients: 12 },
  { day: 'Wed', earnings: 3800, patients: 7 },
  { day: 'Thu', earnings: 6100, patients: 15 },
  { day: 'Fri', earnings: 4800, patients: 10 },
  { day: 'Sat', earnings: 7200, patients: 18 },
  { day: 'Sun', earnings: 3500, patients: 6 }
]

const revenueBreakdownData = [
  { name: 'Consultation', value: 40, color: '#2563EB' },
  { name: 'Medicines', value: 35, color: '#10B981' },
  { name: 'Services', value: 25, color: '#8B5CF6' }
]

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

const DailyEarningsChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={dailyEarningsData}>
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
)

const RevenueBreakdownChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsPie>
      <Pie
        data={revenueBreakdownData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={5}
        dataKey="value"
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {revenueBreakdownData.map((entry, index) => (
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
)

const RecentPatientsTable = () => (
  <div className="space-y-4">
    {mockPatients.slice(0, 5).map((patient) => (
      <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-medical-blue" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{patient.name}</p>
            <p className="text-sm text-gray-500">{patient.id} • {patient.phone}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{patient.age} years</p>
          <p className="text-xs text-gray-500 flex items-center justify-end">
            <Calendar className="w-3 h-3 mr-1" />
            {patient.lastVisit}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="border-2 border-medical-blue text-medical-blue px-3 py-1.5 rounded-lg text-xs hover:bg-medical-blue hover:text-white transition-colors font-medium">
            View
          </button>
          <button className="bg-medical-blue text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium">
            Create Bill
          </button>
        </div>
      </div>
    ))}
  </div>
)

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to RUTVEDA CLINIC</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-medical-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Export Report
          </button>
          <button className="border-2 border-medical-blue text-medical-blue px-4 py-2 rounded-lg hover:bg-medical-blue hover:text-white transition-colors text-sm font-medium">
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard
          title="Patients Today"
          value={patientsToday || 12}
          icon={Users}
          change="+2 from yesterday"
          variant="highlight"
        />
        <SummaryCard
          title="Earnings Today"
          value={`₹${earningsToday.toLocaleString()}`}
          icon={DollarSign}
          change="+12% from yesterday"
          variant="success"
        />
        <SummaryCard
          title="Medicine Sales"
          value={`₹${medicineSales.toLocaleString()}`}
          icon={Pill}
          change="+8% this month"
        />
        <SummaryCard
          title="Service Sales"
          value={`₹${serviceSales.toLocaleString()}`}
          icon={Stethoscope}
          change="+15% this month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Earnings Chart */}
        <ChartCard title="Daily Earnings">
          <DailyEarningsChart />
        </ChartCard>

        {/* Revenue Breakdown */}
        <ChartCard title="Revenue Breakdown">
          <RevenueBreakdownChart />
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
        <RecentPatientsTable />
      </Card>
    </div>
  )
}