# Add Flexible Payment System to MediAI

## Problem
Currently, `paymentStatus` is auto-set to `paid` when a doctor marks an appointment as `completed`. No real payment flow exists.

## Proposed Solution — Fully Flexible Payments

Payment is **decoupled from appointment status**. Either party can act at any time:

| Who | What they can do | When |
|-----|-----------------|------|
| **Patient** | Pay online (Card / UPI / Net Banking) | Any time after appointment is confirmed — before OR after visit |
| **Doctor** | Mark cash received (offline) | Any time — when patient pays at clinic |
| **Doctor** | Request online payment from patient | Any time — sends a nudge to patient |

### Key Rules
- Appointment status (`confirmed` → `completed`) and payment status (`unpaid` → `paid`) are **independent**
- A completed appointment can still be `unpaid` — patient pays later online, or doctor marks cash later
- A confirmed appointment can already be `paid` — patient pre-pays online before visiting
- Once `paid`, payment cannot be changed (immutable)

> [!IMPORTANT]
> This removes the auto-payment behavior from `updateAppointmentStatus`. Payments only happen through explicit action.

## Proposed Changes

### Backend

#### [MODIFY] [appointmentController.js](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/server/controllers/appointmentController.js)
- **Remove** the auto-payment logic (lines 171-180) that sets `paymentStatus = 'paid'` on completion
- Appointment status and payment status become fully independent

#### [MODIFY] [Payment.js](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/server/models/Payment.js)
- Add `paymentMethod` field: `enum: ['card', 'upi', 'netbanking', 'cash']`, default `'card'`

#### [MODIFY] [paymentController.js](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/server/controllers/paymentController.js)
- Add `demoPayment` controller **(patient role)**:
  - Accepts `appointmentId`, `paymentMethod` (card/upi/netbanking)
  - Validates appointment belongs to the patient and is confirmed OR completed
  - Validates `paymentStatus !== 'paid'` (no double-pay)
  - Creates Payment record with demo IDs, marks appointment as `paid`
- Add `markCashPaid` controller **(doctor role)**:
  - Accepts `appointmentId`
  - Validates appointment belongs to the doctor and is confirmed OR completed
  - Validates `paymentStatus !== 'paid'`
  - Creates Payment record with `paymentMethod: 'cash'`, marks appointment as `paid`

#### [MODIFY] [paymentRoutes.js](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/server/routes/paymentRoutes.js)
- `POST /api/payments/demo-pay` — patient role → `demoPayment`
- `POST /api/payments/mark-cash` — doctor role → `markCashPaid`

---

### Frontend

#### [NEW] [PaymentGateway.tsx](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/pages/dashboard/PaymentGateway.tsx)
Premium demo payment page:
- Appointment summary card (doctor name, date, fee)
- Payment method tabs: **Card** / **UPI** / **Net Banking**
- Card form with demo pre-filled values (4111... / 12/28 / 123)
- UPI form (demo UPI ID input)
- Net Banking (bank selector)
- "Pay ₹XXX" button → loading spinner → success animation
- Redirects back to appointments on success

#### [MODIFY] [PatientAppointments.tsx](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/pages/dashboard/PatientAppointments.tsx)
- Show **"Pay Now"** button on confirmed/completed appointments where `paymentStatus !== 'paid'`
- Show **"Paid ✓"** badge when `paymentStatus === 'paid'`
- "Pay Now" navigates to `/dashboard/patient/payment/:appointmentId`

#### [MODIFY] [DoctorAppointments.tsx](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/pages/dashboard/DoctorAppointments.tsx)
- Show **"Mark Cash Received"** button (💵) on confirmed/completed appointments where `paymentStatus !== 'paid'`
- Show **"Paid ✓"** badge when `paymentStatus === 'paid'` (with method label: Online / Cash)
- Doctor has full control — can mark cash at any point

#### [NEW] [PatientPayments.tsx](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/pages/dashboard/PatientPayments.tsx)
- Payment history page — lists all payments with: doctor name, date, amount, method (Card/UPI/Net Banking/Cash), status

#### [MODIFY] [App.tsx](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/App.tsx)
- Add route: `/dashboard/patient/payment/:appointmentId` → `PaymentGateway`
- Add route: `/dashboard/patient/payments` → `PatientPayments`

#### [MODIFY] [DashboardLayout.tsx](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/components/DashboardLayout.tsx)
- Add "Payments" to `patientNav` (icon: `CreditCard`)

#### [MODIFY] [api.ts](file:///m:/TE/Sem%206/Mini%20Project/MediAI---AI-Powered-Appointment-Booking-for-Hospitals-main/src/lib/api.ts)
- Add `demoPay(appointmentId, paymentMethod)` to `paymentsAPI`
- Add `markCashPaid(appointmentId)` to `paymentsAPI`

## Verification Plan

### Manual Verification
1. Patient books → doctor confirms → patient sees "Pay Now" → pays online → "Paid ✓" appears
2. Patient books → doctor confirms → patient visits → doctor clicks "Mark Cash Received" → both see "Paid ✓"
3. Doctor marks completed WITHOUT payment → appointment shows completed + unpaid → patient can still pay online later
4. Doctor marks completed → then marks cash received → works fine
5. Try paying an already-paid appointment → should be rejected
6. Check Payments page — both online and cash payments appear with correct labels
