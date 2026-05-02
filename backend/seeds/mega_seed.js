const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const User = require('../models/User');
const Resident = require('../models/Resident');
const Room = require('../models/Room');
const Attendance = require('../models/Attendance');
const FoodPreference = require('../models/FoodPreference');
const Complaint = require('../models/Complaint');
const Cleaning = require('../models/Cleaning');
const Visitor = require('../models/Visitor');
const Payment = require('../models/Payment');
const Meal = require('../models/Meal');

const seedData = async () => {
  const ts = Date.now();

  const roomImages = [
    [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop'
    ],
    [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=800&auto=format&fit=crop'
    ],
    [
      'https://images.unsplash.com/photo-1555854817-2b224621a0a9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&auto=format&fit=crop'
    ],
    [
      'https://images.unsplash.com/photo-1536633390841-83193c4ef058?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1623624436279-9c8417d7c0f7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'
    ],
    [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop'
    ],
    [
      'https://images.unsplash.com/photo-1623624436279-9c8417d7c0f7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop'
    ]
  ];

  const residentNames = [
    { first: 'Kamal', full: 'Kamal Perera' },
    { first: 'Nimal', full: 'Nimal Silva' },
    { first: 'Sunil', full: 'Sunil Fernando' },
    { first: 'Anura', full: 'Anura Kumara' },
    { first: 'Dasun', full: 'Dasun Shanaka' },
    { first: 'Mahela', full: 'Mahela Jayawardena' }
  ];

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Cleaning all existing seed data...');
    // Safer to delete all residents and users involved in seeding
    await User.deleteMany({ role: 'resident' });
    await Resident.deleteMany({});
    await Room.deleteMany({});
    await Attendance.deleteMany({});
    await FoodPreference.deleteMany({});
    await Complaint.deleteMany({});
    await Cleaning.deleteMany({});
    await Visitor.deleteMany({});
    await Payment.deleteMany({});

    console.log('--- SEEDING ROOMS ---');
    const roomSpecs = [
      { type: 'Single', price: 15000, facilities: ['AC', 'WIFI', 'Attached Bathroom', 'Study Table', 'Water Heater'], status: 'available' },
      { type: 'Double', price: 12000, facilities: ['AC', 'WIFI', 'Attached Bathroom', 'Balcony'], status: 'occupied' },
      { type: 'Triple', price: 9000, facilities: ['WIFI', 'Attached Bathroom', 'Study Table'], status: 'maintenance' },
      { type: 'Shared', price: 6000, facilities: ['WIFI', 'Study Table'], status: 'available' },
      { type: 'Double', price: 12500, facilities: ['AC', 'WIFI', 'Balcony', 'Water Heater'], status: 'reserved' },
      { type: 'Single', price: 14500, facilities: ['WIFI', 'Attached Bathroom', 'Study Table', 'Balcony'], status: 'available' }
    ];

    const roomsData = roomSpecs.map((spec, i) => ({
      roomNumber: `Room ${101 + i}`,
      roomType: spec.type,
      capacity: spec.type === 'Single' ? 1 : (spec.type === 'Double' ? 2 : (spec.type === 'Triple' ? 3 : 4)),
      currentOccupancy: 0,
      pricePerMonth: spec.price,
      description: `Elite ${spec.type} room with curated facilities.`,
      facilities: spec.facilities,
      images: roomImages[i],
      status: spec.status
    }));
    const rooms = await Room.insertMany(roomsData);

    console.log('--- SEEDING RESIDENTS ---');
    const residents = [];
    for (let i = 0; i < 6; i++) {
      const email = `${residentNames[i].first.toLowerCase()}@gmail.com`;
      const name = residentNames[i].full;

      const user = new User({
        name, email, password: 'password123',
        phone: `071234567${i}`, role: 'resident'
      });
      await user.save();

      const resident = new Resident({
        name, email, phone: `071234567${i}`,
        nic: i < 3 ? `98765432${i}V` : `20001234567${i}`,
        course: 'Software Engineering', year: 1,
        guardianName: 'Guardian', guardianPhone: '0770000000',
        roomId: rooms[i]._id, status: 'active'
      });
      await resident.save();
      residents.push(resident);

      // FIX: If a resident is assigned, increment occupancy (unless room is in maintenance)
      if (rooms[i].status !== 'maintenance') {
        rooms[i].currentOccupancy = 1;
        // The model hook will handle status: 'occupied' automatically if occupancy reaches capacity
        await rooms[i].save();
      }
    }

    console.log('--- SEEDING VISITORS (6 RECORDS) ---');
    const visitorData = [
      { fullName: 'Samantha Bandara', phoneNumber: '0711111111', email: 'Samantha1@gmail.com', preferredRoomType: 'Single', preferredVisitDate: new Date(), message: 'Tour of hostel.', status: 'approved' },
      { fullName: 'Nuwan Perera', phoneNumber: '0722222222', email: 'Nuwan2@gmail.com', preferredRoomType: 'Double', preferredVisitDate: new Date(), message: 'Inquiry.', status: 'pending' },
      { fullName: 'Ruwan Kumara', phoneNumber: '0733333333', email: 'Ruwan3@gmail.com', preferredRoomType: 'Triple', preferredVisitDate: new Date(), message: 'Visiting brother.', status: 'approved' },
      { fullName: 'Kasun Silva', phoneNumber: '0744444444', email: 'Kasun4@gmail.com', preferredRoomType: 'Shared', preferredVisitDate: new Date(), message: 'Checking facilities.', status: 'rejected' },
      { fullName: 'Malith Fernando', phoneNumber: '0755555555', email: 'Malith5@gmail.com', preferredRoomType: 'Any', preferredVisitDate: new Date(), message: 'Room booking.', status: 'pending' },
      { fullName: 'Dinesh Gamage', phoneNumber: '0766666666', email: 'Dinesh6@gmail.com', preferredRoomType: 'Single', preferredVisitDate: new Date(), message: 'Finalizing admission.', status: 'approved' }
    ];
    await Visitor.insertMany(visitorData);

    console.log('--- SEEDING OTHERS ---');
    console.log('--- SEEDING ATTENDANCE (with times) ---');
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const attendanceRecords = residents.map((r, i) => ({
      residentId: r._id,
      date: todayMidnight,
      status: 'present',
      checkInTime: `08:${30 + i} AM`,
      checkOutTime: `05:${15 + i} PM`,
      verified: i < 3 // First 3 verified, rest pending
    }));
    await Attendance.insertMany(attendanceRecords);
    await FoodPreference.insertMany(residents.map(r => ({ residentId: r._id, preference: 'non-veg' })));

    for (let i = 0; i < 6; i++) {
      await new Complaint({
        residentId: residents[i]._id,
        complaintNumber: `CMP-FINAL-${ts}-${i}`,
        title: `Issue in ${rooms[i].roomNumber}`,
        description: `Please check facilities.`,
        category: 'maintenance',
        status: 'pending'
      }).save();
    }

    await Cleaning.insertMany(rooms.map((room, i) => ({
      roomId: room._id, cleanerName: 'Staff', date: new Date(), time: '12:00 PM', status: 'completed'
    })));

    await Payment.insertMany(residents.map((r, i) => ({
      residentId: r._id,
      roomId: r.roomId,
      month: new Date(),
      amount: rooms[i].pricePerMonth,
      foodAmount: 5000,
      netAmount: rooms[i].pricePerMonth + 5000,
      dueDate: new Date(new Date().setDate(25)),
      status: i % 2 === 0 ? 'paid' : 'pending',
      transactionId: `TXN-V6-${ts}-${i}`,
      paidDate: i % 2 === 0 ? new Date() : null,
      paymentMethod: 'online',
      remarks: `Rent for ${rooms[i].roomNumber}`
    })));

    // Seed Today's Menu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Meal.create({
      date: today,
      breakfast: { item: 'Milk Rice with Lunu Miris', time: '07:30 AM', price: 150 },
      lunch: { item: 'Rice & Curry with Fish', time: '12:30 PM', price: 350 },
      dinner: { item: 'Kottu Roti / String Hoppers', time: '07:30 PM', price: 300 },
      snacks: { item: 'Tea & Biscuits', time: '04:00 PM', price: 50 },
      special: 'Fresh Fruit Juice available at Lunch'
    });

    // Seed Initial Food Preferences
    await FoodPreference.insertMany(residents.map(r => ({
      residentId: r._id,
      preference: 'non-veg',
      mealType: ['breakfast', 'lunch', 'dinner']
    })));

    console.log('\nALL DATA INCLUDING 6 VISITORS & TODAY\'S MENU SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('SEED ERROR:', err);
    process.exit(1);
  }
};

seedData();
