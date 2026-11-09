const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const RoomOccupancy = require('../models/RoomOccupancy');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const { generateOccupancyNights, normalizeToUtcMidnight } = require('../utils/dateUtils');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      RoomType.deleteMany({}),
      Room.deleteMany({}),
      RoomOccupancy.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database records.');

    // 1. Create Demo Users
    console.log('👤 Creating demo accounts...');
    const adminUser = await User.create({
      name: 'Alexander Stone (Admin)',
      email: 'admin@hotel.demo',
      passwordHash: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const staffUser = await User.create({
      name: 'Elena Rostova (Staff)',
      email: 'staff@hotel.demo',
      passwordHash: 'Staff@123',
      role: 'staff',
      phone: '+91 98765 43211',
    });

    const guestUser = await User.create({
      name: 'Sophia Patel (Guest)',
      email: 'guest@hotel.demo',
      passwordHash: 'Guest@123',
      role: 'guest',
      phone: '+91 98765 43212',
    });

    console.log('✅ Demo accounts created:');
    console.log('   Admin: admin@hotel.demo / Admin@123');
    console.log('   Staff: staff@hotel.demo / Staff@123');
    console.log('   Guest: guest@hotel.demo / Guest@123');

    // 2. Create Room Types
    console.log('🏨 Creating room types...');
    const standardType = await RoomType.create({
      name: 'Standard Room',
      description: 'Cozy and modern room featuring premium bedding, high-speed Wi-Fi, and a dedicated workspace. Ideal for solo business travelers or couples.',
      basePrice: 2000,
      capacity: 2,
      amenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'En-suite Bathroom', 'Work Desk'],
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const deluxeType = await RoomType.create({
      name: 'Deluxe Room',
      description: 'Spacious room boasting luxury linen, private balcony with scenic skyline view, minibar, and premium bath amenities.',
      basePrice: 3500,
      capacity: 2,
      amenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Smart 4K TV', 'City View Balcony', 'Mini Bar', 'Bathtub & Shower'],
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const premiumType = await RoomType.create({
      name: 'Premium Suite',
      description: 'Elegant suite with king-size bed, private lounge area, panoramic sea view, espresso machine, and VIP concierge access.',
      basePrice: 5000,
      capacity: 3,
      amenities: ['High-speed Wi-Fi', 'Central Climate Control', '55" OLED TV', 'Panoramic View', 'Mini Bar', 'Soaking Bathtub', 'Espresso Machine', '24/7 Room Service'],
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const familySuiteType = await RoomType.create({
      name: 'Family Suite',
      description: 'Expansive multi-room residence featuring 2 king bedrooms, dining lounge, kitchenette, dual bathrooms, and wraparound terrace.',
      basePrice: 7000,
      capacity: 4,
      amenities: ['High-speed Wi-Fi', '2 Separate Bedrooms', 'Kitchenette & Fridge', 'Dining Lounge', 'Wraparound Terrace', '2 Bathrooms', 'Smart TVs in all rooms'],
      images: [
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    console.log('✅ 4 Room types created.');

    // 3. Create Individual Rooms
    console.log('🚪 Creating individual rooms...');
    const roomsData = [
      { roomNumber: '101', roomTypeId: standardType._id, floor: 1, status: 'available' },
      { roomNumber: '102', roomTypeId: standardType._id, floor: 1, status: 'available' },
      { roomNumber: '201', roomTypeId: deluxeType._id, floor: 2, status: 'available' },
      { roomNumber: '202', roomTypeId: deluxeType._id, floor: 2, status: 'available' },
      { roomNumber: '301', roomTypeId: premiumType._id, floor: 3, status: 'available' },
      { roomNumber: '401', roomTypeId: familySuiteType._id, floor: 4, status: 'available' },
      { roomNumber: '402', roomTypeId: familySuiteType._id, floor: 4, status: 'maintenance', notes: 'HVAC servicing in progress' },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`✅ ${createdRooms.length} Rooms created.`);

    // 4. Create Sample Historic & Active Bookings for Reporting
    console.log('📅 Seeding realistic bookings and occupancies...');
    const now = new Date();
    const today = normalizeToUtcMidnight(now);

    // Past Booking 1 (Checked Out)
    const pastCheckIn = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
    const pastCheckOut = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const pastNights = 3;
    const pastTotalCharges = 3500 * pastNights;
    const pastTax = Math.round(pastTotalCharges * 0.12);
    const pastFee = Math.round(pastTotalCharges * 0.05);

    const pastBooking = await Booking.create({
      bookingReference: 'HB-DEMO-001',
      guestId: guestUser._id,
      roomId: createdRooms[2]._id, // 201 Deluxe
      roomTypeId: deluxeType._id,
      guestDetails: {
        name: guestUser.name,
        email: guestUser.email,
        phone: guestUser.phone,
        specialRequests: 'High floor preferred',
      },
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      nights: pastNights,
      numberOfGuests: 2,
      pricing: {
        nightlyRate: 3500,
        totalRoomCharges: pastTotalCharges,
        taxAmount: pastTax,
        serviceFee: pastFee,
        totalAmount: pastTotalCharges + pastTax + pastFee,
        currency: 'INR',
      },
      status: 'checked-out',
      paymentStatus: 'paid',
      checkedInAt: pastCheckIn,
      checkedOutAt: pastCheckOut,
    });

    await Payment.create({
      bookingId: pastBooking._id,
      amount: pastBooking.pricing.totalAmount,
      currency: 'INR',
      method: 'credit_card',
      status: 'success',
      transactionReference: 'TXN-PAST-001-SUCCESS',
      idempotencyKey: 'idemp-seed-001',
    });

    // Active Stay Booking (Checked In today)
    const activeCheckIn = today;
    const activeCheckOut = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const activeNights = 2;
    const activeTotalCharges = 5000 * activeNights;
    const activeTax = Math.round(activeTotalCharges * 0.12);
    const activeFee = Math.round(activeTotalCharges * 0.05);

    const activeBooking = await Booking.create({
      bookingReference: 'HB-DEMO-002',
      guestId: guestUser._id,
      roomId: createdRooms[4]._id, // 301 Premium
      roomTypeId: premiumType._id,
      guestDetails: {
        name: guestUser.name,
        email: guestUser.email,
        phone: guestUser.phone,
        specialRequests: 'Late arrival',
      },
      checkIn: activeCheckIn,
      checkOut: activeCheckOut,
      nights: activeNights,
      numberOfGuests: 2,
      pricing: {
        nightlyRate: 5000,
        totalRoomCharges: activeTotalCharges,
        taxAmount: activeTax,
        serviceFee: activeFee,
        totalAmount: activeTotalCharges + activeTax + activeFee,
        currency: 'INR',
      },
      status: 'checked-in',
      paymentStatus: 'paid',
      checkedInAt: new Date(),
    });

    await Payment.create({
      bookingId: activeBooking._id,
      amount: activeBooking.pricing.totalAmount,
      currency: 'INR',
      method: 'upi',
      status: 'success',
      transactionReference: 'TXN-ACTIVE-002-SUCCESS',
      idempotencyKey: 'idemp-seed-002',
    });

    // Insert occupancies for active stay
    const activeOccupancyNights = generateOccupancyNights(activeCheckIn, activeCheckOut);
    await RoomOccupancy.insertMany(
      activeOccupancyNights.map((n) => ({
        roomId: createdRooms[4]._id,
        night: n.night,
        date: n.date,
        bookingId: activeBooking._id,
        status: 'confirmed',
      }))
    );

    // Initial Audit Logs
    await AuditLog.create([
      {
        actorId: adminUser._id,
        actorName: adminUser.name,
        actorRole: adminUser.role,
        action: 'SYSTEM_SEEDED',
        entityType: 'System',
        entityId: 'SEED-INIT',
        details: { message: 'Database seeded with default demo inventory and accounts' },
      },
      {
        actorId: staffUser._id,
        actorName: staffUser.name,
        actorRole: staffUser.role,
        action: 'GUEST_CHECKED_IN',
        entityType: 'Booking',
        entityId: activeBooking._id,
        details: { reference: activeBooking.bookingReference, room: '301' },
      },
    ]);

    console.log('✅ Seed data successfully populated!');
    console.log('🎉 Setup complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

