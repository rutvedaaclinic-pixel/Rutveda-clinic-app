const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'config/config.env') });

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('=== DEBUGGING LOGIN PROCESS ===');
    
    const email = 'rutveda.clinic@gmail.com';
    const password = 'admin123';
    
    console.log('1. Looking for user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('2. Checking if user is active:', user.isActive);
    
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }
    
    console.log('3. Testing password comparison...');
    const isMatch = await user.comparePassword(password);
    console.log('✅ Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return;
    }
    
    console.log('✅ All checks passed - login should work');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();