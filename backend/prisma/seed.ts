import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding genericMed database...');

  // ─── Pharmacies ───────────────────────────────────────────────────
  const pharmacies = await Promise.all([
    prisma.pharmacy.upsert({
      where: { licenseNumber: 'DL-KA-2024-88412' },
      update: {},
      create: {
        id: 'pharma-1',
        name: 'CarePoint Pharmacy',
        licenseNumber: 'DL-KA-2024-88412',
        address: '42 Healthway Avenue, Metro Central',
        city: 'Bengaluru',
        rating: 4.9,
        reviewCount: 1420,
        slaMinutes: 120,
        isActive: true,
        verified: true,
      },
    }),
    prisma.pharmacy.upsert({
      where: { licenseNumber: 'DL-MH-2023-55109' },
      update: {},
      create: {
        id: 'pharma-2',
        name: 'MedPlus Direct',
        licenseNumber: 'DL-MH-2023-55109',
        address: '108 Wellness Hub, West Park',
        city: 'Mumbai',
        rating: 4.8,
        reviewCount: 3105,
        slaMinutes: 90,
        isActive: true,
        verified: true,
      },
    }),
    prisma.pharmacy.upsert({
      where: { licenseNumber: 'DL-DL-2022-39011' },
      update: {},
      create: {
        id: 'pharma-3',
        name: 'Apollo Health Store',
        licenseNumber: 'DL-DL-2022-39011',
        address: '77 Ring Road, South Extension',
        city: 'New Delhi',
        rating: 4.7,
        reviewCount: 2840,
        slaMinutes: 180,
        isActive: true,
        verified: true,
      },
    }),
    prisma.pharmacy.upsert({
      where: { licenseNumber: 'DL-KA-2025-11029' },
      update: {},
      create: {
        id: 'pharma-4',
        name: 'Wellness Forever 24/7',
        licenseNumber: 'DL-KA-2025-11029',
        address: '15 Indiranagar 100ft Road',
        city: 'Bengaluru',
        rating: 4.6,
        reviewCount: 980,
        slaMinutes: 60,
        isActive: true,
        verified: true,
      },
    }),
    prisma.pharmacy.upsert({
      where: { licenseNumber: 'DL-TG-2024-77410' },
      update: {},
      create: {
        id: 'pharma-5',
        name: 'NetMedics Express Hub',
        licenseNumber: 'DL-TG-2024-77410',
        address: 'Plot 12 HiTech City Corridor',
        city: 'Hyderabad',
        rating: 4.8,
        reviewCount: 1650,
        slaMinutes: 240,
        isActive: true,
        verified: true,
      },
    }),
  ]);

  console.log(`✅ Seeded ${pharmacies.length} pharmacies`);

  // ─── Users ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'yashkaurani@gmail.com' },
      update: {},
      create: {
        id: 'usr-101',
        name: 'Yash Kaurani',
        email: 'yashkaurani@gmail.com',
        passwordHash,
        role: 'patient',
        phone: '+91-98765-43210',
        address: '12 MG Road, Bengaluru - 560001',
      },
    }),
    prisma.user.upsert({
      where: { email: 'pharmacy.ops@carepoint.in' },
      update: {},
      create: {
        id: 'usr-201',
        name: 'CarePoint Admin',
        email: 'pharmacy.ops@carepoint.in',
        passwordHash,
        role: 'pharmacy',
        pharmacyId: 'pharma-1',
        pharmacyName: 'CarePoint Pharmacy',
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@genericmed.in' },
      update: {},
      create: {
        id: 'usr-301',
        name: 'Platform Admin',
        email: 'admin@genericmed.in',
        passwordHash,
        role: 'admin',
      },
    }),
    prisma.user.upsert({
      where: { email: 'dr.anita.sharma@fortis.in' },
      update: {},
      create: {
        id: 'usr-401',
        name: 'Dr. Anita Sharma',
        email: 'dr.anita.sharma@fortis.in',
        passwordHash,
        role: 'doctor',
        licenseNumber: 'MCI-REG-448201',
        clinicHospital: 'Fortis Memorial Heart Institute',
      },
    }),
  ]);

  console.log(`✅ Seeded ${users.length} users (password: Password123!)`);

  // ─── Medicines ────────────────────────────────────────────────────
  const med1 = await prisma.medicine.upsert({
    where: { id: 'med-1' },
    update: {},
    create: {
      id: 'med-1',
      name: 'Atorvastatin (Generic)',
      brandName: 'Lipitor',
      genericName: 'Atorvastatin Calcium',
      activeIngredient: 'Atorvastatin',
      dosageForm: 'Tablet',
      strength: '10 mg',
      therapeuticClass: 'Cardiovascular / Lipid-Lowering Statin',
      isPrescriptionRequired: true,
      manufacturer: 'Sun Pharma / Cipla Generics',
      description:
        'HMG-CoA reductase inhibitor indicated as an adjunct to diet to reduce elevated total cholesterol, LDL-C, and triglycerides.',
      commonUses: ['High Cholesterol', 'Coronary Artery Disease Prevention', 'Stroke Risk Reduction'],
      packs: {
        create: [
          {
            id: 'med-1-pack-10',
            packQuantity: 10,
            packUnit: 'Tablets',
            packLabel: 'Pack of 10 Tablets',
            canonicalBarcode: '890123456001',
          },
          {
            id: 'med-1-pack-30',
            packQuantity: 30,
            packUnit: 'Tablets',
            packLabel: 'Pack of 30 Tablets (Monthly Supply)',
            canonicalBarcode: '890123456002',
          },
        ],
      },
    },
  });

  const med2 = await prisma.medicine.upsert({
    where: { id: 'med-2' },
    update: {},
    create: {
      id: 'med-2',
      name: 'Metformin Hydrochloride (Generic)',
      brandName: 'Glucophage',
      genericName: 'Metformin HCl',
      activeIngredient: 'Metformin',
      dosageForm: 'Tablet',
      strength: '500 mg',
      therapeuticClass: 'Antidiabetic / Biguanide',
      isPrescriptionRequired: true,
      manufacturer: 'Torrent / Abbott Healthcare',
      description:
        'First-line medication for the treatment of type 2 diabetes mellitus, particularly in people who are overweight.',
      commonUses: ['Type 2 Diabetes', 'Gestational Diabetes', 'PCOS Management'],
      packs: {
        create: [
          {
            id: 'med-2-pack-10',
            packQuantity: 10,
            packUnit: 'Tablets',
            packLabel: 'Strip of 10 Tablets',
            canonicalBarcode: '890123456011',
          },
          {
            id: 'med-2-pack-30',
            packQuantity: 30,
            packUnit: 'Tablets',
            packLabel: 'Pack of 30 Tablets',
            canonicalBarcode: '890123456012',
          },
          {
            id: 'med-2-pack-60',
            packQuantity: 60,
            packUnit: 'Tablets',
            packLabel: 'Value Pack of 60 Tablets',
            canonicalBarcode: '890123456013',
          },
        ],
      },
    },
  });

  const med3 = await prisma.medicine.upsert({
    where: { id: 'med-3' },
    update: {},
    create: {
      id: 'med-3',
      name: 'Amoxicillin Trihydrate (Generic)',
      brandName: 'Amoxil / Augmentin Component',
      genericName: 'Amoxicillin',
      activeIngredient: 'Amoxicillin',
      dosageForm: 'Capsule',
      strength: '500 mg',
      therapeuticClass: 'Antibacterial / Penicillin',
      isPrescriptionRequired: true,
      manufacturer: 'Alkem Laboratories',
      description:
        'Broad-spectrum aminopenicillin antibiotic used to treat bacterial infections.',
      commonUses: ['Streptococcal Pharyngitis', 'Pneumonia', 'Skin & Soft Tissue Infections'],
      packs: {
        create: [
          {
            id: 'med-3-pack-10',
            packQuantity: 10,
            packUnit: 'Capsules',
            packLabel: 'Blister Pack of 10 Capsules',
            canonicalBarcode: '890123456021',
          },
          {
            id: 'med-3-pack-20',
            packQuantity: 20,
            packUnit: 'Capsules',
            packLabel: 'Pack of 20 Capsules',
            canonicalBarcode: '890123456022',
          },
        ],
      },
    },
  });

  const med4 = await prisma.medicine.upsert({
    where: { id: 'med-4' },
    update: {},
    create: {
      id: 'med-4',
      name: 'Paracetamol / Acetaminophen',
      brandName: 'Dolo 650 / Calpol',
      genericName: 'Paracetamol',
      activeIngredient: 'Acetaminophen',
      dosageForm: 'Tablet',
      strength: '650 mg',
      therapeuticClass: 'Analgesic & Antipyretic',
      isPrescriptionRequired: false,
      manufacturer: 'Micro Labs / GSK Consumer',
      description: 'Common analgesic and antipyretic medication used to treat mild-to-moderate pain and fever.',
      commonUses: ['Fever', 'Headache', 'Muscle Aches', 'Post-vaccination discomfort'],
      packs: {
        create: [
          {
            id: 'med-4-pack-15',
            packQuantity: 15,
            packUnit: 'Tablets',
            packLabel: 'Strip of 15 Tablets',
            canonicalBarcode: '890123456031',
          },
          {
            id: 'med-4-pack-30',
            packQuantity: 30,
            packUnit: 'Tablets',
            packLabel: 'Pack of 30 Tablets',
            canonicalBarcode: '890123456032',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded 4 medicines with packs`);
  void med1; void med2; void med3; void med4;

  // ─── Seller Offers ────────────────────────────────────────────────
  const offersData = [
    // Atorvastatin 10mg — Pack of 10
    { id: 'off-1', pharmacyId: 'pharma-1', medicineId: 'med-1', packId: 'med-1-pack-10', price: 58.0, mrp: 75.0, inStock: true, stockQuantity: 240, deliveryEstimate: 'Today by 6 PM', deliveryFee: 20, freshnessMinutesAgo: 12, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    { id: 'off-2', pharmacyId: 'pharma-2', medicineId: 'med-1', packId: 'med-1-pack-10', price: 61.5, mrp: 75.0, inStock: true, stockQuantity: 80, deliveryEstimate: 'Within 2 hrs', deliveryFee: 0, freshnessMinutesAgo: 5, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    { id: 'off-3', pharmacyId: 'pharma-3', medicineId: 'med-1', packId: 'med-1-pack-10', price: 55.9, mrp: 75.0, inStock: true, stockQuantity: 50, deliveryEstimate: 'Tomorrow', deliveryFee: 35, freshnessMinutesAgo: 45, freshnessStatus: 'warning' as const, verifiedBadge: false },
    // Atorvastatin 10mg — Pack of 30
    { id: 'off-4', pharmacyId: 'pharma-1', medicineId: 'med-1', packId: 'med-1-pack-30', price: 162.0, mrp: 210.0, inStock: true, stockQuantity: 120, deliveryEstimate: 'Today by 6 PM', deliveryFee: 20, freshnessMinutesAgo: 12, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    { id: 'off-5', pharmacyId: 'pharma-4', medicineId: 'med-1', packId: 'med-1-pack-30', price: 155.0, mrp: 210.0, inStock: true, stockQuantity: 30, deliveryEstimate: 'Within 1 hr', deliveryFee: 25, freshnessMinutesAgo: 8, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    // Metformin 500mg — Pack of 10
    { id: 'off-6', pharmacyId: 'pharma-1', medicineId: 'med-2', packId: 'med-2-pack-10', price: 22.5, mrp: 30.0, inStock: true, stockQuantity: 500, deliveryEstimate: 'Today by 6 PM', deliveryFee: 20, freshnessMinutesAgo: 15, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    { id: 'off-7', pharmacyId: 'pharma-5', medicineId: 'med-2', packId: 'med-2-pack-10', price: 20.0, mrp: 30.0, inStock: true, stockQuantity: 200, deliveryEstimate: 'Tomorrow', deliveryFee: 0, freshnessMinutesAgo: 130, freshnessStatus: 'stale' as const, verifiedBadge: false },
    // Amoxicillin 500mg — Pack of 10
    { id: 'off-8', pharmacyId: 'pharma-2', medicineId: 'med-3', packId: 'med-3-pack-10', price: 85.0, mrp: 110.0, inStock: true, stockQuantity: 60, deliveryEstimate: 'Within 2 hrs', deliveryFee: 0, freshnessMinutesAgo: 20, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    { id: 'off-9', pharmacyId: 'pharma-3', medicineId: 'med-3', packId: 'med-3-pack-10', price: 80.0, mrp: 110.0, inStock: false, stockQuantity: 0, deliveryEstimate: 'Out of Stock', deliveryFee: 0, freshnessMinutesAgo: 90, freshnessStatus: 'warning' as const, verifiedBadge: true },
    // Paracetamol 650mg — Pack of 15
    { id: 'off-10', pharmacyId: 'pharma-1', medicineId: 'med-4', packId: 'med-4-pack-15', price: 28.5, mrp: 35.0, inStock: true, stockQuantity: 1000, deliveryEstimate: 'Today by 6 PM', deliveryFee: 20, freshnessMinutesAgo: 5, freshnessStatus: 'fresh' as const, verifiedBadge: true },
    { id: 'off-11', pharmacyId: 'pharma-4', medicineId: 'med-4', packId: 'med-4-pack-15', price: 26.0, mrp: 35.0, inStock: true, stockQuantity: 400, deliveryEstimate: 'Within 1 hr', deliveryFee: 15, freshnessMinutesAgo: 3, freshnessStatus: 'fresh' as const, verifiedBadge: true },
  ];

  for (const offer of offersData) {
    await prisma.sellerOffer.upsert({
      where: { pharmacyId_medicineId_packId: { pharmacyId: offer.pharmacyId, medicineId: offer.medicineId, packId: offer.packId } },
      update: {},
      create: offer,
    });
  }

  console.log(`✅ Seeded ${offersData.length} seller offers`);

  // ─── Prescriptions ────────────────────────────────────────────────
  await prisma.prescription.upsert({
    where: { id: 'rx-001' },
    update: {},
    create: {
      id: 'rx-001',
      patientId: 'usr-101',
      doctorName: 'Dr. Anita Sharma, MD, DM (Cardiology)',
      doctorLicense: 'MCI-REG-448201',
      clinicHospital: 'Fortis Memorial Heart Institute',
      prescribedDate: '2026-08-15',
      validUntil: '2026-11-15',
      fileName: 'rx_cardiology_aug2026.jpg',
      fileSize: '1.2 MB',
      fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      status: 'Accepted',
      reviewedBy: 'CarePoint Admin',
      prescribedMedicines: ['Atorvastatin 10mg Tablets', 'Metformin 500mg'],
      diagnosisNote: 'Hypercholesterolemia with impaired fasting glucose (Metabolic Syndrome).',
      matchedMedicineIds: ['med-1', 'med-2'],
    },
  });

  console.log(`✅ Seeded sample prescription`);

  // ─── Sample Order ─────────────────────────────────────────────────
  const existingOrder = await prisma.order.findUnique({ where: { orderNumber: 'GM-2026-7841' } });
  if (!existingOrder) {
    await prisma.order.create({
      data: {
        id: 'ord-sample-1',
        orderNumber: 'GM-2026-7841',
        patientId: 'usr-101',
        deliveryAddress: '12 MG Road, Bengaluru - 560001',
        deliveryPhone: '+91-98765-43210',
        pharmacyId: 'pharma-1',
        subtotal: 220.5,
        deliveryFee: 20,
        tax: 11.03,
        total: 251.53,
        prescriptionId: 'rx-001',
        paymentMethod: 'UPIInstantPay',
        paymentStatus: 'Success',
        paymentReference: 'PAY-REF-UPI9284HJ',
        orderStatus: 'Shipped',
        trackingNumber: 'TRK-PHAR-829401',
        items: {
          create: [
            {
              medicineId: 'med-1',
              medicineName: 'Atorvastatin (Generic)',
              genericName: 'Atorvastatin Calcium',
              packId: 'med-1-pack-30',
              quantity: 1,
              unitPrice: 162.0,
              totalPrice: 162.0,
              isPrescriptionRequired: true,
            },
            {
              medicineId: 'med-2',
              medicineName: 'Metformin Hydrochloride (Generic)',
              genericName: 'Metformin HCl',
              packId: 'med-2-pack-10',
              quantity: 1,
              unitPrice: 22.5,
              totalPrice: 22.5,
              isPrescriptionRequired: true,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: 'Created', actor: 'Yash Kaurani (Patient)', note: 'Order submitted' },
            { status: 'Paid', actor: 'Payment Gateway (UPI)', note: 'Payment confirmed' },
            { status: 'Accepted', actor: 'CarePoint Pharmacy', note: 'Order accepted for fulfillment' },
            { status: 'Packed', actor: 'CarePoint Pharmacy', note: 'All items packed' },
            { status: 'Shipped', actor: 'Delivery Partner', note: 'Out for delivery' },
          ],
        },
      },
    });
    console.log(`✅ Seeded sample order GM-2026-7841`);
  }

  console.log('\n🎉 Database seeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('Demo credentials (all passwords: Password123!):');
  console.log('  Patient:  yashkaurani@gmail.com');
  console.log('  Pharmacy: pharmacy.ops@carepoint.in');
  console.log('  Admin:    admin@genericmed.in');
  console.log('  Doctor:   dr.anita.sharma@fortis.in');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
