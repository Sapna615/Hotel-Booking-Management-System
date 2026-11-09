const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const RoomOccupancy = require('../models/RoomOccupancy');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

require('./setup');

describe('🏨 Hotel Booking Management System Test Suite', () => {
  let guestToken;
  let guestUser;
  let staffToken;
  let staffUser;
  let adminToken;
  let adminUser;
  let testRoomType;
  let testRoom;

  beforeEach(async () => {
    // 1. Seed Roles & Users
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: 'Admin@123',
      role: 'admin',
    });

    staffUser = await User.create({
      name: 'Test Staff',
      email: 'staff@test.com',
      passwordHash: 'Staff@123',
      role: 'staff',
    });

    guestUser = await User.create({
      name: 'Test Guest',
      email: 'guest@test.com',
      passwordHash: 'Guest@123',
      role: 'guest',
    });

    // Obtain tokens via login
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123' });
    adminToken = adminLogin.body.data.token;

    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@test.com', password: 'Staff@123' });
    staffToken = staffLogin.body.data.token;

    const guestLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'Guest@123' });
    guestToken = guestLogin.body.data.token;

    // 2. Seed Room Type & Room
    testRoomType = await RoomType.create({
      name: 'Deluxe Suite',
      description: 'Luxury suite with King bed',
      basePrice: 3000,
      capacity: 2,
      amenities: ['Wi-Fi', 'AC', 'TV'],
    });

    testRoom = await Room.create({
      roomNumber: '101',
      roomTypeId: testRoomType._id,
      floor: 1,
      status: 'available',
    });
  });

  // -------------------------------------------------------------
  // Test 1: Authentication & Authorization
  // -------------------------------------------------------------
  describe('1. Authentication & RBAC', () => {
    it('should successfully register a new guest', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Guest',
          email: 'newguest@test.com',
          password: 'Password@123',
          phone: '+91 99999 88888',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newguest@test.com');
      expect(res.body.data.user.role).toBe('guest');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with incorrect password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'guest@test.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should block guests from accessing admin users API (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('should allow admin to access admin users API (200 OK)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  // -------------------------------------------------------------
  // Test 2: Date Validation & Availability
  // -------------------------------------------------------------
  describe('2. Date Validation & Availability', () => {
    it('should reject check-out before or equal to check-in (400)', async () => {
      const res = await request(app)
        .get('/api/availability')
        .query({
          checkIn: '2026-12-15',
          checkOut: '2026-12-10',
          guests: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });

    it('should reject check-in date in the past (400)', async () => {
      const res = await request(app)
        .get('/api/availability')
        .query({
          checkIn: '2020-01-01',
          checkOut: '2020-01-05',
          guests: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });

    it('should return available rooms for valid dates', async () => {
      const res = await request(app)
        .get('/api/availability')
        .query({
          checkIn: '2026-12-10',
          checkOut: '2026-12-12',
          guests: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAvailable).toBe(1);
      expect(res.body.data.rooms[0].room.roomNumber).toBe('101');
      expect(res.body.data.rooms[0].pricing.totalNights).toBe(2);
      expect(res.body.data.rooms[0].pricing.roomCharges).toBe(6000);
    });

    it('should not return rooms that are under maintenance', async () => {
      // Set room 101 to maintenance
      await Room.findByIdAndUpdate(testRoom._id, { status: 'maintenance' });

      const res = await request(app)
        .get('/api/availability')
        .query({
          checkIn: '2026-12-10',
          checkOut: '2026-12-12',
          guests: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.totalAvailable).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // Test 3: Booking Concurrency & Double-Booking Prevention
  // -------------------------------------------------------------
  describe('3. Booking Concurrency & Double-Booking Prevention', () => {
    it('should successfully hold and confirm a reservation', async () => {
      // 1. Create Hold
      const holdRes = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-10',
          checkOut: '2026-12-13',
          numberOfGuests: 2,
          guestDetails: {
            name: 'Sophia Patel',
            email: 'sophia@test.com',
            phone: '+91 98765 00000',
          },
        });

      expect(holdRes.status).toBe(201);
      expect(holdRes.body.data.status).toBe('pending');
      expect(holdRes.body.data.bookingReference).toBeDefined();
      const bookingId = holdRes.body.data._id;

      // Verify occupancy records created in 'hold' status
      const occupancies = await RoomOccupancy.find({ bookingId });
      expect(occupancies.length).toBe(3); // 3 nights
      expect(occupancies[0].status).toBe('hold');

      // 2. Confirm Booking with simulated payment
      const confirmRes = await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          paymentMethod: 'credit_card',
          shouldSucceed: true,
        });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.booking.status).toBe('confirmed');
      expect(confirmRes.body.data.booking.paymentStatus).toBe('paid');

      // Verify occupancies promoted to 'confirmed'
      const updatedOccupancies = await RoomOccupancy.find({ bookingId });
      expect(updatedOccupancies.every((o) => o.status === 'confirmed')).toBe(true);
    });

    it('should reject overlapping booking for the same room (Conflict 409)', async () => {
      // Booking 1 holds Dec 10 to Dec 13
      const holdRes1 = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-10',
          checkOut: '2026-12-13',
          numberOfGuests: 2,
          guestDetails: {
            name: 'Guest One',
            email: 'one@test.com',
            phone: '+91 11111 11111',
          },
        });
      expect(holdRes1.status).toBe(201);

      // Booking 2 attempts to hold overlapping dates (Dec 12 to Dec 15)
      const holdRes2 = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-12',
          checkOut: '2026-12-15',
          numberOfGuests: 2,
          guestDetails: {
            name: 'Guest Two',
            email: 'two@test.com',
            phone: '+91 22222 22222',
          },
        });

      expect(holdRes2.status).toBe(409);
      expect(holdRes2.body.success).toBe(false);
      expect(holdRes2.body.message).toContain('already occupied or held');
    });

    it('should reject booking that exceeds room capacity (400)', async () => {
      // testRoomType capacity is 2, requesting 4 guests
      const res = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-10',
          checkOut: '2026-12-13',
          numberOfGuests: 4,
          guestDetails: {
            name: 'Large Group',
            email: 'group@test.com',
            phone: '+91 33333 33333',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('EXCEEDS_CAPACITY');
    });

    it('should release occupancy when an expired hold is cleared', async () => {
      // Create hold Dec 10 to Dec 12 with an expired holdExpiresAt timestamp in the past
      const pastExpires = new Date(Date.now() - 5000);
      const booking = await Booking.create({
        bookingReference: 'HB-EXPIRED-TEST',
        guestId: guestUser._id,
        roomId: testRoom._id,
        roomTypeId: testRoomType._id,
        guestDetails: { name: 'Exp Guest', email: 'exp@test.com', phone: '123' },
        checkIn: new Date('2026-12-10'),
        checkOut: new Date('2026-12-12'),
        nights: 2,
        numberOfGuests: 1,
        pricing: { nightlyRate: 3000, totalRoomCharges: 6000, taxAmount: 720, serviceFee: 300, totalAmount: 7020 },
        status: 'pending',
        holdExpiresAt: pastExpires,
      });

      await RoomOccupancy.create([
        { roomId: testRoom._id, night: '2026-12-10', date: new Date('2026-12-10'), bookingId: booking._id, status: 'hold', holdExpiresAt: pastExpires },
        { roomId: testRoom._id, night: '2026-12-11', date: new Date('2026-12-11'), bookingId: booking._id, status: 'hold', holdExpiresAt: pastExpires },
      ]);

      // Availability search should see that hold is expired and report room as AVAILABLE
      const searchRes = await request(app)
        .get('/api/availability')
        .query({
          checkIn: '2026-12-10',
          checkOut: '2026-12-12',
          guests: 1,
        });

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.totalAvailable).toBe(1);

      // Now a new guest can successfully hold it!
      const newHoldRes = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-10',
          checkOut: '2026-12-12',
          numberOfGuests: 1,
          guestDetails: { name: 'New Guest', email: 'new@test.com', phone: '+91 98765 11111' },
        });

      expect(newHoldRes.status).toBe(201);
    });
  });

  // -------------------------------------------------------------
  // Test 4: Operational State Transitions (Check-in, Check-out, Cancellation)
  // -------------------------------------------------------------
  describe('4. Lifecycle State Transitions', () => {
    let activeBookingId;

    beforeEach(async () => {
      // Create and confirm a booking
      const holdRes = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-20',
          checkOut: '2026-12-22',
          numberOfGuests: 2,
          guestDetails: { name: 'Stay Guest', email: 'stay@test.com', phone: '+91 98765 22222' },
        });
      activeBookingId = holdRes.body.data._id;

      await request(app)
        .post(`/api/bookings/${activeBookingId}/confirm`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ paymentMethod: 'upi', shouldSucceed: true });
    });

    it('should allow staff to check in a confirmed booking', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${activeBookingId}/check-in`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('checked-in');
      expect(res.body.data.checkedInAt).toBeDefined();
    });

    it('should reject checking out before checking in', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${activeBookingId}/check-out`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should allow staff to check out after check-in and release occupancy', async () => {
      // 1. Check in
      await request(app)
        .patch(`/api/bookings/${activeBookingId}/check-in`)
        .set('Authorization', `Bearer ${staffToken}`);

      // 2. Check out
      const res = await request(app)
        .patch(`/api/bookings/${activeBookingId}/check-out`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('checked-out');
      expect(res.body.data.checkedOutAt).toBeDefined();

      // Occupancy records removed for completed stay
      const occupancies = await RoomOccupancy.find({ bookingId: activeBookingId });
      expect(occupancies.length).toBe(0);
    });

    it('should cancel confirmed booking and process refund simulation', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${activeBookingId}/cancel`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ cancellationReason: 'Change of travel plans' });

      expect(res.status).toBe(200);
      expect(res.body.data.booking.status).toBe('cancelled');
      expect(res.body.data.booking.paymentStatus).toBe('refunded');
      expect(res.body.data.refundPayment.status).toBe('refunded');

      // Occupancies released
      const occupancies = await RoomOccupancy.find({ bookingId: activeBookingId });
      expect(occupancies.length).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // Test 5: Operations & Reporting Veracity
  // -------------------------------------------------------------
  describe('5. Operations & Reporting', () => {
    it('should verify admin dashboard report matches underlying bookings and payments', async () => {
      // Create confirmed booking with payment
      const holdRes = await request(app)
        .post('/api/bookings/holds')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          roomId: testRoom._id.toString(),
          checkIn: '2026-12-25',
          checkOut: '2026-12-27',
          numberOfGuests: 2,
          guestDetails: { name: 'VIP Guest', email: 'vip@test.com', phone: '+91 98765 33333' },
        });

      const bId = holdRes.body.data._id;
      await request(app)
        .post(`/api/bookings/${bId}/confirm`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ paymentMethod: 'credit_card', shouldSucceed: true });

      const reportRes = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(reportRes.status).toBe(200);
      const kpis = reportRes.body.data.kpis;
      expect(kpis.totalRooms).toBe(1);
      expect(kpis.totalBookings).toBeGreaterThanOrEqual(1);
      expect(kpis.netRevenue).toBeGreaterThan(0);
      expect(kpis.currency).toBe('INR');
    });
  });
});
