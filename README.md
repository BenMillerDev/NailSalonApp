# 💅 NailSalonApp

A full-stack mobile booking platform for independent nail technicians. Built with React Native (Expo) for the owner's iOS app and a React web app for customer bookings — no app store download required for clients.

> **Status:** Active development — MVP complete and functional

---

## 📱 Overview

NailSalonApp lets a nail tech run her entire booking operation from her iPhone. Customers get a clean web-based booking page they can access from any link — no account, no download needed.

### Owner App (iOS)
- Manage services, pricing, and availability
- View and manage bookings in real time
- Track client history and fill due dates
- See revenue analytics and booking trends
- Share a booking link with clients in one tap

### Customer Booking Page (Web)
- Select services, add-ons, nail shape and length
- Pick from available dates and times only
- Booking confirmation with full summary
- Hosted on Firebase — accessible from any device

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| iOS App | React Native + Expo (TypeScript) |
| Navigation | Expo Router (file-based) |
| Customer Web | React (TypeScript) |
| Backend | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| State | React Context + Custom Hooks |

---

## 📁 Project Structure

```
NailSalonApp/
├── app/                          # Expo file-based routing
│   ├── (auth)/
│   │   ├── login.tsx             # Email/password + Google sign-in
│   │   └── signup.tsx            # Owner account creation
│   ├── (owner)/
│   │   ├── _layout.tsx           # Bottom tab navigation
│   │   ├── dashboard.tsx         # Main dashboard with live stats
│   │   ├── appointments.tsx      # Booking management
│   │   ├── clients.tsx           # Client list with search
│   │   ├── client-profile.tsx    # Individual client profile
│   │   ├── services.tsx          # Service management
│   │   ├── service-form.tsx      # Add/edit service form
│   │   ├── availability.tsx      # Weekly schedule setup
│   │   └── settings.tsx          # Profile + booking link
│   ├── _layout.tsx               # Root layout with auth redirects
│   └── index.tsx                 # Entry point
│
├── src/
│   ├── components/
│   │   └── owner/
│   │       ├── AnalyticsSection.tsx    # Revenue charts + stats
│   │       └── OnboardingChecklist.tsx # New owner setup guide
│   ├── context/
│   │   └── AuthContext.tsx        # Firebase auth state
│   ├── hooks/
│   │   ├── useAnalytics.ts        # Revenue and booking analytics
│   │   ├── useAppointments.ts     # Real-time appointment listeners
│   │   ├── useAvailability.ts     # Availability CRUD
│   │   ├── useClients.ts          # Client profiles from bookings
│   │   ├── useOnboarding.ts       # Onboarding progress tracking
│   │   └── useServices.ts         # Service CRUD
│   ├── services/
│   │   ├── appointments.ts        # Firestore appointment functions
│   │   ├── availability.ts        # Firestore availability functions
│   │   ├── firebase.ts            # Firebase initialization
│   │   ├── googleSignIn.ts        # Google Sign-In wrapper
│   │   ├── googleSignInMock.ts    # Expo Go compatibility mock
│   │   ├── notifications.ts       # Push notification setup
│   │   └── services.ts            # Firestore service functions
│   ├── utils/
│   │   ├── timeSlots.ts           # Core booking algorithm
│   │   ├── dateHelpers.ts         # Date formatting utilities
│   │   ├── formatters.ts          # Price, phone, text formatters
│   │   └── responsive.ts          # Tablet/phone responsive helpers
│   └── constants/
│       ├── colors.ts              # App color palette
│       ├── theme.ts               # Typography, spacing, shadows
│       └── services.ts            # Default service catalog
│
└── booking-web/                   # Customer booking web app
    └── src/
        ├── components/
        │   ├── ProgressBar.tsx    # 4-step booking progress
        │   ├── ServiceSelector.tsx # Service + add-on picker
        │   ├── DatePicker.tsx     # Calendar with availability
        │   ├── TimePicker.tsx     # Available time slots
        │   ├── CustomerForm.tsx   # Contact info + confirmation
        │   └── Confirmation.tsx   # Booking success screen
        ├── hooks/
        │   └── useBooking.ts      # Full booking flow state
        ├── services/
        │   └── bookingService.ts  # Firebase reads/writes
        ├── utils/
        │   ├── timeSlots.ts       # Time slot algorithm (web)
        │   └── formatters.ts      # Display formatting
        ├── types/
        │   └── index.ts           # Shared TypeScript interfaces
        └── firebase.ts            # Firebase web initialization
```

---

## ✨ Key Features

### 🕐 Smart Time Slot Algorithm
The core of the booking system lives in [`src/utils/timeSlots.ts`](src/utils/timeSlots.ts). It calculates available appointment slots by:
- Reading the owner's weekly schedule
- Checking existing bookings for conflicts
- Adding configurable buffer time between appointments
- Blocking manually blocked dates
- Filtering past slots and requiring 1-hour advance notice

### ⚡ Real-Time Updates
The [`useAppointments`](src/hooks/useAppointments.ts) hook uses Firestore `onSnapshot` listeners instead of one-time reads. New bookings appear on the owner's dashboard instantly the moment a customer books — no refresh needed.

### 📊 Analytics Dashboard
[`AnalyticsSection.tsx`](src/components/owner/AnalyticsSection.tsx) and [`useAnalytics.ts`](src/hooks/useAnalytics.ts) provide revenue charts, top services, busiest days, and completion rates — all computed client-side from Firestore data with This Week / This Month / This Year filtering.

### 👥 Auto-Generated Client Profiles
[`useClients.ts`](src/hooks/useClients.ts) builds client profiles automatically from booking history — no extra data entry. Each profile shows total visits, total spent, preferred services, fill due dates, and owner notes.

### 📅 Availability System
[`availability.tsx`](app/(owner)/availability.tsx) lets the owner set weekly hours with an inline time picker, configure buffer time between appointments, and block specific dates. All changes feed directly into the time slot algorithm.

---

## 🗄 Firestore Data Model

```
users/{uid}
  uid, email, name, salonName, phone, role, createdAt

services/{serviceId}
  ownerId, category, name, description, duration, price, addOns, isActive

availability/{ownerId}
  monday...sunday: { isOpen, startTime, endTime }
  bufferTime, maxBookingsPerDay, blockedDates[]

appointments/{appointmentId}
  ownerId, clientName, clientEmail, clientPhone
  services[], addOns[], startTime, endTime
  totalDuration, totalPrice, status, nailShape, nailLength, notes

clientNotes/{ownerId_clientEmail}
  ownerId, clientEmail, notes, updatedAt

onboarding/{ownerId}
  isDismissed, hasSharedLink
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo`
- Firebase project with Firestore and Authentication enabled

### iOS App Setup

```bash
git clone https://github.com/yourusername/NailSalonApp.git
cd NailSalonApp
npm install
```

Create a `.env` file in the root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

```bash
npx expo start
```

### Customer Booking Web App Setup

```bash
cd booking-web
npm install
```

Create a `.env` file in `booking-web/`:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

```bash
npm start
```

Access the booking page at:
```
http://localhost:3000?owner=YOUR_FIREBASE_UID
```

### Deploy Booking Web App

```bash
cd ..
npm run build --prefix booking-web
firebase deploy --only hosting
```

---

## 🔒 Firebase Security

Firestore rules are currently in test mode (open read/write). Before production deployment, rules should be updated to:
- Only allow owners to read/write their own data
- Allow public read access to services and availability for booking
- Allow public write access to appointments collection for customer bookings

---

## 🗺 Roadmap

- [ ] Push notifications for new bookings (requires Apple Developer account)
- [ ] SMS confirmations via Twilio
- [ ] Automated fill reminders
- [ ] Stripe deposit payments
- [ ] Multi-staff support
- [ ] Before/after photo gallery
- [ ] Custom domain for booking page

---

## 🛠 Built With

- [Expo](https://expo.dev) — React Native framework
- [Firebase](https://firebase.google.com) — Backend and hosting
- [Expo Router](https://expo.github.io/router) — File-based navigation
- [date-fns](https://date-fns.org) — Date manipulation
- [expo-clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/) — Clipboard access
