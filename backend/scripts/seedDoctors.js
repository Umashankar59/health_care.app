const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

const defaultAvailability = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 30 }
];

const mockDoctors = [
  {
    name: 'G. Srinivas',
    email: 'srinivas.neurologist@medlink.in',
    password: 'password123',
    specialty: 'Neurologist',
    clinicAddress: 'Srinivas Neuro Care, Governorpet',
    city: 'Vijayawada',
    phone: '+91 99123 45678',
    rating: 4.8,
    experienceYears: 16,
    availability: defaultAvailability
  },
  {
    name: 'Kavitha Reddy',
    email: 'kavitha.pediatrician@medlink.in',
    password: 'password123',
    specialty: 'Pediatrician',
    clinicAddress: 'Lotus Children Hospital, Eluru Road',
    city: 'Vijayawada',
    phone: '+91 99234 56789',
    rating: 4.7,
    experienceYears: 11,
    availability: defaultAvailability
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.neurologist@medlink.in',
    password: 'password123', // Will be hashed in pre-save hook
    specialty: 'Neurologist',
    clinicAddress: 'Apex Neuro Clinic, Linking Road, Bandra West',
    city: 'Mumbai',
    phone: '+91 98123 45678',
    rating: 4.8,
    experienceYears: 15,
    availability: defaultAvailability
  },
  {
    name: 'Priya Sharma',
    email: 'priya.cardiologist@medlink.in',
    password: 'password123',
    specialty: 'Cardiologist',
    clinicAddress: 'Heart Care Center, Connaught Place',
    city: 'Delhi',
    phone: '+91 98234 56789',
    rating: 4.9,
    experienceYears: 12,
    availability: defaultAvailability
  },
  {
    name: 'Amit Patel',
    email: 'amit.dermatologist@medlink.in',
    password: 'password123',
    specialty: 'Dermatologist',
    clinicAddress: 'Skin & Aesthetics Care, Indiranagar',
    city: 'Bangalore',
    phone: '+91 98345 67890',
    rating: 4.5,
    experienceYears: 8,
    availability: defaultAvailability
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram.orthopedist@medlink.in',
    password: 'password123',
    specialty: 'Orthopedist',
    clinicAddress: 'Bone & Joint Clinic, Gachibowli',
    city: 'Hyderabad',
    phone: '+91 98456 78901',
    rating: 4.7,
    experienceYears: 20,
    availability: defaultAvailability
  },
  {
    name: 'Sneha Joshi',
    email: 'sneha.pediatrician@medlink.in',
    password: 'password123',
    specialty: 'Pediatrician',
    clinicAddress: 'Happy Kids Clinic, Kothrud',
    city: 'Pune',
    phone: '+91 98567 89012',
    rating: 4.6,
    experienceYears: 10,
    availability: defaultAvailability
  },
  {
    name: 'Ananya Sen',
    email: 'ananya.gastroenterologist@medlink.in',
    password: 'password123',
    specialty: 'Gastroenterologist',
    clinicAddress: 'Gastro Digestive Clinic, Salt Lake Sector 3',
    city: 'Kolkata',
    phone: '+91 98678 90123',
    rating: 4.8,
    experienceYears: 14,
    availability: defaultAvailability
  },
  {
    name: 'Karthik Raja',
    email: 'karthik.ophthalmologist@medlink.in',
    password: 'password123',
    specialty: 'Ophthalmologist',
    clinicAddress: 'Eye Vision Center, T. Nagar',
    city: 'Chennai',
    phone: '+91 98789 01234',
    rating: 4.9,
    experienceYears: 11,
    availability: defaultAvailability
  },
  {
    name: 'Meera Deshmukh',
    email: 'meera.psychiatrist@medlink.in',
    password: 'password123',
    specialty: 'Psychiatrist',
    clinicAddress: 'MindSpace Clinic, FC Road',
    city: 'Pune',
    phone: '+91 98890 12345',
    rating: 4.7,
    experienceYears: 9,
    availability: defaultAvailability
  },
  {
    name: 'Sandeep Verma',
    email: 'sandeep.ent@medlink.in',
    password: 'password123',
    specialty: 'Otolaryngologist',
    clinicAddress: 'ENT Health Center, Sector 18',
    city: 'Delhi',
    phone: '+91 98901 23456',
    rating: 4.6,
    experienceYears: 18,
    availability: defaultAvailability
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.physician@medlink.in',
    password: 'password123',
    specialty: 'General Physician',
    clinicAddress: 'Family Wellness Clinic, Koramangala',
    city: 'Bangalore',
    phone: '+91 98012 34567',
    rating: 4.4,
    experienceYears: 7,
    availability: defaultAvailability
  },
  {
    name: 'Neha Kapoor',
    email: 'neha.neurologist@medlink.in',
    password: 'password123',
    specialty: 'Neurologist',
    clinicAddress: 'NeuroCare Clinic, Dwarka Sector 12',
    city: 'Delhi',
    phone: '+91 98120 45678',
    rating: 4.9,
    experienceYears: 13,
    availability: defaultAvailability
  },
  {
    name: 'Sanjay Rao',
    email: 'sanjay.cardiologist@medlink.in',
    password: 'password123',
    specialty: 'Cardiologist',
    clinicAddress: 'Narayana Heart Clinic, Whitefield',
    city: 'Bangalore',
    phone: '+91 98230 56789',
    rating: 4.8,
    experienceYears: 16,
    availability: defaultAvailability
  }
];

const seedDatabase = async () => {
  try {
    console.log(`Connecting to database at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Seeding doctors...');

    // Clear existing doctors to prevent email conflicts on consecutive runs
    await Doctor.deleteMany({ email: { $in: mockDoctors.map(d => d.email) } });
    console.log('Removed duplicate seed doctors if any.');

    // Save doctors (which triggers the pre-save password hash hooks)
    for (const docData of mockDoctors) {
      const doctor = new Doctor(docData);
      await doctor.save();
    }

    console.log(`Seeded ${mockDoctors.length} Indian specialist doctors successfully!`);
    console.log('You can log in as any of these doctors using password: "password123"');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
