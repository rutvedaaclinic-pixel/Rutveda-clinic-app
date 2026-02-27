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

const resetPassword = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Resetting password...');

    // Find the user
    const user = await User.findOne({ email: 'rutveda.clinic@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found! Run "npm run seed" to create the user first.');
      process.exit(1);
    }

    // Set new password (will be hashed automatically by pre-save hook)
    user.password = 'admin123';
    await user.save();

    console.log('\n✅ Password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 New Login Credentials:');
    console.log('   Email: rutveda.clinic@gmail.com');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

// Run reset
resetPassword();