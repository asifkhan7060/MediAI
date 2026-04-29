const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/User');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');

    // await Patient.deleteMany({});
    // await Doctor.deleteMany({});
    // await Admin.deleteMany({});
    // await Appointment.deleteMany({});
    // await Review.deleteMany({});
    // await Payment.deleteMany({});

    console.log('✅ Old data cleared.\n');


    // ─── CREATE DOCTORS ───
    console.log('🩺 Creating doctors...\n');

    const doctorData = [
      {
        name: 'Dr. Rajesh Sharma',
        email: 'rajesh.sharma@mediai.com',
        password: 'Doctor@123',
        phone: '9100000001',
        gender: 'male',
        specialization: 'Cardiologist',
        experience: 15,
        fee: 1500,
        bio: 'Senior cardiologist with 15 years of experience in interventional cardiology.',
        qualification: 'MD, DM Cardiology - AIIMS Delhi',
        clinicAddress: 'Heart Care Center, Connaught Place, New Delhi',
        rating: 4.8,
      },
      {
        name: 'Dr. Amit Verma',
        email: 'amit.verma@mediai.com',
        password: 'doctor123',
        phone: '9100000002',
        gender: 'male',
        specialization: 'Cardiologist',
        experience: 10,
        fee: 1200,
        bio: 'Specialist in cardiac surgery and advanced diagnostic imaging.',
        qualification: 'MD Cardiology - KEM Hospital, Mumbai',
        clinicAddress: 'Verma Heart Clinic, Bandra, Mumbai',
        rating: 4.5,
      },
      {
        name: 'Dr. Priya Patel',
        email: 'priya.patel@mediai.com',
        password: 'doctor123',
        phone: '9100000003',
        gender: 'female',
        specialization: 'Dermatologist',
        experience: 8,
        fee: 800,
        bio: 'Expert in cosmetic dermatology and skin care treatments.',
        qualification: 'MD Dermatology - JIPMER, Puducherry',
        clinicAddress: 'GlowSkin Clinic, MG Road, Bangalore',
        rating: 4.6,
      },
      {
        name: 'Dr. Sneha Reddy',
        email: 'sneha.reddy@mediai.com',
        password: 'doctor123',
        phone: '9100000004',
        gender: 'female',
        specialization: 'Dermatologist',
        experience: 12,
        fee: 1000,
        bio: 'Specializes in psoriasis, eczema, and laser treatments.',
        qualification: 'MD, DVD - Osmania Medical College, Hyderabad',
        clinicAddress: 'Reddy Skin Care, Jubilee Hills, Hyderabad',
        rating: 4.7,
      },
      {
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@mediai.com',
        password: 'doctor123',
        phone: '9100000005',
        gender: 'male',
        specialization: 'Neurologist',
        experience: 20,
        fee: 2000,
        bio: 'Leading neurologist with expertise in stroke management and epilepsy.',
        qualification: 'MD, DM Neurology - PGI Chandigarh',
        clinicAddress: 'NeuroLife Center, Sector 17, Chandigarh',
        rating: 4.9,
      },
      {
        name: 'Dr. Anjali Deshmukh',
        email: 'anjali.deshmukh@mediai.com',
        password: 'doctor123',
        phone: '9100000006',
        gender: 'female',
        specialization: 'Neurologist',
        experience: 7,
        fee: 900,
        bio: 'Specializes in headache disorders and neuromuscular diseases.',
        qualification: 'MD Neurology - Grant Medical College, Mumbai',
        clinicAddress: "Neuro Wellness, Shivaji Nagar, Pune",
        rating: 4.3,
      },
      {
        name: 'Dr. Suresh Kumar',
        email: 'suresh.kumar@mediai.com',
        password: 'doctor123',
        phone: '9100000007',
        gender: 'male',
        specialization: 'Orthopedic',
        experience: 18,
        fee: 1400,
        bio: 'Expert in joint replacement surgery and sports medicine.',
        qualification: 'MS Orthopedics - CMC Vellore',
        clinicAddress: 'OrthoPlus Clinic, T Nagar, Chennai',
        rating: 4.7,
      },
      {
        name: 'Dr. Kavita Joshi',
        email: 'kavita.joshi@mediai.com',
        password: 'doctor123',
        phone: '9100000008',
        gender: 'female',
        specialization: 'Orthopedic',
        experience: 9,
        fee: 1100,
        bio: 'Pediatric orthopedic surgeon with expertise in spinal deformities.',
        qualification: 'MS Ortho, Fellowship Spine Surgery - SGPGI, Lucknow',
        clinicAddress: 'BoneCare Hospital, Gomti Nagar, Lucknow',
        rating: 4.4,
      },
      {
        name: 'Dr. Arjun Nair',
        email: 'arjun.nair@mediai.com',
        password: 'doctor123',
        phone: '9100000009',
        gender: 'male',
        specialization: 'General Physician',
        experience: 14,
        fee: 600,
        bio: 'Experienced general physician specializing in preventive healthcare.',
        qualification: 'MD Internal Medicine - Medical College, Trivandrum',
        clinicAddress: 'MedFirst Clinic, Kochi, Kerala',
        rating: 4.5,
      },
      {
        name: 'Dr. Meera Gupta',
        email: 'meera.gupta@mediai.com',
        password: 'doctor123',
        phone: '9100000010',
        gender: 'female',
        specialization: 'General Physician',
        experience: 6,
        fee: 500,
        bio: 'Family medicine practitioner with a focus on lifestyle diseases.',
        qualification: 'MBBS, MD - Lady Hardinge Medical College, Delhi',
        clinicAddress: 'Family Care Clinic, Vaishali, Ghaziabad',
        rating: 4.2,
      },
      {
        name: 'Dr. Rahul Kapoor',
        email: 'rahul.kapoor@mediai.com',
        password: 'doctor123',
        phone: '9100000011',
        gender: 'male',
        specialization: 'Gastroenterologist',
        experience: 11,
        fee: 1300,
        bio: 'Expert in endoscopic procedures and liver diseases.',
        qualification: 'MD, DM Gastroenterology - AIIMS Delhi',
        clinicAddress: 'GastroHealth Center, Lajpat Nagar, Delhi',
        rating: 4.6,
      },
      {
        name: 'Dr. Pooja Banerjee',
        email: 'pooja.banerjee@mediai.com',
        password: 'doctor123',
        phone: '9100000012',
        gender: 'female',
        specialization: 'Gastroenterologist',
        experience: 8,
        fee: 1000,
        bio: 'Specializes in inflammatory bowel disease and pancreatic disorders.',
        qualification: 'MD, DM Gastro - IPGMER, Kolkata',
        clinicAddress: 'Digestive Care Clinic, Salt Lake, Kolkata',
        rating: 4.4,
      },
      {
        name: 'Dr. Mohan Das',
        email: 'mohan.das@mediai.com',
        password: 'doctor123',
        phone: '9100000013',
        gender: 'male',
        specialization: 'Pulmonologist',
        experience: 13,
        fee: 1100,
        bio: 'Respiratory medicine expert specializing in asthma and COPD.',
        qualification: 'MD Pulmonology - KGMU, Lucknow',
        clinicAddress: 'BreathEasy Clinic, Hazratganj, Lucknow',
        rating: 4.5,
      },
      {
        name: 'Dr. Deepa Iyer',
        email: 'deepa.iyer@mediai.com',
        password: 'doctor123',
        phone: '9100000014',
        gender: 'female',
        specialization: 'Endocrinologist',
        experience: 10,
        fee: 1200,
        bio: 'Diabetes and thyroid specialist with a holistic approach to treatment.',
        qualification: 'MD, DM Endocrinology - CMC Vellore',
        clinicAddress: 'EndoCare Clinic, Mylapore, Chennai',
        rating: 4.6,
      },
      {
        name: 'Dr. Sanjay Mishra',
        email: 'sanjay.mishra@mediai.com',
        password: 'doctor123',
        phone: '9100000015',
        gender: 'male',
        specialization: 'ENT Specialist',
        experience: 16,
        fee: 900,
        bio: 'Expert in cochlear implants and sinus surgery.',
        qualification: 'MS ENT - Maulana Azad Medical College, Delhi',
        clinicAddress: 'ENT Excellence Center, Civil Lines, Jaipur',
        rating: 4.7,
      },
      {
        name: 'Dr. Lakshmi Rao',
        email: 'lakshmi.rao@mediai.com',
        password: 'doctor123',
        phone: '9100000016',
        gender: 'female',
        specialization: 'Gynecologist',
        experience: 14,
        fee: 1000,
        bio: 'Obstetrician-gynecologist specializing in high-risk pregnancies.',
        qualification: 'MD OBG - Kasturba Medical College, Manipal',
        clinicAddress: 'WomanCare Center, Koramangala, Bangalore',
        rating: 4.8,
      },
      {
        name: 'Dr. Ashwin Menon',
        email: 'ashwin.menon@mediai.com',
        password: 'doctor123',
        phone: '9100000017',
        gender: 'male',
        specialization: 'Psychiatrist',
        experience: 9,
        fee: 1500,
        bio: 'Expert in anxiety, depression, and behavioral therapy.',
        qualification: 'MD Psychiatry - NIMHANS, Bangalore',
        clinicAddress: 'MindWell Center, Indiranagar, Bangalore',
        rating: 4.4,
      },
      {
        name: 'Dr. Neha Agarwal',
        email: 'neha.agarwal@mediai.com',
        password: 'doctor123',
        phone: '9100000018',
        gender: 'female',
        specialization: 'Ophthalmologist',
        experience: 11,
        fee: 800,
        bio: 'Eye surgeon specializing in LASIK, cataract, and retinal diseases.',
        qualification: 'MS Ophthalmology - RP Center, AIIMS, Delhi',
        clinicAddress: 'ClearVision Eye Hospital, Aliganj, Lucknow',
        rating: 4.6,
      },
      {
        name: 'Dr. Ravi Shankar',
        email: 'ravi.shankar@mediai.com',
        password: 'doctor123',
        phone: '9100000019',
        gender: 'male',
        specialization: 'Pediatrician',
        experience: 17,
        fee: 700,
        bio: 'Renowned pediatrician with expertise in childhood infections and neonatal care.',
        qualification: 'MD Pediatrics - BJ Medical College, Ahmedabad',
        clinicAddress: 'KidsCare Clinic, CG Road, Ahmedabad',
        rating: 4.8,
      },
      {
        name: 'Dr. Tanvi Shah',
        email: 'tanvi.shah@mediai.com',
        password: 'doctor123',
        phone: '9100000020',
        gender: 'female',
        specialization: 'Dentist',
        experience: 5,
        fee: 500,
        bio: 'Cosmetic and general dentist focused on painless procedures.',
        qualification: 'BDS, MDS Prosthodontics - GDC, Mumbai',
        clinicAddress: 'SmilePerfect Dental, Andheri West, Mumbai',
        rating: 4.3,
      },
    ];

    const defaultSchedule = [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
      { day: 'Sunday', startTime: '00:00', endTime: '00:00', isAvailable: false },
    ];

    for (const doc of doctorData) {
      // Generate random lat/lng near Mumbai (19.039, 72.853) within ~20km radius
      const randomLat = 19.039 + (Math.random() - 0.5) * 0.4;
      const randomLng = 72.853 + (Math.random() - 0.5) * 0.4;

      const doctor = await Doctor.create({
        ...doc,
        available: true,
        isApproved: 'approved', // Pre-approved for testing
        schedule: defaultSchedule,
        location: {
          lat: randomLat,
          lng: randomLng
        }
      });
      console.log(`   ✅ ${doctor.name} (${doctor.specialization}) — ₹${doctor.fee}`);
    }

    // ─── CREATE PATIENTS ───
    console.log('\n👥 Creating sample patients...\n');

    const patientData = [
      { name: 'Rahul Kumar', email: 'rahul@example.com', password: 'Patient@123', phone: '9200000001', gender: 'male' },
      { name: 'Anita Singh', email: 'anita@example.com', password: 'Patient@123', phone: '9200000002', gender: 'female' },
      { name: 'Vikash Yadav', email: 'vikash@example.com', password: 'Patient@123', phone: '9200000003', gender: 'male' },
      { name: 'Priyanka Jha', email: 'priyanka@example.com', password: 'Patient@123', phone: '9200000004', gender: 'female' },
      { name: 'Siddharth Roy', email: 'siddharth@example.com', password: 'Patient@123', phone: '9200000005', gender: 'male' },
    ];

    for (const pat of patientData) {
      const patient = await Patient.create(pat);
      console.log(`   ✅ ${patient.name} (${patient.email})`);
    }

    console.log('\n══════════════════════════════════════════');
    console.log('  🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('══════════════════════════════════════════');
    // console.log('\n📋 Summary:');
    // console.log(`   Admins:   1  (admin@mediai.com / Admin@123)`);
    console.log(`   Doctors:  ${doctorData.length} (all pre-approved)`);
    // console.log(`   Patients: ${patientData.length}`);
    // console.log('\n🔑 Demo Credentials:');
    // console.log('   Patient: rahul@example.com / Patient@123');
    // console.log('   Doctor:  rajesh.sharma@mediai.com / Doctor@123');
    // console.log('   Admin:   admin@mediai.com / Admin@123');
    // console.log('\n📊 Collections:');
    // console.log('   patients → Patient collection');
    // console.log('   doctors  → Doctor collection');
    // console.log('   admins   → Admin collection\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
