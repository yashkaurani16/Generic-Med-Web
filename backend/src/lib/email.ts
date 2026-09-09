import { Resend } from 'resend';

// Lazy-initialize Resend client only if API key is configured
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'genericMed <noreply@genericmed.in>';

// ─── Email Helpers ────────────────────────────────────────────────────────

export interface OrderEmailData {
  orderNumber: string;
  total: number;
  items: { medicineName: string; quantity: number; totalPrice: number }[];
  deliveryAddress: string;
  pharmacyName: string;
  trackingNumber?: string;
  patientName: string;
  patientEmail: string;
}

export interface PrescriptionEmailData {
  prescriptionId: string;
  status: 'Accepted' | 'Rejected';
  doctorName: string;
  patientName: string;
  patientEmail: string;
  rejectionReason?: string;
}

/**
 * Send order confirmation email after successful checkout.
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL STUB] Order confirmation → ${data.patientEmail} for order ${data.orderNumber}`);
    return;
  }

  const itemsList = data.items
    .map((i) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #e4e4e7">${i.medicineName}</td>
      <td style="padding:8px;border-bottom:1px solid #e4e4e7;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e4e4e7;text-align:right">₹${i.totalPrice.toFixed(2)}</td>
    </tr>`)
    .join('');

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.patientEmail,
    subject: `✅ Order Confirmed — ${data.orderNumber} | genericMed`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 24px;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">💊</div>
      <h1 style="color:#fff;margin:0;font-size:24px">Order Confirmed!</h1>
      <p style="color:#a7f3d0;margin:8px 0 0">Your medicines are on their way</p>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#71717a;font-size:14px;margin:0 0 8px">Hello ${data.patientName},</p>
      <p style="color:#18181b;font-size:16px;margin:0 0 24px">
        Your order <strong>${data.orderNumber}</strong> has been confirmed and is being prepared by 
        <strong>${data.pharmacyName}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#f4f4f5">
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#71717a;font-weight:600">MEDICINE</th>
            <th style="padding:10px 8px;text-align:center;font-size:12px;color:#71717a;font-weight:600">QTY</th>
            <th style="padding:10px 8px;text-align:right;font-size:12px;color:#71717a;font-weight:600">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 8px;font-weight:700;color:#18181b">Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:700;color:#059669;font-size:18px">₹${data.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#166534">
          📦 <strong>Tracking Number:</strong> ${data.trackingNumber || 'Will be updated shortly'}<br>
          🏠 <strong>Delivery to:</strong> ${data.deliveryAddress}
        </p>
      </div>
      <p style="color:#71717a;font-size:13px;text-align:center;margin:0">
        Track your order at <a href="https://genericmed.in/orders" style="color:#059669">genericmed.in/orders</a>
      </p>
    </div>
    <div style="background:#f4f4f5;padding:16px 24px;text-align:center">
      <p style="color:#a1a1aa;font-size:12px;margin:0">genericMed · Verified Generic Medicine Platform · India</p>
    </div>
  </div>
</body>
</html>`,
  });

  console.log(`[EMAIL] Order confirmation sent → ${data.patientEmail}`);
}

/**
 * Send prescription review status notification.
 */
export async function sendPrescriptionStatus(data: PrescriptionEmailData): Promise<void> {
  const resend = getResend();
  const isAccepted = data.status === 'Accepted';

  if (!resend) {
    console.log(`[EMAIL STUB] Prescription ${data.status} → ${data.patientEmail}`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.patientEmail,
    subject: `${isAccepted ? '✅ Prescription Verified' : '❌ Prescription Rejected'} | genericMed`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:${isAccepted ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#dc2626,#ef4444)'};padding:32px 24px;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">${isAccepted ? '✅' : '❌'}</div>
      <h1 style="color:#fff;margin:0;font-size:22px">Prescription ${data.status}</h1>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#18181b;font-size:15px">Hello ${data.patientName},</p>
      <p style="color:#18181b">
        Your prescription from <strong>${data.doctorName}</strong> has been 
        <strong>${isAccepted ? 'verified and approved' : 'rejected'}</strong> by our licensed pharmacist team.
      </p>
      ${!isAccepted && data.rejectionReason ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:0;color:#991b1b;font-size:13px">
          <strong>Reason:</strong> ${data.rejectionReason}
        </p>
      </div>
      <p style="color:#71717a;font-size:13px">
        Please upload a clearer or updated prescription to proceed with your order.
      </p>` : `
      <p style="color:#166534;font-size:14px">
        ✅ You can now add prescription medicines to your cart and proceed to checkout.
      </p>`}
      <div style="text-align:center;margin-top:24px">
        <a href="https://genericmed.in/prescriptions" 
           style="background:#059669;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
          View My Prescriptions
        </a>
      </div>
    </div>
    <div style="background:#f4f4f5;padding:16px 24px;text-align:center">
      <p style="color:#a1a1aa;font-size:12px;margin:0">genericMed · Verified Generic Medicine Platform</p>
    </div>
  </div>
</body>
</html>`,
  });

  console.log(`[EMAIL] Prescription ${data.status} sent → ${data.patientEmail}`);
}

/**
 * Send welcome email after registration.
 */
export async function sendWelcomeEmail(name: string, email: string, role: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL STUB] Welcome → ${email} (${role})`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to genericMed, ${name}! 💊`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#059669,#10b981);padding:40px 24px;text-align:center">
      <div style="font-size:56px">💊</div>
      <h1 style="color:#fff;margin:8px 0 0">Welcome to genericMed</h1>
      <p style="color:#a7f3d0;margin:8px 0 0">India's trusted generic medicine platform</p>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#18181b;font-size:16px">Hello ${name},</p>
      <p style="color:#71717a">Your ${role} account is ready. Here's what you can do:</p>
      <ul style="color:#18181b;line-height:2;padding-left:20px">
        <li>🔍 Compare generic medicine prices across verified pharmacies</li>
        <li>📋 Upload prescriptions for pharmacist verification</li>
        <li>🛒 Order medicines with real-time price tracking</li>
        <li>📦 Track deliveries with full status history</li>
      </ul>
      <div style="text-align:center;margin-top:28px">
        <a href="https://genericmed.in" style="background:#059669;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">
          Start Comparing Prices →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
  });
}

/**
 * Send delivery status update email.
 */
export async function sendDeliveryUpdate(data: {
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  patientName: string;
  patientEmail: string;
  note?: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL STUB] Order ${data.orderNumber} status -> ${data.status} for ${data.patientEmail}`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.patientEmail,
    subject: `📦 Order Update: ${data.status} — ${data.orderNumber} | genericMed`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#0284c7,#0ea5e9);padding:32px 24px;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">🚚</div>
      <h1 style="color:#fff;margin:0;font-size:22px">Order Status: ${data.status}</h1>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#18181b;font-size:15px">Hello ${data.patientName},</p>
      <p style="color:#18181b">Your order <strong>${data.orderNumber}</strong> has been updated to: <strong>${data.status}</strong>.</p>
      ${data.trackingNumber ? `<p style="color:#0369a1;background:#f0f9ff;padding:12px;border-radius:8px">Tracking ID: <strong>${data.trackingNumber}</strong></p>` : ''}
      ${data.note ? `<p style="color:#64748b;font-size:13px">Note from pharmacy: ${data.note}</p>` : ''}
      <div style="text-align:center;margin-top:24px">
        <a href="https://genericmed.in/orders" style="background:#0284c7;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
          Track Your Delivery
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
  });

  console.log(`[EMAIL] Order status update sent -> ${data.patientEmail}`);
}
