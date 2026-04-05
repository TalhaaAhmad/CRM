const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testOperations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create a staff user
        const staffEmail = 'staff@example.com';
        let staff = await User.findOne({ email: staffEmail });
        if (staff) {
            await User.deleteOne({ email: staffEmail });
            console.log('Deleted existing staff user');
        }

        staff = await User.create({
            name: 'Staff User',
            email: staffEmail,
            password: 'password123',
            role: 'staff'
        });
        console.log('Created staff user:', staff.name);

        // 2. Update the staff user
        staff.name = 'Updated Staff User';
        await staff.save();
        console.log('Updated staff user name');

        // 3. Check roles
        const admin = await User.findOne({ role: 'admin' });
        console.log('Admin found:', admin?.name);

        console.log('Test completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

testOperations();
