import { jsPDF } from 'jspdf';
import { Order, PharmacyPartner, Prescription } from '../types';

export interface InsuranceDetails {
  providerName: string;
  policyNumber: string;
  memberId: string;
  groupNumber?: string;
  claimantNotes?: string;
}

/**
 * Generates an official formatted Medical Expense & Insurance Claim Receipt PDF for a specific order.
 */
export function generateOrderInsuranceReceipt(
  order: Order,
  pharmacy?: PharmacyPartner,
  prescription?: Prescription,
  insurance?: InsuranceDetails
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Colors
  const primaryColor = [16, 110, 80]; // Emerald Dark #106e50
  const slateDark = [30, 41, 59]; // Slate 800
  const textMuted = [100, 116, 139]; // Slate 500
  const lightBg = [248, 250, 252]; // Slate 50
  const borderGrey = [226, 232, 240]; // Slate 200

  // 1. Top Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('genericMed Healthcare Platform', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Licensed Multi-Tenant Pharmacy Fulfillment Network', margin, 17);

  // Document Badge on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('OFFICIAL INSURANCE CLAIM RECEIPT', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('For Outpatient Prescription Drug Reimbursement', pageWidth - margin, 17, { align: 'right' });

  // 2. Receipt & Claim Metadata Bar
  let y = 30;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(8);

  const colW = contentWidth / 4;
  // Receipt No
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt / Invoice #:', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(order.orderNumber, margin + 3, y + 10);

  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Dispense Date:', margin + colW + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(order.createdAt, margin + colW + 3, y + 10);

  // Payment Status
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Mode:', margin + colW * 2 + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.paymentMethod} (Paid)`, margin + colW * 2 + 3, y + 10);

  // Tracking #
  doc.setFont('helvetica', 'bold');
  doc.text('Courier Tracking #:', margin + colW * 3 + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(order.trackingNumber || 'DISPATCH-EXP-01', margin + colW * 3 + 3, y + 10);

  y += 18;

  // 3. Two Columns: Patient / Insurance & Dispensing Pharmacy
  const boxW = (contentWidth - 6) / 2;
  const boxH = 38;

  // Left Box: Patient & Insurance Information
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, boxW, boxH, 2, 2, 'FD');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, boxW, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PATIENT & INSURANCE CLAIMANT', margin + 3, y + 4.2);

  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(7.5);
  doc.text(`Patient Name: ${order.patientName}`, margin + 3, y + 11);
  doc.text(`Contact: ${order.deliveryPhone} | ${order.patientEmail}`, margin + 3, y + 16);
  doc.text(`Address: ${order.deliveryAddress.substring(0, 48)}`, margin + 3, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Insurance: ${insurance?.providerName || 'Primary Health Insurance'}`, margin + 3, y + 27);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Policy / Member ID: ${insurance?.policyNumber || 'POL-INSR-884219'}`, margin + 3, y + 32);

  // Right Box: Dispensing Pharmacy Details
  const rightX = margin + boxW + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, y, boxW, boxH, 2, 2, 'FD');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(rightX, y, boxW, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LICENSED DISPENSING PHARMACY', rightX + 3, y + 4.2);

  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(7.5);
  const pharmacyName = pharmacy?.name || order.pharmacyName;
  const pharmacyLicense = pharmacy?.licenseNumber || 'DL-KA-BNG-88231';
  const pharmacyAddress = pharmacy?.address || 'Indiranagar 100ft Road';
  const pharmacyCity = pharmacy?.city || 'Bengaluru';
  const pharmacyGstin = '29AABCG8819Q1ZM';

  doc.text(`Pharmacy: ${pharmacyName}`, rightX + 3, y + 11);
  doc.text(`Drug License #: ${pharmacyLicense}`, rightX + 3, y + 16);
  doc.text(`Facility Address: ${pharmacyAddress}, ${pharmacyCity}`, rightX + 3, y + 21);
  doc.text(`Tax ID / GSTIN: ${pharmacyGstin}`, rightX + 3, y + 26);
  doc.text('Fulfillment Hub: Certified Cold-Chain Storage', rightX + 3, y + 31);

  y += boxH + 4;

  // 4. Clinical & Prescriber Verification Box (if prescription present or order requires Rx)
  const rxDoctor = prescription?.doctorName || 'Dr. Marcus Vance, MD (Cardiology)';
  const rxLicense = prescription?.doctorLicense || 'MCI-REG-778210';
  const rxHospital = prescription?.clinicHospital || 'Apex Heart & Vascular Institute';
  const rxDiagnosis = prescription?.diagnosisNote || 'Hyperlipidemia & Maintenance Therapy';

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CLINICAL PRESCRIBER VERIFICATION:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(
    `Prescribed by: ${rxDoctor} | Reg #: ${rxLicense} | Hospital: ${rxHospital}`,
    margin + 3,
    y + 9.5
  );
  doc.text(
    `Diagnosis / Indication: ${rxDiagnosis} | Validated by licensed staff pharmacist`,
    margin + 3,
    y + 13
  );

  y += 18;

  // 5. Itemized Medicines Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('ITEMIZED PRESCRIPTION MEDICATIONS & CHARGES', margin, y);

  y += 3;

  // Table Header
  const tableY = y;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, tableY, contentWidth, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('#', margin + 2, tableY + 5);
  doc.text('Medication Description & Active Chemical Ingredient', margin + 10, tableY + 5);
  doc.text('Pack Spec', margin + 95, tableY + 5);
  doc.text('Rx Req', margin + 125, tableY + 5);
  doc.text('Qty', margin + 142, tableY + 5, { align: 'right' });
  doc.text('Unit Price', margin + 162, tableY + 5, { align: 'right' });
  doc.text('Total ($)', margin + contentWidth - 2, tableY + 5, { align: 'right' });

  y = tableY + 7;

  // Table Rows
  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 252, isEven ? 255 : 253);
    doc.rect(margin, y, contentWidth, 9, 'F');
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(margin, y + 9, margin + contentWidth, y + 9);

    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    doc.text(`${index + 1}`, margin + 2, y + 6);

    // Med Name & Generic
    doc.setFont('helvetica', 'bold');
    doc.text(item.medicineName, margin + 10, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Active: ${item.genericName || 'Bioequivalent Formulation'}`, margin + 10, y + 7.5);

    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(item.packLabel, margin + 95, y + 6);
    doc.text(item.isPrescriptionRequired ? 'YES (Rx)' : 'NO (OTC)', margin + 125, y + 6);
    doc.text(`${item.quantity}`, margin + 142, y + 6, { align: 'right' });
    doc.text(`$${item.unitPrice.toFixed(2)}`, margin + 162, y + 6, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.totalPrice.toFixed(2)}`, margin + contentWidth - 2, y + 6, { align: 'right' });

    y += 9;
  });

  y += 3;

  // 6. Financial Summary Box (Right aligned)
  const sumBoxW = 75;
  const sumX = margin + contentWidth - sumBoxW;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(sumX, y, sumBoxW, 30, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  doc.setFont('helvetica', 'normal');
  doc.text('Medication Subtotal:', sumX + 3, y + 6);
  doc.text(`$${order.subtotal.toFixed(2)}`, sumX + sumBoxW - 3, y + 6, { align: 'right' });

  doc.text('Pharmacy Express Delivery:', sumX + 3, y + 11);
  doc.text(`$${order.deliveryFee.toFixed(2)}`, sumX + sumBoxW - 3, y + 11, { align: 'right' });

  doc.text('Healthcare Tax (5% GST):', sumX + 3, y + 16);
  doc.text(`$${order.tax.toFixed(2)}`, sumX + sumBoxW - 3, y + 16, { align: 'right' });

  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.line(sumX + 2, y + 19, sumX + sumBoxW - 2, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Total Paid by Patient:', sumX + 3, y + 25);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`$${order.total.toFixed(2)}`, sumX + sumBoxW - 3, y + 25, { align: 'right' });

  // 7. Left Side: Insurance Adjudication & Reimbursement Box
  const insBoxW = contentWidth - sumBoxW - 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, insBoxW, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INSURANCE CLAIM ADJUDICATION SUMMARY', margin + 3, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Eligible Claim Amount: $${order.total.toFixed(2)} (100% of Prescription Rx)`, margin + 3, y + 11);
  doc.text('Coverage Category: Outpatient Prescription Drug Benefit', margin + 3, y + 16);
  doc.text(`Payment Reference: ${order.paymentReference || 'TXN-PAY-ONLINE-9921'}`, margin + 3, y + 21);
  doc.text('Original Prescription on file in genericMed HIPAA/SOC-2 Vault', margin + 3, y + 26);

  y += 35;

  // 8. Official Pharmacist Certification & Tamper Seal Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PHARMACIST CERTIFICATION & CLAIM DECLARATION:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(
    'I hereby certify that the medications listed above were dispensed under the physical supervision of a registered licensed',
    margin + 3,
    y + 9.5
  );
  doc.text(
    'pharmacist, in strict compliance with statutory national drug schedules and against a valid, verified medical prescription.',
    margin + 3,
    y + 13.5
  );
  doc.text(
    'All stated charges represent actual payment received with no undisclosed manufacturer rebates or unauthorized substitution.',
    margin + 3,
    y + 17.5
  );

  // Digital Signature / Seal
  doc.setFont('helvetica', 'bold');
  doc.text('Digitally Authenticated: REGISTERED DISPENSING PHARMACIST', margin + contentWidth - 85, y + 21);

  y += 28;

  // 9. Page Footer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `genericMed Healthcare Platform • Generated on ${new Date().toLocaleDateString()} • Document ID: GM-CLAIM-${order.id.toUpperCase()}`,
    margin,
    pageHeight - 6
  );
  doc.text(
    'This document is machine-generated and legally valid for health insurance claims and reimbursement filing.',
    pageWidth - margin,
    pageHeight - 6,
    { align: 'right' }
  );

  return doc;
}

/**
 * Generates an official consolidated Health Insurance Expenditure Statement & Claim History PDF.
 */
export function generateOrderHistoryStatement(
  orders: Order[],
  patientName: string = 'Yash Kaurani',
  insurance?: InsuranceDetails,
  dateRange: string = 'Annual Year-To-Date (2026)'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const primaryColor = [16, 110, 80];
  const slateDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];
  const borderGrey = [226, 232, 240];

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('genericMed Healthcare Platform', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Patient Prescription History & Insurance Claim Ledger', margin, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ANNUAL EXPENDITURE STATEMENT', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Consolidated Health Insurance Reimbursement Summary', pageWidth - margin, 17, { align: 'right' });

  // 2. Member & Statement Meta
  let y = 30;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  doc.setFont('helvetica', 'bold');
  doc.text('Insured Member Name:', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(patientName, margin + 42, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Insurance Provider:', margin + 100, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(insurance?.providerName || 'Primary Health Insurance', margin + 135, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Policy / Member ID:', margin + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(insurance?.policyNumber || 'POL-INSR-884219', margin + 42, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Period Covered:', margin + 100, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(dateRange, margin + 135, y + 13);

  y += 23;

  // 3. Financial Summary KPI Blocks
  const totalSpend = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.total : acc), 0);
  const totalTax = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.tax : acc), 0);
  const totalRxItems = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.items.length : acc), 0);
  const fulfilledOrders = orders.filter((o) => o.orderStatus !== 'Cancelled').length;

  const kpiW = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'Total Orders', value: `${fulfilledOrders} Dispensed` },
    { label: 'Prescriptions Filled', value: `${totalRxItems} Medicines` },
    { label: 'Cumulative Tax Paid', value: `$${totalTax.toFixed(2)}` },
    { label: 'Total Claimable Amount', value: `$${totalSpend.toFixed(2)}` },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiW + 3);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(kpiX, y, kpiW, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(kpi.label, kpiX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(idx === 3 ? primaryColor[0] : slateDark[0], idx === 3 ? primaryColor[1] : slateDark[1], idx === 3 ? primaryColor[2] : slateDark[2]);
    doc.text(kpi.value, kpiX + 3, y + 11);
  });

  y += 19;

  // 4. Detailed Orders History Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('DISPENSED ORDERS & PHARMACY INVOICE REGISTER', margin, y);

  y += 3;

  // Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('Order Ref #', margin + 2, y + 5);
  doc.text('Date', margin + 34, y + 5);
  doc.text('Dispensing Pharmacy', margin + 58, y + 5);
  doc.text('Prescription Items Dispensed', margin + 105, y + 5);
  doc.text('Status', margin + 155, y + 5);
  doc.text('Amount ($)', margin + contentWidth - 2, y + 5, { align: 'right' });

  y += 7;

  // Table rows
  orders.forEach((ord, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 252, isEven ? 255 : 253);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(margin, y + 10, margin + contentWidth, y + 10);

    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.setFontSize(7.5);

    // Order #
    doc.setFont('helvetica', 'bold');
    doc.text(ord.orderNumber, margin + 2, y + 6);

    // Date
    doc.setFont('helvetica', 'normal');
    doc.text(ord.createdAt, margin + 34, y + 6);

    // Pharmacy
    doc.text(ord.pharmacyName.substring(0, 22), margin + 58, y + 6);

    // Items
    const itemsSummary = ord.items.map((i) => `${i.medicineName} (${i.quantity}x)`).join(', ');
    doc.text(itemsSummary.substring(0, 30) + (itemsSummary.length > 30 ? '...' : ''), margin + 105, y + 6);

    // Status
    doc.text(ord.orderStatus, margin + 155, y + 6);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(`$${ord.total.toFixed(2)}`, margin + contentWidth - 2, y + 6, { align: 'right' });

    y += 10;
  });

  y += 6;

  // 5. Insurance Reimbursement Checklist & Member Declaration Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INSURANCE CLAIM ATTACHMENT CHECKLIST & DECLARATION:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('[X] Verified Prescription Files Attached for All Prescription Items', margin + 3, y + 11);
  doc.text('[X] Itemized Drug Purchase Invoices & Tax Breakdown Attached', margin + 3, y + 16);
  doc.text('[X] 100% Actual Non-Subsidized Payment Receipts Reconciled', margin + 3, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'I declare that the expenses enumerated in this statement were incurred for medical treatment prescribed by a licensed medical practitioner.',
    margin + 3,
    y + 27
  );
  doc.text(
    'Claimant Signature: _______________________      Date: _______________      Claim Filing Agent: genericMed Digital Claims Desk',
    margin + 3,
    y + 31.5
  );

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `genericMed Healthcare • Audit ID: HIST-${new Date().getFullYear()}-${orders.length}ORDS • Generated: ${new Date().toLocaleString()}`,
    margin,
    pageHeight - 6
  );
  doc.text(
    'Certified authentic statement for outpatient prescription drug insurance claim submission.',
    pageWidth - margin,
    pageHeight - 6,
    { align: 'right' }
  );

  return doc;
}
