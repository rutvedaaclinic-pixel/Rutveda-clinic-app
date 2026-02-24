# Clinic Management System - Frontend UI

A beautiful, professional clinic management system built with React, Vite, and Tailwind CSS. This frontend-only implementation provides a complete UI for managing patients, billing, inventory, and analytics.

## 🎨 Design Features

- **Professional Medical Aesthetic**: Clean, trustworthy appearance with medical blue color scheme
- **Responsive Design**: Fully mobile-friendly with collapsible sidebar
- **Modern UI Components**: Card-based layout with smooth transitions and hover effects
- **Interactive Charts**: Mock data visualization for analytics and reporting

## 📱 Pages & Features

### Dashboard
- Summary cards showing key metrics (Patients Today, Earnings, Medicine Sales, Service Sales)
- Daily earnings bar chart
- Revenue breakdown pie chart
- Recent patients table with quick actions

### Patients
- Search and filter functionality (Today/Month/All)
- Patient table with View/Edit/Create Bill buttons
- Patient details and status indicators

### Billing (Most Comprehensive)
- Patient selection dropdown
- Dynamic medicine addition (add/remove rows with quantities)
- Dynamic services addition
- Real-time calculation summary
- Save & Print functionality

### Analytics
- Daily/Monthly toggle for different time periods
- Revenue charts and breakdowns
- Performance metrics and business insights
- Top services and business summary

### Inventory
- Medicine table with stock levels and progress bars
- Status indicators (In Stock/Low Stock/Expiring Soon)
- Low stock alerts and warnings
- Stock management and expiry tracking

### Add Patient
- Complete patient registration form
- Auto-generated patient ID
- Medical history section
- Form validation and error handling

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React Icons
- **Charts**: Chart.js integration ready
- **Routing**: React Router DOM v7
- **State Management**: React Context + Local Storage ready

## 🎯 Color Palette

- **Medical Blue**: #2563EB (Primary)
- **Success Green**: #10B981 (Secondary)
- **Danger Red**: #EF4444 (Alerts)
- **Background**: #F9FAFB
- **Cards**: #FFFFFF

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd clinic-management-ui
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5174`

## 📁 Project Structure

```
clinic-management-ui/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── layout/           # Sidebar, Navbar, Layout
│   │   ├── ui/              # Reusable components
│   │   └── pages/           # All 6 main pages
│   ├── context/             # State management
│   ├── utils/               # Helper functions
│   ├── App.jsx              # Main routing
│   └── main.jsx             # Entry point
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies
```

## 🔧 UI Components

### Layout Components
- **Sidebar**: Collapsible navigation with menu items
- **Navbar**: Top navigation with search and user info
- **Layout**: Main layout wrapper with responsive design

### UI Components
- **Card**: Reusable card component with variants
- **Table**: Data table with headers and responsive design
- **Button**: Styled buttons with multiple variants
- **InputField**: Form input with validation
- **SelectField**: Dropdown select with options
- **ChartCard**: Chart wrapper with styling

## 📊 Mock Data

The application includes comprehensive mock data for:
- 8 patients with realistic information
- 5 medicines with stock levels and expiry dates
- 5 services with pricing
- 2 sample bills for testing

## 🎨 Custom Design System

The project includes a custom design system with:
- Custom color palette (medical blue, success green, danger red)
- Typography scale using Inter font
- Spacing and sizing system
- Component variants and states
- Responsive breakpoints

## 📱 Responsive Design

- **Mobile**: Collapsible sidebar, stacked layouts, touch-friendly interactions
- **Tablet**: Optimized grid layouts and navigation
- **Desktop**: Full sidebar, multi-column layouts, hover effects

## 🔮 Ready for Backend Integration

This frontend is designed to be easily connected to a backend:

1. **API Endpoints**: Ready for RESTful API integration
2. **State Management**: Context providers set up for data fetching
3. **Form Handling**: Validation and submission ready for API calls
4. **Routing**: Clean URL structure for backend routing
5. **Data Structure**: Well-defined mock data structure for API contracts

## 🚀 Future Enhancements

- **Authentication**: Login/logout functionality
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Charts**: More sophisticated data visualization
- **Export Features**: PDF/Excel export functionality
- **Multi-language**: Internationalization support
- **Accessibility**: Enhanced ARIA labels and keyboard navigation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions, please open an issue in the repository.