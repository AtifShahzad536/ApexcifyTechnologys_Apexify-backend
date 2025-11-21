import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const dummyProducts = [
    {
        name: "MacBook Pro 16-inch M3 Max",
        description: "The most powerful MacBook Pro ever. With the blazing-fast M3 Max chip, up to 128GB unified memory, and stunning Liquid Retina XDR display.",
        price: 2499,
        category: "Electronics",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
        featured: true
    },
    {
        name: "Sony WH-1000XM5 Headphones",
        description: "Industry-leading noise cancellation with premium sound quality. 30-hour battery life and superior call quality.",
        price: 399,
        category: "Electronics",
        stock: 45,
        images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"]
    },
    {
        name: "Nike Air Max 2024",
        description: "Revolutionary comfort meets iconic style. Premium cushioning technology for all-day wear.",
        price: 189,
        category: "Clothing",
        stock: 120,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
        featured: true
    },
    {
        name: "Leather Messenger Bag",
        description: "Handcrafted genuine leather messenger bag. Perfect for work or travel with multiple compartments.",
        price: 159,
        category: "Clothing",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]
    },
    {
        name: "Smart Watch Series 9",
        description: "Advanced health monitoring, fitness tracking, and always-on display. Water resistant up to 50m.",
        price: 429,
        category: "Electronics",
        stock: 60,
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"],
        featured: true
    },
    {
        name: "Organic Green Tea Set",
        description: "Premium organic green tea collection. 12 varieties sourced from the finest tea gardens.",
        price: 45,
        category: "Food",
        stock: 200,
        images: ["https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800"]
    },
    {
        name: "Minimalist Desk Lamp",
        description: "Modern LED desk lamp with adjustable brightness and color temperature. USB-C rechargeable.",
        price: 79,
        category: "Home & Garden",
        stock: 85,
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"]
    },
    {
        name: "Yoga Mat Premium",
        description: "Eco-friendly non-slip yoga mat with alignment marks. 6mm thickness for optimal cushioning.",
        price: 69,
        category: "Sports",
        stock: 150,
        images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"]
    },
    {
        name: "Wireless Keyboard & Mouse Combo",
        description: "Slim wireless keyboard and precision mouse set. Multi-device connectivity with long battery life.",
        price: 89,
        category: "Electronics",
        stock: 95,
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"]
    },
    {
        name: "Designer Sunglasses",
        description: "UV400 protection polarized lenses. Lightweight titanium frame with premium case included.",
        price: 199,
        category: "Clothing",
        stock: 75,
        images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"]
    },
    {
        name: "Portable Bluetooth Speaker",
        description: "360° premium sound with deep bass. Waterproof, 20-hour battery, and built-in power bank.",
        price: 149,
        category: "Electronics",
        stock: 110,
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"],
        featured: true
    },
    {
        name: "Stainless Steel Water Bottle",
        description: "Vacuum insulated keeps drinks cold for 24h, hot for 12h. BPA-free with leak-proof cap.",
        price: 35,
        category: "Home & Garden",
        stock: 250,
        images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800"]
    },
    {
        name: "Gaming Mouse RGB",
        description: "Professional gaming mouse with 16000 DPI sensor. Programmable buttons and customizable RGB lighting.",
        price: 79,
        category: "Electronics",
        stock: 130,
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]
    },
    {
        name: "Organic Cotton T-Shirt",
        description: "Soft, breathable 100% organic cotton. Available in multiple colors. Sustainable and fair-trade.",
        price: 29,
        category: "Clothing",
        stock: 300,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"]
    },
    {
        name: "Aromatherapy Essential Oil Set",
        description: "10 pure essential oils for relaxation, energy, and wellness. Includes diffuser-ready blends.",
        price: 49,
        category: "Home & Garden",
        stock: 180,
        images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800"]
    },
    {
        name: "Professional Camera Tripod",
        description: "Aluminum alloy tripod with fluid head. Supports up to 10kg. Perfect for photography and videography.",
        price: 129,
        category: "Electronics",
        stock: 55,
        images: ["https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800"]
    },
    {
        name: "Gourmet Coffee Beans 1kg",
        description: "Single-origin arabica beans. Freshly roasted with notes of chocolate and caramel.",
        price: 24,
        category: "Food",
        stock: 400,
        images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800"]
    },
    {
        name: "Smart Home Hub",
        description: "Control all your smart devices from one place. Voice control compatible with Alexa and Google.",
        price: 99,
        category: "Electronics",
        stock: 70,
        images: ["https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800"]
    },
    {
        name: "Resistance Bands Set",
        description: "5-piece resistance band set for home workouts. Includes door anchor, handles, and carry bag.",
        price: 39,
        category: "Sports",
        stock: 220,
        images: ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800"]
    },
    {
        name: "Luxury Scented Candle",
        description: "Hand-poured soy wax candle with premium fragrance. 60-hour burn time in elegant glass jar.",
        price: 45,
        category: "Home & Garden",
        stock: 160,
        images: ["https://images.unsplash.com/photo-1602874801006-e583da8edbc9?w=800"]
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        await User.deleteOne({ email: 'vendor@apexify.com' });
        console.log('🗑️  Deleted existing vendor user');

        let vendor = await User.create({
            name: 'Apexify Vendor',
            email: 'vendor@apexify.com',
            password: 'vendor123',
            role: 'vendor',
            phone: '+1234567890',
            vendorInfo: {
                storeName: 'Apexify Store',
                storeDescription: 'Official Apexify store with premium products',
                businessLicense: 'BL123456',
                verified: true
            }
        });
        console.log('✅ Created vendor user');

        const productsWithVendor = dummyProducts.map(product => ({
            ...product,
            vendor: vendor._id,
            averageRating: Math.random() * 1 + 4, // Random rating between 4.0-5.0
            isActive: true
        }));

        const createdProducts = await Product.insertMany(productsWithVendor);

        console.log(`✅ Created ${createdProducts.length} dummy products`);
        console.log('\n📦 Sample products:');
        createdProducts.slice(0, 5).forEach(p => {
            console.log(`  - ${p.name} ($${p.price}) -  ${p.category}`);
        });

        console.log('\n✨ Seed completed successfully!');
        console.log('\n🔑 Vendor Credentials:');
        console.log('   Email: vendor@apexify.com');
        console.log('   Password: vendor123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
