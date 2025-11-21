import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        const adminEmail = 'admin@apexify.com';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            process.exit(0);
        }

        await User.create({
            name: 'Apexify Admin',
            email: adminEmail,
            password: 'admin123',
            role: 'admin',
            phone: '+1234567890'
        });

        console.log('✅ Admin user created successfully');
        console.log('\n🔑 Admin Credentials:');
        console.log('   Email: admin@apexify.com');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
