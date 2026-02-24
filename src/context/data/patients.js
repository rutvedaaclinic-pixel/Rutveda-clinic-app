export const mockPatients = [
  {
    id: 'DOC001',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    age: 35,
    gender: 'Male',
    lastVisit: '2024-02-22',
    status: 'Active'
  },
  {
    id: 'DOC002',
    name: 'Jane Smith',
    phone: '+1 (555) 234-5678',
    age: 28,
    gender: 'Female',
    lastVisit: '2024-02-20',
    status: 'Active'
  },
  {
    id: 'DOC003',
    name: 'Robert Johnson',
    phone: '+1 (555) 345-6789',
    age: 42,
    gender: 'Male',
    lastVisit: '2024-02-18',
    status: 'Active'
  },
  {
    id: 'DOC004',
    name: 'Sarah Wilson',
    phone: '+1 (555) 456-7890',
    age: 31,
    gender: 'Female',
    lastVisit: '2024-02-15',
    status: 'Active'
  },
  {
    id: 'DOC005',
    name: 'Michael Brown',
    phone: '+1 (555) 567-8901',
    age: 45,
    gender: 'Male',
    lastVisit: '2024-02-12',
    status: 'Active'
  },
  {
    id: 'DOC006',
    name: 'Emily Davis',
    phone: '+1 (555) 678-9012',
    age: 29,
    gender: 'Female',
    lastVisit: '2024-02-10',
    status: 'Active'
  },
  {
    id: 'DOC007',
    name: 'David Miller',
    phone: '+1 (555) 789-0123',
    age: 38,
    gender: 'Male',
    lastVisit: '2024-02-08',
    status: 'Active'
  },
  {
    id: 'DOC008',
    name: 'Lisa Taylor',
    phone: '+1 (555) 890-1234',
    age: 33,
    gender: 'Female',
    lastVisit: '2024-02-05',
    status: 'Active'
  }
]

export const mockMedicines = [
  {
    id: 'MED001',
    name: 'Paracetamol 500mg',
    price: 50,
    stock: 100,
    expiry: '2025-12-31',
    status: 'in-stock'
  },
  {
    id: 'MED002',
    name: 'Amoxicillin 250mg',
    price: 80,
    stock: 50,
    expiry: '2025-06-30',
    status: 'in-stock'
  },
  {
    id: 'MED003',
    name: 'Ibuprofen 400mg',
    price: 60,
    stock: 20,
    expiry: '2024-12-31',
    status: 'low-stock'
  },
  {
    id: 'MED004',
    name: 'Omeprazole 20mg',
    price: 120,
    stock: 80,
    expiry: '2025-09-30',
    status: 'in-stock'
  },
  {
    id: 'MED005',
    name: 'Cetirizine 10mg',
    price: 40,
    stock: 5,
    expiry: '2024-08-31',
    status: 'expiring-soon'
  }
]

export const mockServices = [
  {
    id: 'SER001',
    name: 'General Consultation',
    price: 500
  },
  {
    id: 'SER002',
    name: 'Dental Checkup',
    price: 800
  },
  {
    id: 'SER003',
    name: 'Blood Test',
    price: 300
  },
  {
    id: 'SER004',
    name: 'X-Ray',
    price: 1200
  },
  {
    id: 'SER005',
    name: 'Vaccination',
    price: 200
  }
]

export const mockBills = [
  {
    id: 'BILL001',
    patientId: 'DOC001',
    patientName: 'John Doe',
    date: '2024-02-22',
    consultation: 500,
    medicines: [
      { name: 'Paracetamol', quantity: 2, price: 50, total: 100 }
    ],
    services: [
      { name: 'General Consultation', price: 500 }
    ],
    total: 1100
  },
  {
    id: 'BILL002',
    patientId: 'DOC002',
    patientName: 'Jane Smith',
    date: '2024-02-20',
    consultation: 500,
    medicines: [
      { name: 'Ibuprofen', quantity: 3, price: 60, total: 180 }
    ],
    services: [],
    total: 680
  }
]