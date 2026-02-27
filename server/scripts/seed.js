const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding database...');

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'rutveda.clinic@gmail.com' });
    
    if (existingUser) {
      console.log('Doctor user already exists:');
      console.log('Email: rutveda.clinic@gmail.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create default doctor/admin user
    const doctor = await User.create({
      name: 'Dr. Mihir Thakor',
      email: 'rutveda.clinic@gmail.com',
      password: 'admin123',
      role: 'admin',
      phone: '+919876543210',
      isActive: true
    });

    console.log('\n✅ Doctor user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Login Credentials:');
    console.log('   Email: rutveda.clinic@gmail.com');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('User details:', {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed
seedData();