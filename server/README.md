# RUTVEDA CLINIC - Backend API

A production-ready backend API for the RUTVEDA CLINIC Management System.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control
- **Patient Management**: Complete CRUD operations with search and filtering
- **Medicine Inventory**: Stock tracking with low-stock and expiry alerts
- **Service Management**: Clinic services with pricing
- **Billing System**: Comprehensive billing with automatic stock updates
- **Analytics Dashboard**: Revenue tracking, growth metrics, and insights

## 📁 Project Structure

```
server/
├── config/
│   ├── db.js           # MongoDB connection
│   └── config.env      # Environment variables
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── medicineController.js
│   ├── serviceController.js
│   ├── billController.js
│   └── analyticsController.js
├── middleware/
│   ├── auth.js         # JWT authentication
│   └── validate.js     # Request validation
├── models/
│   ├── User.js
│   ├── Patient.js
│   ├── Medicine.js
│   ├── Service.js
│   └── Bill.js
├── routes/
│   ├── auth.js
│   ├── patients.js
│   ├── medicines.js
│   ├── services.js
│   ├── bills.js
│   └── analytics.js
├── utils/
│   ├── response.js     # API response helpers
│   └── calculator.js   # Business calculations
├── server.js           # Entry point
├── package.json
└── README.md
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `config/config.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/rutveda-clinic
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

3. Start MongoDB (if using local):
```bash
mongod
```

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register user (Admin only) |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| POST | `/api/auth/logout` | Logout user |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients (paginated) |
| GET | `/api/patients/today` | Get today's patients |
| GET | `/api/patients/search` | Search patients |
| GET | `/api/patients/stats` | Patient statistics |
| GET | `/api/patients/:id` | Get single patient |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get all medicines |
| GET | `/api/medicines/low-stock` | Low stock alerts |
| GET | `/api/medicines/expiring` | Expiring soon |
| GET | `/api/medicines/stats` | Medicine statistics |
| POST | `/api/medicines` | Add medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| PUT | `/api/medicines/:id/stock` | Update stock |
| DELETE | `/api/medicines/:id` | Delete medicine |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/all` | All services (dropdown) |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | Get all bills |
| GET | `/api/bills/today` | Today's bills |
| GET | `/api/bills/stats` | Bill statistics |
| GET | `/api/bills/patient/:id` | Bills by patient |
| POST | `/api/bills` | Create bill |
| PUT | `/api/bills/:id` | Update bill |
| DELETE | `/api/bills/:id` | Delete bill (Admin) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Dashboard summary |
| GET | `/api/analytics/daily-earnings` | Daily earnings chart |
| GET | `/api/analytics/monthly-growth` | Monthly growth chart |
| GET | `/api/analytics/revenue-split` | Revenue breakdown |
| GET | `/api/analytics/recent-patients` | Recent patients |
| GET | `/api/analytics/top-services` | Top services |
| GET | `/api/analytics/top-medicines` | Top medicines |
| GET | `/api/analytics/performance` | Performance metrics |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## 🔐 Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### User Roles
- `admin`: Full access to all endpoints
- `doctor`: Can manage patients, bills, medicines
- `receptionist`: Can view and create patients/bills

## 📝 Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🚀 Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `MONGO_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Secret key for JWT
   - `JWT_EXPIRE` - Token expiration (e.g., `7d`)
   - `FRONTEND_URL` - Your frontend URL
   - `NODE_ENV` - Set to `production`

## 📊 Database Models

### User
- name, email, password (hashed)
- role: admin/doctor/receptionist
- phone, isActive, lastLogin

### Patient
- patientId (auto-generated: DOC001)
- name, phone, age, gender
- email, address, bloodGroup, medicalHistory
- lastVisit, status

### Medicine
- medicineId (auto-generated: MED001)
- name, buyingPrice, sellingPrice, stock
- expiryDate, manufacturer, category
- status (auto-calculated)

### Service
- serviceId (auto-generated: SER001)
- name, price, duration, description

### Bill
- billId (auto-generated: BILL001)
- patient, patientName
- consultationFee, medicines[], services[]
- totalAmount (auto-calculated)
- paymentStatus, paymentMethod

## 📄 License

MIT License - RUTVEDA CLINIC